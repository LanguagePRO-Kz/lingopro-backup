/**
 * Daily study plan — a set of concrete tasks per day sized by the student's
 * chosen intensity (light / medium / intensive) and diagnostic level.
 * Grammar + vocabulary appear every day; reading / listening / writing /
 * speaking rotate. Difficulty nudges up one CEFR step every 7 days.
 *
 * Progress persists to Supabase (`daily_progress`, `task_results`) with a
 * localStorage mirror so the board keeps working before the tables exist.
 */

import type { Locale } from "./i18n";
import { createClient } from "./supabase/client";
// Only the tiny LEVELS constant + types are imported here. The heavy question
// banks are loaded on demand inside TaskModal (see src/lib/task-content.ts) so
// they stay out of the dashboard bundle.
import { LEVELS, type Level } from "@/data/types";
import { buildDay, type MasteryRow } from "./plan/layout";
import { needsRegen, type StudyRoute } from "./plan/route";

export type Intensity = "light" | "medium" | "intensive";
export type Skill = "grammar" | "reading" | "listening" | "writing" | "speaking" | "vocabulary";

export interface DailyTask {
  id: string;
  skill: Skill;
  title: string;
  description: string;
  level: Level;
  taskId: string;
  seed: number; // deterministic offset used to resolve content on demand
  count: number; // questions / words / texts / prompts
  estimatedMinutes: number;
  completed: boolean;
  order: number;
  /* ----- plan-engine extensions (DESIGN-PLAN-ENGINE §4); absent = regular ----- */
  kind?: "regular" | "voice_lesson" | "mock_section" | "mock_full";
  /** registry topic ids this task targets (voice lesson focus / spaced review) */
  focusTopics?: string[];
  /** voice lesson mode for /dashboard/speaking/live?mode=… */
  voiceMode?: "bolum1" | "bolum2" | "bolum3";
  mockSection?: "dinleme" | "okuma" | "yazma" | "konusma";
}

export type DayRow = {
  date: string;
  tasks: DailyTask[];
  completedCount: number;
  total: number;
};

/* ------------------------------- Skill meta ------------------------------ */
export const SKILL_META: Record<Skill, { emoji: string; color: string; href: string }> = {
  grammar: { emoji: "📝", color: "#6d5bff", href: "/dashboard/grammar" },
  vocabulary: { emoji: "📚", color: "#16a34a", href: "/dashboard/vocabulary" },
  reading: { emoji: "📖", color: "#3b82f6", href: "/dashboard/reading" },
  listening: { emoji: "🎧", color: "#ef4444", href: "/dashboard/listening" },
  writing: { emoji: "✍️", color: "#f59e0b", href: "/dashboard/writing" },
  speaking: { emoji: "🎙", color: "#eab308", href: "/dashboard/speaking" },
};

const NAMES: Record<Skill, Record<Locale, string>> = {
  grammar: { ru: "Грамматика", en: "Grammar", tr: "Dil bilgisi", kk: "Грамматика" },
  vocabulary: { ru: "Словарь", en: "Vocabulary", tr: "Sözlük", kk: "Сөздік" },
  reading: { ru: "Чтение", en: "Reading", tr: "Okuma", kk: "Оқу" },
  listening: { ru: "Аудирование", en: "Listening", tr: "Dinleme", kk: "Тыңдалым" },
  writing: { ru: "Письмо", en: "Writing", tr: "Yazma", kk: "Жазу" },
  speaking: { ru: "Говорение", en: "Speaking", tr: "Konuşma", kk: "Сөйлеу" },
};

export function skillLabel(skill: Skill, locale: Locale) {
  return NAMES[skill][locale];
}

const DEFAULT_COUNT: Record<Skill, number> = {
  grammar: 15,
  vocabulary: 20,
  reading: 1,
  listening: 1,
  writing: 1,
  speaking: 2,
};

/** Localized short description e.g. "15 вопросов", "20 слов", "1 текст". */
export function taskDescription(task: DailyTask, locale: Locale): string {
  const n = Number.isFinite(task.count) ? task.count : DEFAULT_COUNT[task.skill];
  const unit = (map: Record<Locale, (x: number) => string>) => map[locale](n);
  switch (task.skill) {
    case "grammar":
      return unit({ ru: (x) => `${x} вопросов`, en: (x) => `${x} questions`, tr: (x) => `${x} soru`, kk: (x) => `${x} сұрақ` });
    case "vocabulary":
      return unit({ ru: (x) => `${x} слов`, en: (x) => `${x} words`, tr: (x) => `${x} kelime`, kk: (x) => `${x} сөз` });
    case "reading":
      return unit({ ru: (x) => `${x} текст + вопросы`, en: (x) => `${x} text + questions`, tr: (x) => `${x} metin + sorular`, kk: (x) => `${x} мәтін + сұрақтар` });
    case "listening":
      return unit({ ru: (x) => `${x} диалог + вопросы`, en: (x) => `${x} dialogue + questions`, tr: (x) => `${x} diyalog + sorular`, kk: (x) => `${x} диалог + сұрақтар` });
    case "writing":
      return { ru: "Сочинение", en: "Essay", tr: "Kompozisyon", kk: "Шығарма" }[locale];
    case "speaking":
      return unit({ ru: (x) => `${x} вопроса`, en: (x) => `${x} questions`, tr: (x) => `${x} soru`, kk: (x) => `${x} сұрақ` });
  }
}

export function minutesLabel(min: number, locale: Locale): string {
  const u = { ru: "мин", en: "min", tr: "dk", kk: "мин" }[locale];
  return `~${min} ${u}`;
}

export const INTENSITY_MINUTES: Record<Intensity, number> = { light: 35, medium: 50, intensive: 80 };

export function intensityLabel(intensity: Intensity, locale: Locale): string {
  const m: Record<Intensity, Record<Locale, string>> = {
    light: { ru: "Лёгкий темп", en: "Light pace", tr: "Hafif tempo", kk: "Жеңіл қарқын" },
    medium: { ru: "Средний темп", en: "Medium pace", tr: "Orta tempo", kk: "Орташа қарқын" },
    intensive: { ru: "Интенсивный темп", en: "Intensive pace", tr: "Yoğun tempo", kk: "Қарқынды темп" },
  };
  return m[intensity][locale];
}

/* ------------------------------- Date utils ------------------------------ */
export function todayISO(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function addDaysISO(iso: string, delta: number): string {
  const [y, m, day] = iso.split("-").map(Number);
  return todayISO(new Date(y, m - 1, day + delta));
}
export function dayNumberFrom(takenAt: number | undefined): number {
  if (!takenAt) return 1;
  const s = new Date(takenAt);
  s.setHours(0, 0, 0, 0);
  const n = new Date();
  n.setHours(0, 0, 0, 0);
  return Math.max(1, Math.floor((n.getTime() - s.getTime()) / 86_400_000) + 1);
}
export function contentLevel(level: string | undefined): Level {
  if (!level || level === "A0") return "A1";
  return (LEVELS.includes(level as Level) ? level : "A1") as Level;
}

/* ---------------------------- Plan generation ---------------------------- */
type Spec = { skill: Skill; count: number; minutes: number };

function specsFor(intensity: Intensity, dayNumber: number): Spec[] {
  if (intensity === "light") {
    const rot: Skill = dayNumber % 2 === 0 ? "speaking" : "writing";
    return [
      { skill: "grammar", count: 10, minutes: 8 },
      { skill: "vocabulary", count: 15, minutes: 7 },
      { skill: "reading", count: 1, minutes: 10 },
      { skill: "listening", count: 1, minutes: 8 },
      { skill: rot, count: 1, minutes: 7 },
    ];
  }
  if (intensity === "intensive") {
    return [
      { skill: "grammar", count: 20, minutes: 15 },
      { skill: "vocabulary", count: 25, minutes: 10 },
      { skill: "reading", count: 2, minutes: 18 },
      { skill: "listening", count: 2, minutes: 15 },
      { skill: "writing", count: 1, minutes: 12 },
      { skill: "speaking", count: 3, minutes: 10 },
    ];
  }
  return [
    { skill: "grammar", count: 15, minutes: 12 },
    { skill: "vocabulary", count: 20, minutes: 8 },
    { skill: "reading", count: 1, minutes: 10 },
    { skill: "listening", count: 1, minutes: 8 },
    { skill: "writing", count: 1, minutes: 10 },
    { skill: "speaking", count: 2, minutes: 7 },
  ];
}

function rampLevel(base: Level, dayNumber: number): Level {
  const i = LEVELS.indexOf(base);
  return LEVELS[Math.min(LEVELS.length - 1, i + Math.floor((dayNumber - 1) / 7))];
}

/** Generate the day's tasks for a given level + intensity (deterministic). */
export function generateDailyPlan(userLevel: Level, intensity: Intensity, dayNumber: number, locale: Locale): DailyTask[] {
  const level = rampLevel(userLevel, dayNumber);
  return specsFor(intensity, dayNumber).map((spec, i) => ({
    id: `${spec.skill}-${i}`,
    skill: spec.skill,
    title: NAMES[spec.skill][locale],
    description: "",
    level,
    taskId: `${spec.skill}-${level}-d${dayNumber}`,
    seed: dayNumber,
    count: spec.count,
    estimatedMinutes: spec.minutes,
    completed: false,
    order: i + 1,
  }));
}

/* ------------------------- Streak / week helpers ------------------------- */
export function isDayComplete(r: DayRow | undefined): boolean {
  return !!r && r.total > 0 && r.completedCount >= r.total;
}

/** Consecutive completed days; today's incompleteness doesn't break it. */
export function computeStreak(history: DayRow[], date = todayISO()): number {
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (let i = 0; i < sorted.length; i++) {
    const r = sorted[i];
    if (r.date > date) continue;
    if (isDayComplete(r)) streak++;
    else if (r.date === date) continue; // today in progress — grace
    else break;
  }
  return streak;
}

export function weekCalendar(history: DayRow[], date = todayISO()): { iso: string; done: boolean; today: boolean }[] {
  const [y, m, d] = date.split("-").map(Number);
  const dow = (new Date(y, m - 1, d).getDay() + 6) % 7;
  const monday = addDaysISO(date, -dow);
  return Array.from({ length: 7 }, (_, i) => {
    const iso = addDaysISO(monday, i);
    return { iso, done: isDayComplete(history.find((r) => r.date === iso)), today: iso === date };
  });
}

export function totalTasksDone(history: DayRow[]): number {
  return history.reduce((s, r) => s + r.completedCount, 0);
}

/** Most recent day with any completed task (ISO date), or null. */
export function lastActivity(history: DayRow[]): string | null {
  const active = history.filter((r) => r.completedCount > 0).map((r) => r.date).sort();
  return active.length ? active[active.length - 1] : null;
}

/* ------------------------------ Motivator -------------------------------- */
export function getMotivation(
  locale: Locale,
  streak: number,
  last: string | null,
): { title: string; text: Record<Locale, string> } {
  if (!last) {
    return { title: "Merhaba! 👋", text: {
      ru: "Добро пожаловать! Начни свой первый день подготовки.",
      en: "Welcome! Start your first day of preparation.",
      tr: "Hoş geldin! İlk hazırlık gününe başla.",
      kk: "Қош келдің! Дайындықтың алғашқы күнін баста.",
    } };
  }
  const daysSince = Math.floor((Date.parse(todayISO()) - Date.parse(last)) / 86_400_000);
  if (daysSince > 2) {
    return { title: "Seni özledim! 🙌", text: {
      ru: "Ты пропустил пару дней — это нормально. Вернись сегодня и восстанови серию!",
      en: "You missed a couple of days — that's okay. Come back today and rebuild your streak!",
      tr: "Birkaç gün ara verdin — sorun değil. Bugün dön ve serini yeniden başlat!",
      kk: "Бірнеше күн жіберіп алдың — бұл қалыпты. Бүгін орал да серияңды қайта баста!",
    } };
  }
  if (streak === 0) {
    return { title: "Haydi başlayalım! 💪", text: {
      ru: "Выполни план на сегодня и начни свою серию!",
      en: "Finish today's plan and start your streak!",
      tr: "Bugünün planını tamamla ve serini başlat!",
      kk: "Бүгінгі жоспарды орында да серияңды баста!",
    } };
  }
  if (streak < 7) {
    return { title: "Harika! 🔥", text: {
      ru: `${streak} дней подряд — так держать! Не останавливайся.`,
      en: `${streak} days in a row — keep it up!`,
      tr: `${streak} gün üst üste — böyle devam et!`,
      kk: `${streak} күн қатарынан — осылай жалғастыр!`,
    } };
  }
  if (streak < 30) {
    return { title: "Muhteşem! 🏆", text: {
      ru: `${streak} дней подряд — ты настоящий чемпион!`,
      en: `${streak} days in a row — you're a true champion!`,
      tr: `${streak} gün üst üste — gerçek bir şampiyonsun!`,
      kk: `${streak} күн қатарынан — сен нағыз чемпионсың!`,
    } };
  }
  return { title: "Efsane! 👑", text: {
    ru: `${streak} дней подряд — это невероятно! Ты на пути к C1!`,
    en: `${streak} days in a row — incredible! You're on your way to C1!`,
    tr: `${streak} gün üst üste — inanılmaz! C1 yolundasın!`,
    kk: `${streak} күн қатарынан — керемет! C1-ге бара жатырсың!`,
  } };
}

const PHRASES: { tr: string; tx: Record<Locale, string> }[] = [
  { tr: "Sabır acıdır, meyvesi tatlıdır.", tx: { ru: "Терпение горько, но плод его сладок.", en: "Patience is bitter, but its fruit is sweet.", tr: "Sabır acıdır, meyvesi tatlıdır.", kk: "Сабыр ащы, жемісі тәтті." } },
  { tr: "Damlaya damlaya göl olur.", tx: { ru: "Капля за каплей — образуется озеро.", en: "Drop by drop, a lake forms.", tr: "Damlaya damlaya göl olur.", kk: "Тамшылап көл болады." } },
  { tr: "Bugün yapabileceğini yarına bırakma.", tx: { ru: "Не откладывай на завтра то, что можешь сделать сегодня.", en: "Don't leave for tomorrow what you can do today.", tr: "Bugün yapabileceğini yarına bırakma.", kk: "Бүгін жасай алатыныңды ертеңге қалдырма." } },
  { tr: "Bilmek güçtür.", tx: { ru: "Знание — сила.", en: "Knowledge is power.", tr: "Bilmek güçtür.", kk: "Білім — күш." } },
  { tr: "Azimli olan başarır.", tx: { ru: "Настойчивый добивается успеха.", en: "The persistent one succeeds.", tr: "Azimli olan başarır.", kk: "Табанды адам жетістікке жетеді." } },
  { tr: "Her günün bir hediyesi vardır.", tx: { ru: "У каждого дня есть свой подарок.", en: "Every day has its gift.", tr: "Her günün bir hediyesi vardır.", kk: "Әр күннің өз сыйы бар." } },
  { tr: "Öğrenmenin yaşı yoktur.", tx: { ru: "Учиться никогда не поздно.", en: "You're never too old to learn.", tr: "Öğrenmenin yaşı yoktur.", kk: "Оқудың жасы жоқ." } },
];

export function phraseOfDay(locale: Locale): { tr: string; translation: string } {
  const p = PHRASES[new Date().getDay() % PHRASES.length];
  return { tr: p.tr, translation: p.tx[locale] };
}
export function wordsLearned(history: DayRow[]): number {
  return history.reduce((s, r) => s + r.tasks.filter((t) => t.skill === "vocabulary" && t.completed).reduce((a, t) => a + t.count, 0), 0);
}

/* ------------------------------- Storage --------------------------------- */
// v3: bumped when tasks moved from stored `itemIds` to a `seed` (content is now
// resolved on demand). Old-schema rows are ignored and regenerated.
// v4: route-driven tasks (kind/focusTopics) — older cached shapes are dropped
const LS_KEY = "lingopro:dailyPlan:v4";
type LsMap = Record<string, DayRow>;

/** A row is usable only if every task carries the current numeric fields. */
export function isPlanValid(row: DayRow | undefined): boolean {
  return (
    !!row &&
    Array.isArray(row.tasks) &&
    row.tasks.length > 0 &&
    row.tasks.every(
      (t) =>
        typeof t.estimatedMinutes === "number" &&
        Number.isFinite(t.estimatedMinutes) &&
        typeof t.count === "number" &&
        typeof t.seed === "number",
    )
  );
}

function lsAll(): LsMap {
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as LsMap) : {};
  } catch {
    return {};
  }
}
function lsSet(row: DayRow) {
  try {
    const all = lsAll();
    all[row.date] = row;
    window.localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

type DbRow = { date: string; tasks: DailyTask[]; completed_count: number; total_count: number };
function fromDb(r: DbRow): DayRow {
  return { date: r.date, tasks: r.tasks, completedCount: r.completed_count, total: r.total_count };
}

export async function saveDay(row: DayRow): Promise<void> {
  lsSet(row);
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("daily_progress").upsert(
      { user_id: user.id, date: row.date, tasks: row.tasks, completed_count: row.completedCount, total_count: row.total },
      { onConflict: "user_id,date" },
    );
  } catch {
    /* table may not exist yet */
  }
}

/** Persist an individual task result (best-effort). */
export async function saveTaskResult(input: {
  taskId: string;
  skill: Skill;
  score: number;
  maxScore: number;
  answers?: unknown;
}): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("task_results").upsert(
      {
        user_id: user.id,
        task_id: input.taskId,
        skill: input.skill,
        score: input.score,
        max_score: input.maxScore,
        answers: input.answers ?? null,
      },
      { onConflict: "user_id,task_id" },
    );
  } catch {
    /* table may not exist yet */
  }
}

export async function loadDailyState(
  userLevel: Level,
  intensity: Intensity,
  dayNumber: number,
  locale: Locale,
): Promise<{ today: DayRow; history: DayRow[] }> {
  const date = todayISO();
  const from = addDaysISO(date, -29);
  let history: DayRow[] = [];

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("no user");
    const { data, error } = await supabase
      .from("daily_progress")
      .select("date, tasks, completed_count, total_count")
      .eq("user_id", user.id)
      .gte("date", from)
      .order("date");
    if (error) throw error;
    history = (data as DbRow[]).map(fromDb);
  } catch {
    history = Object.values(lsAll()).filter((r) => r.date >= from);
  }

  // only accept today's row if it matches the current schema; else regenerate
  let today = history.find((r) => r.date === date);
  if (!isPlanValid(today)) {
    const tasks = generateDailyPlan(userLevel, intensity, dayNumber, locale);
    today = { date, tasks, completedCount: 0, total: tasks.length };
    history = [...history.filter((r) => r.date !== date), today].sort((a, b) => a.date.localeCompare(b.date));
    await saveDay(today);
  }
  return { today: today as DayRow, history };
}

/**
 * Single-round-trip dashboard load: one getUser + one Promise.all for the
 * profile and the 30-day history. Generates today's plan if it's missing.
 */
export async function loadDashboardData(locale: Locale): Promise<{
  intensity: Intensity | null;
  levelRaw: string;
  level: Level;
  dayNumber: number;
  today: DayRow | null;
  history: DayRow[];
  /** false → the dashboard should trigger POST /api/ai/route once */
  hasRoute: boolean;
  /** route inputs no longer match the profile minutes → regenerate once */
  routeStale: boolean;
}> {
  const date = todayISO();
  const from = addDaysISO(date, -29);

  type ProfileRow = {
    quiz_result?: { level?: string; takenAt?: number; minutesDaily?: number } | null;
    study_minutes_daily?: number | null;
    study_route?: unknown;
    target_level?: string | null;
    exam_date?: string | null;
    exam_date_mode?: string | null;
    exam_horizon_months?: number | null;
  };
  let profile: ProfileRow | null = null;
  let history: DayRow[] = [];
  let mastery: MasteryRow[] = [];
  let minutesDaily: number | null = null;

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("no user");
    const [pRes, hRes, mRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("quiz_result, study_minutes_daily, study_route, target_level, exam_date, exam_date_mode, exam_horizon_months")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("daily_progress")
        .select("date, tasks, completed_count, total_count")
        .eq("user_id", user.id)
        .gte("date", from)
        .order("date"),
      supabase
        .from("topic_mastery")
        .select("topic, strength, error_count, last_error_at, last_practiced_at")
        .eq("user_id", user.id)
        .lt("strength", 60)
        .order("strength")
        .limit(30),
    ]);
    profile = (pRes.data as unknown as ProfileRow | null) ?? null;
    history = !hRes.error && hRes.data ? (hRes.data as DbRow[]).map(fromDb) : Object.values(lsAll()).filter((r) => r.date >= from);
    mastery = (mRes.data as MasteryRow[] | null) ?? [];

    // Minutes/day are THE pace (asked once in the diagnostic, edited in
    // settings). Source order: profile column → onboarding choice inside the
    // quiz result (heals a lost write) → an honest steady 30. No account may
    // be left without a pace.
    minutesDaily = profile?.study_minutes_daily ?? profile?.quiz_result?.minutesDaily ?? null;
    if (!profile?.study_minutes_daily && minutesDaily) {
      await supabase.from("profiles").update({ study_minutes_daily: minutesDaily }).eq("id", user.id);
    }
    if (minutesDaily == null && profile) minutesDaily = 30;
  } catch {
    history = Object.values(lsAll()).filter((r) => r.date >= from);
  }

  const levelRaw = profile?.quiz_result?.level ?? "A2";
  // intensity is a derived, in-memory sizing hint for the pre-route template
  // day — never stored (there is no such DB column)
  const intensity: Intensity | null =
    minutesDaily == null ? null : minutesDaily <= 15 ? "light" : minutesDaily <= 30 ? "medium" : "intensive";
  const level = contentLevel(levelRaw);
  const dayNumber = dayNumberFrom(profile?.quiz_result?.takenAt);

  // plan engine: an AI/fallback route turns the day into a route-driven layout
  const routeRaw = profile?.study_route as StudyRoute | null | undefined;
  const route = routeRaw && routeRaw.version === 1 && Array.isArray(routeRaw.weeks) && routeRaw.weeks.length > 0 ? routeRaw : null;
  // route inputs no longer match the profile (settings change / lost write /
  // retake) → the dashboard regenerates it once, then rebuilds today
  const routeStale =
    !!route &&
    !!profile &&
    needsRegen(route, {
      level: contentLevel(profile.quiz_result?.level),
      targetLevel: profile.target_level === "C1" ? "C1" : "B2",
      examDate: profile.exam_date_mode === "exact" ? (profile.exam_date ?? undefined) : undefined,
      horizonMonths: profile.exam_date_mode === "approx" ? (profile.exam_horizon_months ?? undefined) : undefined,
      minutesDaily: minutesDaily ?? 30,
    });

  let today: DayRow | null = null;
  if (intensity) {
    today = history.find((r) => r.date === date) ?? null;
    // regenerate when the stored day predates the route (no `kind` fields yet)
    const preRoute = !!route && !!today && isPlanValid(today) && !today.tasks.some((t) => t.kind);
    if (!isPlanValid(today ?? undefined) || preRoute) {
      const budget = minutesDaily ?? INTENSITY_MINUTES[intensity];
      const tasks = route
        ? buildDay({ route, date, dayNumber, mastery, history, minutesDaily: budget, locale })
        : generateDailyPlan(level, intensity, dayNumber, locale);
      // keep credit for anything already completed today (same-skill match)
      if (today && isPlanValid(today)) {
        const doneSkills = new Set(today.tasks.filter((t) => t.completed).map((t) => t.skill));
        for (const t of tasks) if (doneSkills.has(t.skill) && t.kind !== "mock_full" && t.kind !== "mock_section") t.completed = doneSkills.delete(t.skill);
      }
      today = { date, tasks, completedCount: tasks.filter((t) => t.completed).length, total: tasks.length };
      history = [...history.filter((r) => r.date !== date), today].sort((a, b) => a.date.localeCompare(b.date));
      await saveDay(today);
    }
  }

  return { intensity, levelRaw, level, dayNumber, today, history, hasRoute: !!route, routeStale };
}

export async function peekToday(): Promise<{ completed: number; total: number } | null> {
  const date = todayISO();
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("no user");
    const { data, error } = await supabase
      .from("daily_progress")
      .select("completed_count, total_count")
      .eq("user_id", user.id)
      .eq("date", date)
      .maybeSingle();
    if (error) throw error;
    if (data) return { completed: (data as DbRow).completed_count, total: (data as DbRow).total_count };
  } catch {
    const r = lsAll()[date];
    if (r) return { completed: r.completedCount, total: r.total };
  }
  return null;
}
