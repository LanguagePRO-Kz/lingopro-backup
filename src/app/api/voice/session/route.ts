import { NextResponse } from "next/server";
import { requireActivePlan } from "@/lib/access";
import { firstMessageFor, langBridgeFor, supportStepFor } from "@/lib/voice/agent-prompt";
import { practiceFirstMessage, practiceLevelStyle } from "@/lib/voice/practice-prompt";
import { billingPeriod, limitFor, todayInTimezone, usageKindFor } from "@/lib/ai/limits";
import { voiceById, VOICE_OPTIONS } from "@/lib/ai/voices";
import { TOPICS, normalizeTopicId, topicById, type Topic } from "@/lib/ai/topics";
import { buildSnapshot, decide } from "@/lib/coach";
import { buildAhuContext, stateLineTr } from "@/lib/coach/context";
import { focusReasonText } from "@/lib/coach/templates";
import { examFormat } from "@/lib/exam/format";
import { buildKonusmaPlan, konusmaScript, type KonusmaSessionPlan } from "@/lib/voice/konusma-exam";
import { assessSpeakingLevel, lessonSpeakingLevel, type SpeakingAssessment } from "@/lib/voice/speaking-level";
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

/**
 * Три голосовых раздела и ничего больше (решение основателя 16.08.2026):
 * practice — болталка, lesson — урок, sinav — Konuşma. `foundation` не
 * запрашивается клиентом: это РЕЗУЛЬТАТ серверного резолва урока для A0-A2.
 * Прежние bolum1/2/3, full и free убраны — выбор режима внутри урока
 * дублировал Konuşma и Практику; урок теперь один, ведёт его досье.
 */
type Mode = "practice" | "lesson" | "sinav" | "diagnostic_speaking" | "foundation";

/**
 * Провайдер голоса на режим (Блок 1 от 16.08.2026). Сейчас всё на ElevenLabs;
 * практика — первый кандидат на переезд: замер (30 сессий) показал, что 77%
 * счёта у ElevenLabs — поминутная платформенная ставка ($0.0794/мин), которая
 * не зависит от промпта. Практике с окном контекста провайдер без такой ставки
 * даёт ~17 ₸/мин против ~45 ₸/мин здесь. Когда Gemini-адаптер будет готов —
 * меняется только эта функция и клиентский слой; остальной роут не трогается.
 */
type VoiceProvider = "elevenlabs" | "gemini";

/** Пусто = все режимы на дефолтном провайдере. Переезд практики: `practice: "gemini"`. */
const PROVIDER_BY_MODE: Partial<Record<Mode, VoiceProvider>> = {};

function providerForMode(mode: Mode): VoiceProvider {
  return PROVIDER_BY_MODE[mode] ?? "elevenlabs";
}

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
// agent thinks in Turkish).
// Один урок вместо шести режимов (16.08.2026): выбор Bölüm 1/2/3 внутри урока
// заставлял студента решать методический вопрос («какой мне сегодня формат?»),
// на который ответ есть только у Ahu — он лежит в досье. Экзаменационные
// форматы целиком ушли в Konuşma (mode=sinav), где им и место.
// sinav не здесь: его инструкции — сгенерированный сценарий konusmaScript()
// practice сюда не входит: у практики свой агент со своим промптом, режимных
// инструкций у неё нет by design (Блок 1).
const MODE_INSTRUCTIONS: Record<"lesson" | "diagnostic_speaking", string> = {
  lesson:
    "DERS (tek biçim — «Bölüm 1/2/3» ayrımı YOK, sınav provası da DEĞİL): dersi SEN yönetirsin, öğrenciye format seçtirme. Dosyadaki bilgilerden ve DERSİN ODAĞINDAKİ yapılardan yola çıkarak doğal bir konuşma kur. Akış: (1) kısa ısınma sorusu, (2) odak yapıyı GEREKTİREN durumlar aç — yapının adını söyleme, kullanmak zorunda kalacağı soruları sor, (3) öğrenci ısındıkça daha uzun anlatım iste («biraz daha anlat», «neden böyle düşünüyorsun?»), (4) konu tükenince aynı odak yapıyı BAŞKA bir bağlamda tekrar dene. Hataları ders boyunca kısa ve nazikçe düzelt, sonra hemen sohbete dön — dil bilgisi dersine girme. Bir önceki dersten bir şey hatırlıyorsan ona atıf yap: bu ders serisi, tek seferlik sohbet değil.",
  diagnostic_speaking:
    "2 dakikalık KONUŞMA SEVİYE TESPİTİ: kısa tanışma (ad, nereden), 2-3 basit günlük soru, sonra kısa bir konu (ailen veya şehrin). Cevaplar çok kısa olabilir — sabırlı ol, sustuğunda bekle, düzeltme yapma; amaç ders değil, seviyeyi duymak.",
};

const FEEDBACK_LANG_TR: Record<string, string> = { ru: "RUSÇA", en: "İNGİLİZCE", tr: "TÜRKÇE", kk: "KAZAKÇA" };

export async function POST(req: Request) {
  if (!checkRateLimit(`voice:${clientKey(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const lessonAgentId = process.env.ELEVENLABS_AGENT_ID;
  if (!apiKey || !lessonAgentId) {
    return NextResponse.json({ error: "voice_unavailable" }, { status: 503 });
  }

  let body: { mode?: Mode; feedbackLang?: string; voiceId?: string; focusTopics?: unknown };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  // Незнакомый режим (старая вкладка со ссылкой ?mode=bolum2, чужой клиент)
  // молча становится уроком — это единственный оставшийся урочный формат.
  const requestedMode: Mode =
    body.mode === "practice" || body.mode === "sinav" || body.mode === "diagnostic_speaking"
      ? body.mode
      : "lesson";

  // ПРАКТИКА идёт на своём агенте: платформа запрещает override промпта, а
  // разрешать его нельзя — минимальный промпт ушёл бы на клиент, где его можно
  // подменить. Нет агента практики → честный 503, а не тихий откат на урочный
  // (иначе болталка молча стоила бы как урок — правило 1.3).
  const isPractice = requestedMode === "practice";
  const practiceAgentId = process.env.ELEVENLABS_PRACTICE_AGENT_ID;
  if (isPractice && !practiceAgentId) {
    console.error("[voice] ELEVENLABS_PRACTICE_AGENT_ID не задан — практика недоступна");
    return NextResponse.json({ error: "voice_unavailable" }, { status: 503 });
  }
  const agentId = isPractice ? (practiceAgentId as string) : lessonAgentId;

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

  // Практике слабые темы не нужны — у неё нет фокуса урока by design.
  type WeakRow = { topic: string; strength: number };
  const [{ data: profile }, weakRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, handle, timezone, preferred_voice, current_level, target_level, quiz_result, exam_format, plan, plan_expires_at")
      .eq("id", user.id)
      .maybeSingle(),
    isPractice
      ? Promise.resolve({ data: null as WeakRow[] | null })
      : supabase
          .from("topic_mastery")
          .select("topic, strength")
          .eq("user_id", user.id)
          .lt("strength", 60)
          .order("strength", { ascending: true })
          .limit(5),
  ]);
  const weak = weakRes.data as WeakRow[] | null;

  /* Лимит по ВИДУ занятия (Блок 4): практика — минуты, урок и экзамен —
   * штуки, у каждого свой счётчик. Раньше счётчик был один на всё, и болталка
   * съедала минуты, отложенные под уроки. Пробе уровня лимит не нужен —
   * она бесплатна и одна на студента. */
  const day = todayInTimezone((profile?.timezone as string | null) ?? null);
  const period = billingPeriod((profile?.plan_expires_at as string | null) ?? null, new Date(), (profile?.timezone as string | null) ?? null);
  const usageKind = usageKindFor(requestedMode);
  const limits = usageKind ? limitFor(usageKind, (profile?.plan as string | null) ?? null) : null;
  type Allowance = { allowed: boolean; daily_left?: number | null; monthly_left?: number; credits_left?: number };
  let a: Allowance = { allowed: true, daily_left: null, monthly_left: 0, credits_left: 0 };
  if (usageKind && limits) {
    const { data: allowance, error: allowErr } = await supabase.rpc("check_usage_allowance", {
      p_kind: usageKind,
      p_day: day,
      p_period: period,
      p_daily: limits.daily,
      p_monthly: limits.monthly,
    });
    if (allowErr) {
      console.error("[voice] allowance failed:", allowErr.message);
      return NextResponse.json({ error: "quota_unavailable" }, { status: 503 });
    }
    a = allowance as Allowance;
    if (!a.allowed) {
      // клиент показывает разный текст: минуты кончились на сегодня или
      // на месяц — это разные новости и разные кнопки
      return NextResponse.json(
        {
          error: "no_minutes",
          kind: usageKind,
          dailyLeft: a.daily_left ?? null,
          monthlyLeft: a.monthly_left ?? 0,
          creditsLeft: a.credits_left ?? 0,
          // старые поля — пока клиент не обновлён везде
          baseLeft: a.monthly_left ?? 0,
        },
        { status: 429 },
      );
    }
  }
  /** Сколько минут студент вправе проговорить в этой сессии (уроку и экзамену
   *  штучный лимит уже разрешён — их держит только потолок длительности).
   *  Практике режет БОЛЕЕ ЖЁСТКИЙ из двух потолков, дневной или месячный. */
  const minutesLeft =
    usageKind === "practice_minutes"
      ? Math.min(a.daily_left ?? Number.POSITIVE_INFINITY, a.monthly_left ?? 0) + (a.credits_left ?? 0)
      : Number.POSITIVE_INFINITY;

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
  const globalLevel = (profile?.current_level as string | null) ?? quiz?.level ?? "A2";
  // ЖИВОЙ УРОК живёт по SPEAKING-уровню (жалоба «переводит всем, даже B1»:
  // лестница стартовала от глобального уровня, речь не учитывалась).
  // Проба уровня — исключение: уровень ещё неизвестен by design.
  let level = globalLevel;
  let levelSource: "voice_reviews" | "diagnostic_probe" | "global" = "global";
  if (requestedMode !== "diagnostic_speaking") {
    const adminForLevel = createAdminClient();
    if (adminForLevel) {
      const sl = await lessonSpeakingLevel(adminForLevel, user.id, globalLevel);
      level = sl.level;
      levelSource = sl.source;
    }
  }

  /* ------------------------------ ПРАКТИКА ------------------------------
   * Разговор, а не урок: единственный параметр — уровень. Досье, память
   * прошлых уроков, фокус-темы, лестница поддержки и разбор в конце здесь
   * ОТСУТСТВУЮТ намеренно (Блок 1) — и продуктово (это болталка), и по цене:
   * каждый токен промпта оплачивается на КАЖДОМ ходу. Поэтому выходим до
   * построения снапшота — он и не нужен, и стоит запросов к БД.
   */
  if (isPractice) {
    const practiceLang = body.feedbackLang && body.feedbackLang in FEEDBACK_LANG_TR ? body.feedbackLang : "en";
    // Потолок сессии практики = дневной лимит плана (5 мин), но не больше
    // того, что реально осталось с учётом месячного лимита и докупленного.
    const practiceMax = Math.min((limits?.daily || 5) * 60, minutesLeft * 60);
    console.info(
      "[voice] practice session:",
      JSON.stringify({ level, levelSource, globalLevel, lang: practiceLang, provider: providerForMode("practice") }),
    );
    return NextResponse.json({
      conversationToken,
      provider: providerForMode("practice"),
      voiceId: voice.elevenVoiceId,
      maxSeconds: practiceMax,
      allowance: {
        baseLeft: Math.min(a.daily_left ?? Number.POSITIVE_INFINITY, a.monthly_left ?? 0),
        creditsLeft: a.credits_left ?? 0,
        monthlyLeft: a.monthly_left ?? 0,
      },
      resolvedMode: "practice",
      level,
      // практика не даёт разбора — фокуса и его объяснения тоже нет
      lessonFocus: [],
      lessonFocusReason: null,
      foundationHints: [],
      firstMessage: practiceFirstMessage({
        level,
        name: (profile?.full_name as string | null)?.split(" ")[0] ?? "",
      }),
      dynamicVariables: {
        user_id: user.id, // ownership check at settlement
        mode: "practice", // читается на сеттле → voice_sessions.mode
        level,
        level_style: practiceLevelStyle(level),
        feedback_lang: FEEDBACK_LANG_TR[practiceLang],
        lang_bridge: langBridgeFor(practiceLang),
      },
    });
  }

  // Вариант урока решает СЕРВЕР по уровню, а не студент чипами: A0-A2 получают
  // «Фундамент» (экзамен не упоминается — рано), B1+ — обычный урок.
  const foundationLevel = (["A0", "A1", "A2"].includes(level) ? level : null) as "A0" | "A1" | "A2" | null;
  const mode: string = requestedMode === "lesson" && foundationLevel ? "foundation" : requestedMode;

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
        : MODE_INSTRUCTIONS[mode as "lesson" | "diagnostic_speaking"];
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

  // урок и экзамен считаются ШТУКАМИ (Блок 4): их длину держит не остаток
  // минут, а потолок сессии — 15 мин у урока, тайминг сценария у симуляции
  const monthlyLeft = a.monthly_left ?? 0;
  const creditsLeft = a.credits_left ?? 0;
  // проба уровня — жёсткий потолок ~2 минуты (+ запас на прощание агента);
  // симуляция — сумма частей + подготовки + запас на переходы/прощание
  // (C1 ≈14 мин не влезает в обычные 900с)
  const sinavCap = sinavPlan
    ? sinavPlan.partSeconds.reduce((s, p) => s + p, 0) + sinavPlan.prepSeconds.bolum3 + sinavPlan.prepSeconds.bolum4 + 120
    : null;
  const maxSeconds =
    requestedMode === "diagnostic_speaking"
      ? 180
      : sinavCap != null
        ? Math.min(sinavCap, 1080)
        : 900;

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
      levelSource,
      globalLevel,
      support: supportStepFor(level, mode),
      focus: focus.map((t) => t.id),
      dossierChars: dossier.length,
      lang: feedbackLangCode,
    }),
  );

  return NextResponse.json({
    conversationToken,
    provider: providerForMode(mode as Mode),
    voiceId: voice.elevenVoiceId,
    maxSeconds,
    // baseLeft теперь «сколько занятий этого вида осталось в месяце» —
    // урок и экзамен считаются штуками, минуты им больше не потолок
    allowance: { baseLeft: monthlyLeft, creditsLeft, monthlyLeft, kind: usageKind },
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
