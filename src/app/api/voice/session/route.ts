import { NextResponse } from "next/server";
import { AI_LIMITS, todayInTimezone } from "@/lib/ai/limits";
import { voiceById, VOICE_OPTIONS } from "@/lib/ai/voices";
import { TOPICS, normalizeTopicId, topicById, type Topic } from "@/lib/ai/topics";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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

  // student's voice choice: explicit pick > stored preference > default (Ahu)
  const voice = voiceById(
    body.voiceId && VOICE_OPTIONS.some((v) => v.id === body.voiceId)
      ? body.voiceId
      : ((profile?.preferred_voice as string | null) ?? null),
  );
  if (body.voiceId && body.voiceId === voice.id && body.voiceId !== profile?.preferred_voice) {
    void supabase.from("profiles").update({ preferred_voice: voice.id }).eq("id", user.id);
  }

  const conversationToken = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`,
    { headers: { "xi-api-key": apiKey } },
  )
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => d?.token ?? null)
    .catch(() => null);
  if (!conversationToken) {
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
  // weak topics first, topped up with topics of the student's own level so
  // every lesson has a concrete teaching target.
  const requested: Topic[] = (Array.isArray(body.focusTopics) ? body.focusTopics : [])
    .map((id) => topicById(normalizeTopicId(id)))
    .filter((t): t is Topic => !!t && t.id !== "other")
    .slice(0, 3);
  const focus: Topic[] = requested.length
    ? requested
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
    dynamicVariables: {
      user_id: user.id, // ownership check at settlement
      student_name: (profile?.full_name as string | null) ?? (profile?.handle as string | null) ?? "öğrenci",
      level,
      target_level: (profile?.target_level as string | null) ?? "C1",
      weak_topics: weakTr,
      lesson_focus: lessonFocusTr,
      lesson_focus_ids: focus.map((t) => t.id).join(","), // read back at settlement for the report
      feedback_lang: FEEDBACK_LANG_TR[feedbackLangCode],
      feedback_lang_code: feedbackLangCode,
      mode: mode,
      mode_instructions: MODE_INSTRUCTIONS[mode],
    },
  });
}
