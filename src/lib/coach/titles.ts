/**
 * 15 честных турецких титулов (пороги утверждены основателем, план
 * hashed-cooking-hellman §1). Титул = уровень-гейт (CEFR по mastery, с
 * зачётом уровней НИЖЕ диагностированного) + РЕАЛЬНЫЕ достижения из таблиц.
 * НЕ XP: XP можно накликать, темы/уроки/эссе/моки — нельзя.
 *
 * Лестница: каждый титул включает предыдущий; computeTitle идёт снизу и
 * останавливается на первом невыполненном. Присуждённый титул не отбирается
 * (хранится в profiles.title_slug, миграция 0011) — заработанное заработано,
 * даже если сила темы позже просела.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { TOPICS, topicById } from "@/lib/ai/topics";
import type { VoiceReport } from "@/lib/ai/prompts/voice-review";

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1";
const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1"];
const levelIdx = (l: string): number => LEVELS.indexOf(l as CefrLevel); // A0/мусор → -1

/** Реальное количество тем реестра на уровень — пороги считаются от него. */
export const TOPICS_PER_LEVEL: Record<CefrLevel, number> = LEVELS.reduce(
  (acc, l) => ({ ...acc, [l]: TOPICS.filter((t) => t.level === l && t.id !== "other").length }),
  {} as Record<CefrLevel, number>,
);

/** Голосовой урок засчитывается от 4 минут — реальный урок, не тык. */
export const VOICE_LESSON_MIN_SECONDS = 240;

export type CareerStats = {
  diagnosed: boolean;
  /** уровень диагностики: темы уровней НИЖЕ него зачтены */
  diagLevel: string;
  /** закрытые темы (strength ≥ 60) по уровням — живой mastery */
  closedByLevel: Record<CefrLevel, number>;
  activeDays: number;
  tasksDone: number;
  /** максимальная серия ПОЛНЫХ дней за всю историю */
  maxStreak: number;
  voiceLessons: number;
  essays: number;
  bestMockTotal: number | null;
  /** есть мок, где И dinleme ≥ 15/25, И okuma ≥ 15/25 (один и тот же мок) */
  mockComprehension: boolean;
  /** среднее последних 3 konuşma-ревью, /20 */
  konusmaAvg3: number | null;
};

export type TitleDef = {
  id: string;
  rank: number; // 1..15
  tr: string;
  label: { ru: string; en: string; tr: string; kk: string };
  /** условия СВЕРХ предыдущего титула */
  earned: (s: CareerStats) => boolean;
};

/** закрыто тем уровня с зачётом диагностики (диагноз выше уровня = уровень пройден) */
const closed = (s: CareerStats, level: CefrLevel): number =>
  levelIdx(s.diagLevel) > levelIdx(level) ? TOPICS_PER_LEVEL[level] : s.closedByLevel[level];

const closedTotal = (s: CareerStats): number => LEVELS.reduce((sum, l) => sum + closed(s, l), 0);

export const TITLES: TitleDef[] = [
  { id: "yeni_baslayan", rank: 1, tr: "Yeni Başlayan",
    label: { ru: "Новичок", en: "Beginner", tr: "Yeni Başlayan", kk: "Жаңадан бастаушы" },
    earned: (s) => s.diagnosed },
  { id: "merakli", rank: 2, tr: "Meraklı",
    label: { ru: "Любознательный", en: "Curious", tr: "Meraklı", kk: "Білуге құмар" },
    earned: (s) => s.activeDays >= 5 && closedTotal(s) - (levelIdx(s.diagLevel) > 0 ? LEVELS.slice(0, levelIdx(s.diagLevel)).reduce((n, l) => n + TOPICS_PER_LEVEL[l as CefrLevel], 0) : 0) >= 3 },
  // порог снижен основателем (правка 13.07): титул должен приходить на ~2-й
  // неделе — критичный период удержания новичка (3-4 титула за первый месяц)
  { id: "adim_atan", rank: 3, tr: "Adım Atan",
    label: { ru: "Делающий шаг", en: "Step Taker", tr: "Adım Atan", kk: "Қадам басушы" },
    earned: (s) => closed(s, "A1") >= 8 && s.activeDays >= 10 },
  { id: "ogrenci", rank: 4, tr: "Öğrenci",
    label: { ru: "Ученик", en: "Student", tr: "Öğrenci", kk: "Оқушы" },
    earned: (s) => closed(s, "A2") >= 3 },
  { id: "caliskan", rank: 5, tr: "Çalışkan",
    label: { ru: "Усердный", en: "Diligent", tr: "Çalışkan", kk: "Еңбекқор" },
    earned: (s) => s.activeDays >= 20 && s.tasksDone >= 100 },
  { id: "azimli", rank: 6, tr: "Azimli",
    label: { ru: "Настойчивый", en: "Persistent", tr: "Azimli", kk: "Табанды" },
    earned: (s) => closed(s, "A2") >= 9 && s.maxStreak >= 7 },
  { id: "konusan", rank: 7, tr: "Konuşan",
    label: { ru: "Говорящий", en: "Speaker", tr: "Konuşan", kk: "Сөйлеуші" },
    earned: (s) => closed(s, "B1") >= 3 && s.voiceLessons >= 8 && (s.konusmaAvg3 ?? 0) >= 12 },
  { id: "yazan", rank: 8, tr: "Yazan",
    label: { ru: "Пишущий", en: "Writer", tr: "Yazan", kk: "Жазушы" },
    earned: (s) => s.essays >= 10 },
  { id: "anlayan", rank: 9, tr: "Anlayan",
    label: { ru: "Понимающий", en: "Comprehender", tr: "Anlayan", kk: "Түсінуші" },
    earned: (s) => closed(s, "B1") >= 8 && s.mockComprehension },
  { id: "bilen", rank: 10, tr: "Bilen",
    label: { ru: "Знающий", en: "Knower", tr: "Bilen", kk: "Білуші" },
    earned: (s) => closed(s, "B2") >= 2 && (s.bestMockTotal ?? 0) >= 50 },
  { id: "yetkin", rank: 11, tr: "Yetkin",
    label: { ru: "Компетентный", en: "Proficient", tr: "Yetkin", kk: "Құзыретті" },
    earned: (s) => closed(s, "B2") >= 4 && s.voiceLessons >= 20 && s.essays >= 20 },
  { id: "deneyimli", rank: 12, tr: "Deneyimli",
    label: { ru: "Опытный", en: "Experienced", tr: "Deneyimli", kk: "Тәжірибелі" },
    earned: (s) => closed(s, "B2") >= 6 && (s.bestMockTotal ?? 0) >= 60 }, // официальный барем B2
  { id: "usta", rank: 13, tr: "Usta",
    label: { ru: "Мастер", en: "Master", tr: "Usta", kk: "Шебер" },
    earned: (s) => closed(s, "C1") >= 1 && (s.bestMockTotal ?? 0) >= 65 },
  { id: "bilge", rank: 14, tr: "Bilge",
    label: { ru: "Мудрец", en: "Sage", tr: "Bilge", kk: "Дана" },
    earned: (s) => closed(s, "C1") >= 2 && (s.bestMockTotal ?? 0) >= 70 && s.voiceLessons >= 30 },
  { id: "tomer_ustasi", rank: 15, tr: "TÖMER Ustası",
    label: { ru: "Мастер TÖMER", en: "TÖMER Master", tr: "TÖMER Ustası", kk: "TÖMER шебері" },
    earned: (s) => closed(s, "C1") >= 3 && (s.bestMockTotal ?? 0) >= 75 && (s.konusmaAvg3 ?? 0) >= 16 }, // барем C1
];

export function titleById(id: string | null | undefined): TitleDef | undefined {
  return TITLES.find((t) => t.id === id);
}

/** Лестница снизу вверх; первый невыполненный останавливает. Не диагностирован → null. */
export function computeTitle(s: CareerStats): TitleDef | null {
  let current: TitleDef | null = null;
  for (const t of TITLES) {
    if (!t.earned(s)) break;
    current = t;
  }
  return current;
}

/* ------------------------- сбор карьерной статистики ---------------------- */

/**
 * Server-only: полная история (в отличие от 14-дневного окна snapshot) —
 * вызывается только брифом (раз в день на практике из-за кэша). 7 запросов
 * по индексам. Ошибка любой таблицы честно даёт нули секции; title_slug
 * читается ИЗОЛИРОВАННО (колонка едет миграцией 0011 — до неё титулы просто
 * не присуждаются, бриф работает).
 */
export async function buildCareerStats(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ stats: CareerStats; storedTitleSlug: string | null }> {
  const [profileRes, titleRes, masteryRes, daysRes, voiceRes, essaysRes, mocksRes] = await Promise.all([
    supabase.from("profiles").select("quiz_result, diagnostic_completed_at").eq("id", userId).maybeSingle(),
    supabase.from("profiles").select("title_slug").eq("id", userId).maybeSingle(),
    supabase.from("topic_mastery").select("topic, strength").eq("user_id", userId).gte("strength", 60),
    supabase.from("daily_progress").select("date, completed_count, total_count").eq("user_id", userId).order("date"),
    supabase.from("voice_sessions").select("seconds, report").eq("user_id", userId).order("started_at", { ascending: false }).limit(400),
    supabase.from("ai_usage").select("used").eq("user_id", userId).eq("feature", "writing"),
    supabase.from("mock_results").select("total, section_scores").eq("user_id", userId).limit(200),
  ]);

  const quiz = (profileRes.data?.quiz_result as { level?: string } | null) ?? null;

  const closedByLevel = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 } as Record<CefrLevel, number>;
  for (const r of masteryRes.data ?? []) {
    const lvl = topicById(r.topic as string)?.level;
    if (lvl && lvl in closedByLevel) closedByLevel[lvl as CefrLevel] += 1;
  }

  let activeDays = 0;
  let tasksDone = 0;
  let maxStreak = 0;
  let run = 0;
  let prevDate: string | null = null;
  for (const r of daysRes.data ?? []) {
    const done = (r.completed_count as number | null) ?? 0;
    const total = (r.total_count as number | null) ?? 0;
    if (done > 0) activeDays += 1;
    tasksDone += done;
    // серия полных дней: соседние даты подряд
    const full = total > 0 && done >= total;
    const contiguous = prevDate != null && Date.parse(r.date as string) - Date.parse(prevDate) === 86_400_000;
    run = full ? (contiguous ? run + 1 : 1) : 0;
    if (run > maxStreak) maxStreak = run;
    prevDate = r.date as string;
  }

  const voiceRows = (voiceRes.data ?? []) as { seconds: number | null; report: VoiceReport | null }[];
  const voiceLessons = voiceRows.filter((v) => (v.seconds ?? 0) >= VOICE_LESSON_MIN_SECONDS).length;
  const lastReports = voiceRows
    .map((v) => v.report)
    .filter((r): r is VoiceReport => !!r && r.valid)
    .slice(0, 3);
  const konusmaAvg3 = lastReports.length
    ? lastReports.reduce(
        (sum, r) => sum + r.criteria.fluency.score + r.criteria.grammar.score + r.criteria.vocab.score + r.criteria.coherence.score,
        0,
      ) / lastReports.length
    : null;

  const essays = (essaysRes.data ?? []).reduce((sum, r) => sum + ((r.used as number | null) ?? 0), 0);

  let bestMockTotal: number | null = null;
  let mockComprehension = false;
  for (const m of mocksRes.data ?? []) {
    const total = m.total as number | null;
    if (total != null && (bestMockTotal == null || total > bestMockTotal)) bestMockTotal = total;
    const s = (m.section_scores as { dinleme?: number; okuma?: number } | null) ?? {};
    if ((s.dinleme ?? 0) >= 15 && (s.okuma ?? 0) >= 15) mockComprehension = true;
  }

  return {
    stats: {
      diagnosed: !!quiz?.level || !!profileRes.data?.diagnostic_completed_at,
      diagLevel: quiz?.level ?? "A0",
      closedByLevel,
      activeDays,
      tasksDone,
      maxStreak,
      voiceLessons,
      essays,
      bestMockTotal,
      mockComprehension,
      konusmaAvg3,
    },
    storedTitleSlug: (titleRes.data?.title_slug as string | null) ?? null,
  };
}

/* ------------------------ поздравление с апгрейдом ------------------------ */

/** Компактная TR-строка реальных фактов для AI-поздравления — модель может
 * только выбрать из них конкретику, выдумать нечего. */
export function titleFactsTr(title: TitleDef, s: CareerStats): string {
  const bits = [
    `${s.activeDays} aktif gün`,
    `${s.tasksDone} görev`,
    ...(s.voiceLessons ? [`${s.voiceLessons} sesli ders`] : []),
    ...(s.essays ? [`${s.essays} kontrol edilmiş kompozisyon`] : []),
    ...(s.bestMockTotal != null ? [`en iyi deneme ${s.bestMockTotal}/100`] : []),
    ...(s.maxStreak >= 3 ? [`en uzun seri ${s.maxStreak} gün`] : []),
  ];
  return `YENİ UNVAN: öğrenci az önce «${title.tr}» unvanını kazandı (${title.rank}/15). Gerçek veriler: ${bits.join(", ")}. Bugünkü notta bu unvanı SOMUT sayılarla kutla ve bir sonraki adımı göster.`;
}

/** Честный шаблон поздравления без AI (квота/ключи кончились). */
export function titleCongratsText(title: TitleDef, locale: "ru" | "en" | "tr" | "kk"): string {
  const t = (ru: string, en: string, tr: string, kk: string) => ({ ru, en, tr, kk })[locale];
  return t(
    `Новый титул: «${title.tr}» (${title.label.ru}) — ${title.rank} из 15. Он заработан реальным прогрессом, не даётся даром. Дальше — больше.`,
    `New title: “${title.tr}” (${title.label.en}) — ${title.rank} of 15. Earned by real progress, never given for free. Onward.`,
    `Yeni unvan: «${title.tr}» — 15 üzerinden ${title.rank}. Gerçek ilerlemeyle kazanıldı, bedava verilmez. Devam.`,
    `Жаңа атақ: «${title.tr}» (${title.label.kk}) — 15-тен ${title.rank}. Нақты прогреспен табылды, тегін берілмейді. Алға.`,
  );
}
