import { NextResponse } from "next/server";
import { requireActivePlan } from "@/lib/access";
import { firstMessageFor, langBridgeFor, supportStepFor } from "@/lib/voice/agent-prompt";
import { AI_LIMITS, todayInTimezone } from "@/lib/ai/limits";
import { voiceById, VOICE_OPTIONS } from "@/lib/ai/voices";
import { TOPICS, normalizeTopicId, topicById, type Topic } from "@/lib/ai/topics";
import { buildSnapshot, decide } from "@/lib/coach";
import { buildAhuContext, stateLineTr } from "@/lib/coach/context";
import { focusReasonText } from "@/lib/coach/templates";
import { examFormat } from "@/lib/exam/format";
import { buildKonusmaPlan, konusmaScript, type KonusmaSessionPlan } from "@/lib/voice/konusma-exam";
import { assessSpeakingLevel, type SpeakingAssessment } from "@/lib/voice/speaking-level";
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

type Mode = "free" | "bolum1" | "bolum2" | "bolum3" | "full" | "diagnostic_speaking" | "foundation" | "plan" | "sinav";

/**
 * Режим «Фундамент» (Фаза 7.8, языковой протокол v2): для A0-A2 задачи
 * ужимаются до микро-размера, экзамен/баллы НЕ упоминаются — рано.
 * ЯЗЫКОВЫХ указаний здесь больше нет: какой язык звучит — решает лестница
 * поддержки в промпте агента (DESTEK MERDİVENİ), иначе режим и лестница
 * противоречили друг другу (баг «Ahu ушла в русский насовсем»).
 */
const FOUNDATION_BY_LEVEL: Record<"A0" | "A1" | "A2", string> = {
  A0: "TEMEL MOD (A0): görevler MİKRO boyutta — tek kelime veya 2-3 kelimelik kalıp tekrarı («Söyle: Merhaba»). Sınavdan, puandan, kriterden HİÇ bahsetme. Sustuğunda sabırla bekle — sessizlik normaldir. Her denemesini kutla; sadece telaffuzu nazikçe düzelt, dil bilgisine dokunma.",
  A1: "TEMEL MOD (A1): kısa kalıp cevaplar hedefle («Benim adım …», «Ben … yaşındayım»). Kalıpla cevap vermesi normaldir ve ilerlemedir. Sınav/puan konuşma. Sustuğunda bekle, tekrar iste, yavaşla. Cesaretlendir; dil bilgisi eleştirisi yok.",
  A2: "TEMEL MOD (A2): basit günlük konular, kısa sorular. Sınav formatı yok — amaç konuşma cesareti. Sustuğunda bekle; hataları ders bitmeden nazikçe, tek tek düzelt.",
};

// Injected into the agent prompt as {{mode_instructions}} (Turkish — the
// agent thinks in Turkish; per-part framing mirrors TÖMER Konuşma).
// Блок 6 (20.07.2026): режимы РЕАЛЬНО разные — у монолога время на
// подготовку и запрет перебивать, у мнения обязательный контраргумент,
// у полного экзамена тайминг и тон экзаменатора.
// sinav не здесь: его инструкции — сгенерированный сценарий konusmaScript()
const MODE_INSTRUCTIONS: Record<Exclude<Mode, "foundation" | "plan" | "sinav">, string> = {
  free: "Serbest sohbet, yapı YOK: öğrencinin ilgi alanlarına ve günlük hayatına dair DOĞAL bir konuşma yürüt (dosyadaki bilgilerden yararlan). Ders odağındaki yapıları sohbete GİZLİCE işle — sınav havası yaratma.",
  diagnostic_speaking:
    "2 dakikalık KONUŞMA SEVİYE TESPİTİ: kısa tanışma (ad, nereden), 2-3 basit günlük soru, sonra kısa bir konu (ailen veya şehrin). Cevaplar çok kısa olabilir — sabırlı ol, sustuğunda bekle, düzeltme yapma; amaç ders değil, seviyeyi duymak.",
  bolum1:
    "TÖMER Konuşma Bölüm 1 (karşılıklı konuşma, ~2 dakika): SEN sorarsın, öğrenci cevaplar — kendini tanıtma, aile, günlük rutin, hobiler. Kısa, net sorular; monolog isteme, tartışma açma — bu bölüm diyalog bölümüdür.",
  bolum2:
    "TÖMER Konuşma Bölüm 2 (sözlü anlatım, ~3 dakika): öğrenciye SOMUT bir konu ver (ör. 'şehrini anlat', 'unutamadığın bir anını anlat') ve HAZIRLIK SÜRESİ tanı: «30 saniye düşün, hazır olunca başla» de ve SUS. Anlatmaya başlayınca SÖZÜNÜ KESME — bu bölümün özü kesintisiz konuşmadır: duraklarsa sadece kısa cesaretlendirme ver («devam et, dinliyorum») ve tekrar sus; düzeltmeleri anlatım BİTENE KADAR sakla. Bittiğinde 1-2 takip sorusu sor, sonra kısa geri bildirim ver.",
  bolum3:
    "TÖMER Konuşma Bölüm 3 (görüş bildirme, ~3 dakika): TARTIŞMALI bir soru sor (teknoloji, şehir/köy, eğitim, gelenek/modernlik) ve görüşünü gerekçelendirmesini iste. Görüş bildirdikten sonra HER SEFERİNDE bir KARŞI ARGÜMAN sun ve cevaplamasını iste — nazik ama ısrarcı: sınavda ölçülen şey görüşünü SAVUNABİLMEKTİR. Kolayca hemfikir olma.",
  full: "Tam TÖMER Konuşma simülasyonu — SINAV DEĞERLENDİRİCİSİ tonu: resmî ama destekleyici. Sırasıyla ve SÜREYE UYARAK: Bölüm 1 karşılıklı konuşma ~2 dk; Bölüm 2 sözlü anlatım ~3 dk (30 sn hazırlık ver, anlatımı KESME); Bölüm 3 görüş bildirme ~3 dk (karşı argüman sun). Her bölüm geçişini duyur («Şimdi Bölüm 2'ye geçiyoruz»). Ders sohbetine sapma — bu bir sınav provasıdır.",
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
  const requestedMode: Mode =
    body.mode === "foundation" || body.mode === "plan" || body.mode === "sinav" || (body.mode && body.mode in MODE_INSTRUCTIONS)
      ? (body.mode as Mode)
      : "free";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  // платная фича (самые дорогие минуты): только активная подписка/триал.
  // end/wrap НЕ гейтятся — биллинг-сеттл начатого урока обязан отработать.
  // Исключение — diagnostic_speaking (Фаза 4): бесплатная 2-минутная проба
  // уровня говорения, СТРОГО одна на юзера — говорение обычно слабейший
  // навык, и без него план строится вслепую (диагностика бесплатна by design)
  if (requestedMode === "diagnostic_speaking") {
    const adminForDiag = createAdminClient();
    if (!adminForDiag) return NextResponse.json({ error: "voice_unavailable" }, { status: 503 });
    const { count } = await adminForDiag
      .from("voice_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if ((count ?? 0) > 0) return NextResponse.json({ error: "diag_used" }, { status: 403 });
  } else {
    const access = await requireActivePlan(supabase);
    if (!access.ok) return NextResponse.json({ error: access.reason }, { status: access.status });
  }

  const [{ data: profile }, { data: weak }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, handle, timezone, preferred_voice, current_level, target_level, quiz_result, exam_format")
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

  // Режим урока (7.7-7.8): «plan» (урок из плана дня) решается СЕРВЕРОМ по
  // уровню — A0-A2 получают «Фундамент» (экзамен не упоминается), B1+ —
  // полный экзаменационный формат. Явный foundation тоже штампуется уровнем.
  const foundationLevel = (["A0", "A1", "A2"].includes(level) ? level : null) as "A0" | "A1" | "A2" | null;
  const mode: string =
    requestedMode === "plan"
      ? foundationLevel
        ? "foundation"
        : "full"
      : requestedMode === "foundation" && !foundationLevel
        ? "free" // B1+ явного фундамента не получает — он ему вреден
        : requestedMode;

  // Konuşma-симуляция (Блок 5): уровень — SPEAKING per-skill, не глобальный
  // («B1 по чтению и A1 по говорению — пускать в B1-говорение значит
  // завалить»); сценарий сэмплится из банка с анти-повтором по прошлой
  // симуляции; новичков (A0/A1 без speaking-данных или score ниже A2)
  // сервер гейтит сам — клиентский гейт обходится прямым вызовом API.
  let sinavPlan: KonusmaSessionPlan | null = null;
  let sinavSource: SpeakingAssessment | null = null;
  if (mode === "sinav") {
    const adminForSinav = createAdminClient();
    if (!adminForSinav) {
      await releaseSlot();
      return NextResponse.json({ error: "voice_unavailable" }, { status: 503 });
    }
    sinavSource = await assessSpeakingLevel(adminForSinav, user.id, level);
    if (sinavSource.kind === "gate") {
      await releaseSlot();
      return NextResponse.json({ error: "speaking_gate" }, { status: 403 });
    }
    let excludeIds: string[] = [];
    const { data: pastSinav } = await adminForSinav
      .from("voice_sessions")
      .select("transcript")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(5);
    for (const row of pastSinav ?? []) {
      const ids = (row.transcript as { konusma_used_ids?: string } | null)?.konusma_used_ids;
      if (ids) {
        excludeIds = String(ids).split(",").filter(Boolean);
        break;
      }
    }
    sinavPlan = buildKonusmaPlan({
      level: sinavSource.level,
      format: examFormat((profile?.exam_format as string | null) ?? null),
      seed: (Date.now() ^ (user.id.charCodeAt(2) << 16)) >>> 0,
      excludeIds,
    });
  }
  // Лестница поддержки применяется ПОВЕРХ ЛЮБОГО режима для A0-A2 (живой
  // баг 19.07: студент сам выбрал Bölüm 2 → Фундамент не применился, Ahu
  // дала «говори 3 минуты» новичку и продолжала по-турецки под его русский)
  const modeInstructions =
    mode === "sinav" && sinavPlan
      ? konusmaScript(sinavPlan) // симуляция: сценарий целиком, БЕЗ DESTEK-приставки
      : mode === "foundation"
      ? FOUNDATION_BY_LEVEL[foundationLevel ?? "A2"]
      : foundationLevel
        ? `${MODE_INSTRUCTIONS[mode as Exclude<Mode, "foundation" | "plan" | "sinav">]}\n\nDESTEK SEVİYESİ (ZORUNLU): ${FOUNDATION_BY_LEVEL[foundationLevel]} MOD İSKELETİNİ MUTLAKA KORU — Bölüm 2'de yine küçük bir anlatım, Bölüm 3'te yine görüş, rol oyununda yine rol olmalı; modları birbirine BENZETME. Sadece DİLİ ve UZUNLUĞU küçült: basit kelimeler, kısa görevler (2-3 cümlelik hedef), uzun monolog isteme.`
        : MODE_INSTRUCTIONS[mode as Exclude<Mode, "foundation" | "plan" | "sinav">];
  // подсказки-заготовки на экран (A0-A1): студент может ПРОЧИТАТЬ ответ
  const foundationHints =
    mode === "foundation" && (foundationLevel === "A0" || foundationLevel === "A1")
      ? ["Benim adım …", "Ben … yaşındayım", "… şehrinde yaşıyorum", "Evet · Hayır · Biraz", "Anlamadım, tekrar eder misiniz?"]
      : [];
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
  // полное досье студента для агента (Блок 2): тот же контекст, что видят
  // чат и бриф — единая память Ahu; снапшот строится ВСЕГДА (не только для
  // фокуса), сбой ядра не срывает урок — досье честно пустеет
  let dossier = "";
  try {
    const snapshot = await buildSnapshot(supabase, user.id, { kkNative: body.feedbackLang === "kk" });
    const decision = decide(snapshot);
    dossier = buildAhuContext(snapshot, decision, "voice");
    if (requested.length === 0) {
      coachFocus = decision.focusTopics
        .map((id) => topicById(id))
        .filter((t): t is Topic => !!t && t.id !== "other")
        .slice(0, 3);
      focusReason = stateLineTr(decision.state);
      const loc = (["ru", "en", "tr", "kk"].includes(body.feedbackLang ?? "") ? body.feedbackLang : "en") as
        | "ru" | "en" | "tr" | "kk";
      focusReasonLocalized = focusReasonText(snapshot, decision, loc);
    }
  } catch (e) {
    console.error("[voice] coach snapshot failed, weak-topics fallback:", e instanceof Error ? e.message : e);
  }
  // ротация тем (живой баг: темы повторялись урок за уроком) — темы,
  // отработанные в ПОСЛЕДНЕМ разобранном уроке, уходят в конец очереди;
  // если других слабых нет — честно возвращаются (лучше повтор, чем пусто)
  let lastWorked = new Set<string>();
  try {
    const { data: lastSession } = await supabase
      .from("voice_sessions")
      .select("report")
      .eq("user_id", user.id)
      .not("report", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const worked = (lastSession?.report as { topics_worked?: string[] } | null)?.topics_worked;
    if (Array.isArray(worked)) lastWorked = new Set(worked);
  } catch {
    /* ротация — best-effort */
  }
  const rotate = (list: Topic[]): Topic[] =>
    lastWorked.size ? [...list.filter((t) => !lastWorked.has(t.id)), ...list.filter((t) => lastWorked.has(t.id))] : list;

  const focus: Topic[] = (requested.length
    ? requested // явный deep-link из плана не ротируем — студент пришёл за этим
    : rotate(
        coachFocus.length
          ? coachFocus
          : (weak ?? [])
              .map((w) => topicById(w.topic as string))
              .filter((t): t is Topic => !!t && t.id !== "other"),
      )
  ).slice(0, 3);
  if (focus.length < 3) {
    const levelKey = ["A1", "A2", "B1", "B2", "C1"].includes(level) ? level : "A2";
    const levelTopics = TOPICS.filter((t) => t.level === levelKey && t.id !== "other" && !focus.some((f) => f.id === t.id));
    for (const t of rotate(levelTopics)) {
      if (focus.length >= 3) break;
      focus.push(t);
    }
  }
  const lessonFocusTr = focus.map((t) => t.label.tr).join(", ");

  const baseLeft = a.base_left ?? 0;
  const creditsLeft = a.credits_left ?? 0;
  // проба уровня — жёсткий потолок ~2 минуты (+ запас на прощание агента);
  // симуляция — сумма частей + подготовки + запас на переходы/прощание
  // (C1 ≈14 мин не влезает в обычные 900с)
  const sinavCap = sinavPlan
    ? sinavPlan.partSeconds.reduce((s, p) => s + p, 0) + sinavPlan.prepSeconds.bolum3 + sinavPlan.prepSeconds.bolum4 + 120
    : null;
  const maxSeconds =
    requestedMode === "diagnostic_speaking"
      ? Math.min(180, (baseLeft + creditsLeft) * 60)
      : sinavCap != null
        ? Math.min(sinavCap, 1080, (baseLeft + creditsLeft) * 60)
        : Math.min(900, (baseLeft + creditsLeft) * 60);

  const feedbackLangCode = body.feedbackLang && body.feedbackLang in FEEDBACK_LANG_TR ? body.feedbackLang : "en";

  // диагностика (Блок 4): что реально ушло в сессию — Vercel logs ловят
  // разрыв «клик → агент» за минуту; полный payload каждой сессии лежит в
  // ElevenLabs → conversation → conversation_initiation_client_data
  console.info(
    "[voice] session vars:",
    JSON.stringify({
      requested: body.mode ?? null,
      mode,
      level,
      support: supportStepFor(level, mode),
      focus: focus.map((t) => t.id),
      dossierChars: dossier.length,
      lang: feedbackLangCode,
    }),
  );

  return NextResponse.json({
    conversationToken,
    voiceId: voice.elevenVoiceId,
    maxSeconds,
    allowance: { baseLeft, creditsLeft },
    lessonFocus: focus.map((t) => ({ id: t.id, label: t.label })),
    // «почему эта тема» на языке интерфейса (null = фокус не от ядра)
    lessonFocusReason: focusReasonLocalized,
    // фундамент (7.8): режим после серверного резолва + фразы-заготовки
    resolvedMode: mode,
    foundationHints,
    // уровень — клиенту: баллы разбора показываются только с B1 (Блок 4);
    // resolvedMode недостаточно — A2 мог сам выбрать Bölüm 1
    level,
    // первое сообщение по лестнице/режиму (A0-A1 — на языке студента);
    // клиент шлёт его через override (разрешён скриптом sync-voice-agent)
    firstMessage: firstMessageFor({
      level,
      mode,
      name: (profile?.full_name as string | null)?.split(" ")[0] ?? "öğrenci",
      locale: feedbackLangCode as "ru" | "en" | "tr" | "kk",
    }),
    dynamicVariables: {
      user_id: user.id, // ownership check at settlement
      student_name: (profile?.full_name as string | null) ?? (profile?.handle as string | null) ?? "öğrenci",
      level,
      // B2 — цель по умолчанию (порог вуза); C1 только если выбран явно
      target_level: (profile?.target_level as string | null) ?? "B2",
      weak_topics: weakTr,
      // симуляция: фокус-темы урока не применяются — экзамен не подстраивается
      lesson_focus: sinavPlan ? "sınav simülasyonu" : lessonFocusTr,
      // почему эти темы — одна TR-строка от ядра агента ({{focus_reason}} в
      // промпте ElevenLabs; пустая строка безопасна, слот просто молчит)
      focus_reason: focusReason,
      lesson_focus_ids: focus.map((t) => t.id).join(","), // read back at settlement for the report
      feedback_lang: FEEDBACK_LANG_TR[feedbackLangCode],
      feedback_lang_code: feedbackLangCode,
      // языковой протокол v2: стартовая ступень лестницы поддержки (агент
      // двигается от неё в обе стороны) + казахский мост (пусто для не-kk)
      support_step: supportStepFor(level, mode),
      lang_bridge: langBridgeFor(feedbackLangCode),
      // полное досье (Блок 2): пустая строка при пустом/упавшем снапшоте —
      // промпт велит агенту молчать о том, чего в досье нет (правило 1.3).
      // Симуляция: досье НЕ подаётся — экзаменатор не знает студента и не
      // ссылается на прошлое (иначе промпт-секции «свяжи с прошлым» сработают)
      student_dossier: sinavPlan
        ? "(sınav simülasyonu — dosya bu oturumda kullanılmaz; geçmişe atıfta bulunma)"
        : dossier || "(henüz veri yok — öğrencinin ilk adımları; geçmişe atıfta bulunma)",
      mode: mode,
      mode_instructions: modeInstructions,
      // read back at settlement → transcript.konusma_used_ids (анти-повтор)
      konusma_used_ids: sinavPlan ? sinavPlan.usedIds.join(",") : "",
    },
    // материалы симуляции для экранных оверлеев (карточки/темы/тайминги)
    ...(sinavPlan && sinavSource?.kind === "level"
      ? {
          konusma: {
            level: sinavPlan.level,
            approx: sinavPlan.approx,
            partSeconds: sinavPlan.partSeconds,
            prepSeconds: sinavPlan.prepSeconds,
            roleACard: sinavPlan.bolum2.roleA.situationTr,
            roleBCard: sinavPlan.bolum2.roleB.situationTr,
            discussion: { topicTr: sinavPlan.bolum3.topicTr, bulletsTr: sinavPlan.bolum3.bulletsTr },
            monologueTopics: sinavPlan.bolum4.map((m) => m.topicTr),
            levelSource: sinavSource.source,
            score20: sinavSource.score20,
          },
        }
      : {}),
  });
}
