import { NextResponse } from "next/server";
import { AI_LIMITS, todayInTimezone } from "@/lib/ai/limits";
import { voiceById, VOICE_OPTIONS } from "@/lib/ai/voices";
import { TOPICS, normalizeTopicId, topicById, type Topic } from "@/lib/ai/topics";
import { buildSnapshot, decide } from "@/lib/coach";
import { stateLineTr } from "@/lib/coach/context";
import { focusReasonText } from "@/lib/coach/templates";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/* ------------------- слоты одновременных уроков (очередь) -------------------
 * ElevenLabs ограничивает число одновременных разговоров на аккаунт.
 * Слоты трекаются в voice_slots (миграция 0008): клейм на старте с TTL
 * (самолечится при упавшей вкладке), освобождение при завершении урока.
 * Все слоты заняты → честный ответ 429 { error: "busy", etaMinutes } —
 * клиент показывает «преподаватель занят, освободится через ~N мин», не ошибку.
 */
const SLOT_TTL_MS = 16 * 60_000; // максимум урока (15 мин) + запас

function maxConcurrent(): number {
  const n = Number(process.env.VOICE_MAX_CONCURRENT ?? 4);
  return Number.isFinite(n) && n >= 0 ? n : 4;
}

type SlotState = { busy: boolean; etaMinutes: number; active: number };

/** Текущее состояние слотов (+ подчистка протухших). excludeUser — свой клейм не считаем. */
async function slotState(excludeUser?: string): Promise<SlotState | null> {
  const admin = createAdminClient();
  if (!admin) return null; // нет service-ключа — не гейтим (деградация в старое поведение)
  const nowIso = new Date().toISOString();
  await admin.from("voice_slots").delete().lt("expires_at", nowIso);
  const { data, error } = await admin.from("voice_slots").select("user_id, expires_at").gt("expires_at", nowIso);
  if (error) return null; // таблицы ещё нет (миграция 0008) — не гейтим
  const active = (data ?? []).filter((s) => s.user_id !== excludeUser);
  const max = maxConcurrent();
  if (active.length < max) return { busy: false, etaMinutes: 0, active: active.length };
  const soonest = active.map((s) => Date.parse(s.expires_at as string)).sort()[0];
  const etaMinutes = soonest ? Math.min(16, Math.max(1, Math.ceil((soonest - Date.now()) / 60_000))) : 2;
  return { busy: true, etaMinutes, active: active.length };
}

/** GET — опрос доступности: клиент в busy-состоянии поллит и оживляет кнопку. */
export async function GET(req: Request) {
  if (!checkRateLimit(`voice-poll:${clientKey(req)}`, 30, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const state = await slotState();
  return NextResponse.json(state ?? { busy: false, etaMinutes: 0, active: 0 });
}

type Mode = "free" | "bolum1" | "bolum2" | "bolum3" | "full";

// Injected into the agent prompt as {{mode_instructions}} (Turkish — the
// agent thinks in Turkish; per-part framing mirrors TÖMER Konuşma).
const MODE_INSTRUCTIONS: Record<Mode, string> = {
  free: "Serbest sohbet: öğrencinin günlük hayatına dair doğal bir konuşma yürüt.",
  bolum1:
    "TÖMER Konuşma Bölüm 1 (karşılıklı konuşma, ~2 dakika): kişisel sorular sor — kendini tanıtma, aile, günlük rutin, hobiler.",
  bolum2:
    "TÖMER Konuşma Bölüm 2 (sözlü anlatım, ~3 dakika): öğrenciye bir konu ver (ör. 'şehrini anlat', 'bir anını anlat'), kesintisiz konuşmasını iste, sonra 1-2 takip sorusu sor.",
  bolum3:
    "TÖMER Konuşma Bölüm 3 (görüş bildirme, ~3 dakika): tartışmalı bir konu ver (teknoloji, şehir/köy, eğitim), görüşünü gerekçelendirmesini iste, karşı argüman sun.",
  full: "Tam TÖMER Konuşma simülasyonu: sırasıyla Bölüm 1 (tanışma), Bölüm 2 (sözlü anlatım) ve Bölüm 3 (görüş bildirme). Bölümler arasında kısa geçiş yap.",
};

const FEEDBACK_LANG_TR: Record<string, string> = { ru: "RUSÇA", en: "İNGİLİZCE", tr: "TÜRKÇE", kk: "KAZAKÇA" };

export async function POST(req: Request) {
  if (!checkRateLimit(`voice:${clientKey(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  if (!apiKey || !agentId) {
    return NextResponse.json({ error: "voice_unavailable" }, { status: 503 });
  }

  let body: { mode?: Mode; feedbackLang?: string; voiceId?: string; focusTopics?: unknown };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const mode: Mode = body.mode && body.mode in MODE_INSTRUCTIONS ? body.mode : "free";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  const [{ data: profile }, { data: weak }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, handle, timezone, preferred_voice, current_level, target_level, quiz_result")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("topic_mastery")
      .select("topic, strength")
      .eq("user_id", user.id)
      .lt("strength", 60)
      .order("strength", { ascending: true })
      .limit(5),
  ]);

  // minute allowance: daily base + purchased credits (server-checked)
  const day = todayInTimezone((profile?.timezone as string | null) ?? null);
  const { data: allowance, error: allowErr } = await supabase.rpc("check_voice_allowance", {
    p_day: day,
    p_daily_base: AI_LIMITS.voice.dailyBaseMinutes,
  });
  if (allowErr) {
    console.error("[voice] allowance failed:", allowErr.message);
    return NextResponse.json({ error: "quota_unavailable" }, { status: 503 });
  }
  const a = allowance as { allowed: boolean; base_left?: number; credits_left?: number };
  if (!a.allowed) {
    return NextResponse.json(
      { error: "no_minutes", baseLeft: a.base_left ?? 0, creditsLeft: a.credits_left ?? 0 },
      { status: 429 },
    );
  }

  // все слоты одновременных уроков заняты → честное «занято» с оценкой ожидания
  const slots = await slotState(user.id);
  if (slots?.busy) {
    return NextResponse.json({ error: "busy", etaMinutes: slots.etaMinutes, active: slots.active }, { status: 429 });
  }
  // клейм слота ДО запроса токена (гонка за последний слот); TTL самолечится
  const adminForSlot = createAdminClient();
  if (adminForSlot) {
    await adminForSlot.from("voice_slots").upsert({
      user_id: user.id,
      claimed_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + SLOT_TTL_MS).toISOString(),
    });
  }
  const releaseSlot = async () => {
    if (adminForSlot) await adminForSlot.from("voice_slots").delete().eq("user_id", user.id);
  };

  // student's voice choice: explicit pick > stored preference > default (Ahu)
  const voice = voiceById(
    body.voiceId && VOICE_OPTIONS.some((v) => v.id === body.voiceId)
      ? body.voiceId
      : ((profile?.preferred_voice as string | null) ?? null),
  );
  if (body.voiceId && body.voiceId === voice.id && body.voiceId !== profile?.preferred_voice) {
    void supabase.from("profiles").update({ preferred_voice: voice.id }).eq("id", user.id);
  }

  const tokenRes = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`,
    { headers: { "xi-api-key": apiKey } },
  ).catch(() => null);
  if (!tokenRes || !tokenRes.ok) {
    await releaseSlot();
    // ElevenLabs сам упёрся в лимит одновременных разговоров → тоже «занято»,
    // а не безликая ошибка (наш счётчик мог недосчитать чужие сессии)
    if (tokenRes?.status === 429) {
      return NextResponse.json({ error: "busy", etaMinutes: 2 }, { status: 429 });
    }
    return NextResponse.json({ error: "voice_unavailable" }, { status: 503 });
  }
  const conversationToken = await tokenRes
    .json()
    .then((d: { token?: string }) => d?.token ?? null)
    .catch(() => null);
  if (!conversationToken) {
    await releaseSlot();
    return NextResponse.json({ error: "voice_unavailable" }, { status: 503 });
  }

  const quiz = (profile?.quiz_result as { level?: string } | null) ?? null;
  const level = (profile?.current_level as string | null) ?? quiz?.level ?? "A2";
  const weakTr =
    (weak ?? [])
      .map((w) => topicById(w.topic as string)?.label.tr)
      .filter(Boolean)
      .join(", ") || "henüz belirlenmedi";

  // Lesson focus (core value). A plan-engine deep link may pin the focus
  // (DESIGN-PLAN-ENGINE §4 p.2) — validated against the registry; otherwise
  // the coach core decides (weak ∩ current route week; DESIGN-COACH §6),
  // with the old weak-topics list as a hard fallback, topped up with topics
  // of the student's own level so every lesson has a concrete target.
  const requested: Topic[] = (Array.isArray(body.focusTopics) ? body.focusTopics : [])
    .map((id) => topicById(normalizeTopicId(id)))
    .filter((t): t is Topic => !!t && t.id !== "other")
    .slice(0, 3);
  let coachFocus: Topic[] = [];
  let focusReason = "";
  let focusReasonLocalized: string | null = null;
  if (requested.length === 0) {
    // best-effort: сбой ядра не имеет права сорвать урок (биллинг/слоты уже пройдены)
    try {
      const snapshot = await buildSnapshot(supabase, user.id, { kkNative: body.feedbackLang === "kk" });
      const decision = decide(snapshot);
      coachFocus = decision.focusTopics
        .map((id) => topicById(id))
        .filter((t): t is Topic => !!t && t.id !== "other")
        .slice(0, 3);
      focusReason = stateLineTr(decision.state);
      const loc = (["ru", "en", "tr", "kk"].includes(body.feedbackLang ?? "") ? body.feedbackLang : "en") as
        | "ru" | "en" | "tr" | "kk";
      focusReasonLocalized = focusReasonText(snapshot, decision, loc);
    } catch (e) {
      console.error("[voice] coach focus failed, weak-topics fallback:", e instanceof Error ? e.message : e);
    }
  }
  const focus: Topic[] = requested.length
    ? requested
    : coachFocus.length
      ? coachFocus
      : (weak ?? [])
          .map((w) => topicById(w.topic as string))
          .filter((t): t is Topic => !!t && t.id !== "other")
          .slice(0, 3);
  if (focus.length < 3) {
    const levelKey = ["A1", "A2", "B1", "B2", "C1"].includes(level) ? level : "A2";
    for (const t of TOPICS) {
      if (focus.length >= 3) break;
      if (t.level === levelKey && t.id !== "other" && !focus.some((f) => f.id === t.id)) focus.push(t);
    }
  }
  const lessonFocusTr = focus.map((t) => t.label.tr).join(", ");

  const baseLeft = a.base_left ?? 0;
  const creditsLeft = a.credits_left ?? 0;
  const maxSeconds = Math.min(900, (baseLeft + creditsLeft) * 60);

  const feedbackLangCode = body.feedbackLang && body.feedbackLang in FEEDBACK_LANG_TR ? body.feedbackLang : "en";

  return NextResponse.json({
    conversationToken,
    voiceId: voice.elevenVoiceId,
    maxSeconds,
    allowance: { baseLeft, creditsLeft },
    lessonFocus: focus.map((t) => ({ id: t.id, label: t.label })),
    // «почему эта тема» на языке интерфейса (null = фокус не от ядра)
    lessonFocusReason: focusReasonLocalized,
    dynamicVariables: {
      user_id: user.id, // ownership check at settlement
      student_name: (profile?.full_name as string | null) ?? (profile?.handle as string | null) ?? "öğrenci",
      level,
      target_level: (profile?.target_level as string | null) ?? "C1",
      weak_topics: weakTr,
      lesson_focus: lessonFocusTr,
      // почему эти темы — одна TR-строка от ядра агента ({{focus_reason}} в
      // промпте ElevenLabs; пустая строка безопасна, слот просто молчит)
      focus_reason: focusReason,
      lesson_focus_ids: focus.map((t) => t.id).join(","), // read back at settlement for the report
      feedback_lang: FEEDBACK_LANG_TR[feedbackLangCode],
      feedback_lang_code: feedbackLangCode,
      mode: mode,
      mode_instructions: MODE_INSTRUCTIONS[mode],
    },
  });
}
