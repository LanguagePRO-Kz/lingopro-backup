/**
 * Day layout (DESIGN-PLAN-ENGINE §4) — pure code, no AI, unit-testable.
 * Fills the student's daily minute budget by priority:
 *   1. spaced reviews of weak topics (intervals 1/3/7/14 days by error count)
 *   2. the voice lesson (3×/week at ≥30 min, 2×/week at 15) with the week's focus
 *   3. mocks on the §5 schedule (the share grows toward the exam date)
 *   4. the route week's topics, weighted by skillsEmphasis
 *   5. vocabulary/reading top-up to budget −10%…+10%
 *
 * Honest v1 limitation: the task banks are NOT topic-tagged yet, so week
 * topics steer tasks only via focusTopics metadata (shown in UI, used by
 * voice lessons); bank filtering by topic is a follow-up (blueprint §7 p.5).
 */

import type { Locale } from "@/lib/i18n";
import { topicById } from "@/lib/ai/topics";
import { skillLabel, type DailyTask, type DayRow, type Skill } from "@/lib/daily-plan";
import { currentWeekIndex, daysLeftFrom, type StudyRoute } from "./route";

export type MasteryRow = {
  topic: string;
  strength: number;
  error_count: number;
  last_error_at: string | null;
  last_practiced_at: string | null;
};

/* --------------------------------- Tuning -------------------------------- */

export const MAX_REVIEWS_PER_DAY = 2;
/** Review intervals in days, indexed by min(3, error_count-1). */
export const REVIEW_INTERVALS = [1, 3, 7, 14] as const;
export const BUDGET_TOLERANCE = 0.1; // ±10%

const TASK_MINUTES: Record<Skill, { count: number; minutes: number }> = {
  grammar: { count: 15, minutes: 12 },
  vocabulary: { count: 20, minutes: 8 },
  reading: { count: 1, minutes: 10 },
  listening: { count: 1, minutes: 8 },
  writing: { count: 1, minutes: 12 },
  speaking: { count: 1, minutes: 10 },
};
const REVIEW_TASK = { count: 10, minutes: 8 };
const MOCK_SECTION_MINUTES = 20;
const MOCK_FULL_MINUTES = 60;

const MOCK_SECTIONS: NonNullable<DailyTask["mockSection"]>[] = ["okuma", "dinleme", "yazma", "konusma"];
const SECTION_SKILL: Record<NonNullable<DailyTask["mockSection"]>, Skill> = {
  okuma: "reading",
  dinleme: "listening",
  yazma: "writing",
  konusma: "speaking",
};

const MOCK_TITLES: Record<"section" | "full", Record<Locale, string>> = {
  section: { ru: "Секция пробного TÖMER", en: "TÖMER mock section", tr: "Deneme bölümü", kk: "Сынақ TÖMER бөлімі" },
  full: { ru: "Полный пробный TÖMER", en: "Full TÖMER mock", tr: "Tam deneme sınavı", kk: "Толық сынақ TÖMER" },
};
const VOICE_TITLE: Record<Locale, string> = {
  ru: "Урок с AI-преподавателем",
  en: "Lesson with the AI teacher",
  tr: "AI öğretmenle ders",
  kk: "AI ұстазбен сабақ",
};
const REVIEW_TITLE: Record<Locale, string> = {
  ru: "Повторение",
  en: "Review",
  tr: "Tekrar",
  kk: "Қайталау",
};

/* ------------------------------ Sub-schedules ----------------------------- */

/** Which mocks (if any) fall on this day; §5 schedule from days left. */
export function mocksForDay(
  dayNumber: number,
  daysLeft: number | null,
): ("section" | "full")[] {
  const dow = ((dayNumber - 1) % 7) + 1; // 1..7 within the route week
  if (daysLeft != null && daysLeft <= 14) {
    // finale: a mock every other day, regular tasks reduce to reviews
    return dayNumber % 2 === 0 ? [daysLeft <= 7 || dayNumber % 4 === 0 ? "full" : "section"] : [];
  }
  if (daysLeft != null && daysLeft <= 30) {
    if (dow === 3 || dow === 6) return ["section"];
    if (dow === 7) return ["full"];
    return [];
  }
  if (daysLeft != null && daysLeft <= 60) {
    return dow === 3 || dow === 6 ? ["section"] : [];
  }
  return dow === 6 ? ["section"] : []; // far away / unknown date: 1 section a week
}

/** Voice-lesson days within the route week, from the minute budget. */
export function voiceLessonDay(dayNumber: number, minutesDaily: number): boolean {
  const dow = ((dayNumber - 1) % 7) + 1;
  return minutesDaily >= 30 ? dow === 1 || dow === 3 || dow === 5 : dow === 1 || dow === 4;
}

/** Weak topics due for a spaced review today (oldest error first, weakest first). */
export function dueReviews(mastery: MasteryRow[], todayIso: string): MasteryRow[] {
  const now = Date.parse(todayIso);
  return mastery
    .filter((m) => {
      if (m.strength >= 60 || !m.last_error_at || m.error_count < 1) return false;
      const interval = REVIEW_INTERVALS[Math.min(3, m.error_count - 1)];
      const anchor = Math.max(
        Date.parse(m.last_error_at),
        m.last_practiced_at ? Date.parse(m.last_practiced_at) : 0,
      );
      return now - anchor >= interval * 86_400_000;
    })
    .sort((a, b) => a.strength - b.strength)
    .slice(0, MAX_REVIEWS_PER_DAY);
}

/* --------------------------------- buildDay -------------------------------- */

export function buildDay(input: {
  route: StudyRoute;
  date: string; // ISO
  dayNumber: number;
  mastery: MasteryRow[];
  history: DayRow[]; // reserved: recent-history balancing (not used in v1)
  minutesDaily: number;
  locale: Locale;
}): DailyTask[] {
  const { route, date, dayNumber, minutesDaily, locale } = input;
  const weekIdx = currentWeekIndex(route, date);
  const week = route.weeks[weekIdx - 1];
  const daysLeft = daysLeftFrom(route.inputs, date);
  const finale = daysLeft != null && daysLeft <= 14;

  const tasks: DailyTask[] = [];
  let spent = 0;
  const budget = minutesDaily;
  const fits = (min: number) => spent + min <= budget * (1 + BUDGET_TOLERANCE);
  const push = (t: Omit<DailyTask, "order" | "completed" | "description">) => {
    tasks.push({ ...t, description: "", completed: false, order: tasks.length + 1 });
    spent += t.estimatedMinutes;
  };

  const topicLabel = (id: string) => topicById(id)?.label[locale] ?? id;

  /* 1 — spaced reviews (always fit: they are the point of the system) */
  for (const m of dueReviews(input.mastery, date)) {
    push({
      id: `rep-${m.topic}`,
      skill: "grammar",
      title: `${REVIEW_TITLE[locale]}: ${topicLabel(m.topic)}`,
      level: route.inputs.level,
      taskId: `rep-${m.topic}-d${dayNumber}`,
      seed: dayNumber,
      count: REVIEW_TASK.count,
      estimatedMinutes: REVIEW_TASK.minutes,
      kind: "regular",
      focusTopics: [m.topic],
    });
  }

  /* 2 — voice lesson with the week's focus */
  if (voiceLessonDay(dayNumber, minutesDaily)) {
    const weak = new Set(input.mastery.filter((m) => m.strength < 60).map((m) => m.topic));
    const focus = [...week.topics.filter((t) => weak.has(t)), ...week.topics.filter((t) => !weak.has(t))].slice(0, 3);
    const modes = ["bolum1", "bolum2", "bolum3"] as const;
    push({
      id: "voice-lesson",
      skill: "speaking",
      title: VOICE_TITLE[locale],
      level: route.inputs.level,
      taskId: `voice-d${dayNumber}`,
      seed: dayNumber,
      count: 1,
      estimatedMinutes: 10, // = the daily base voice quota
      kind: "voice_lesson",
      voiceMode: modes[(weekIdx - 1) % 3],
      focusTopics: focus,
    });
  }

  /* 3 — mocks by schedule (allowed to exceed the budget: exam realism) */
  for (const kind of mocksForDay(dayNumber, daysLeft)) {
    if (kind === "full") {
      push({
        id: "mock-full",
        skill: "reading", // rendering shortcut; UI routes by kind, not skill
        title: MOCK_TITLES.full[locale],
        level: route.inputs.targetLevel,
        taskId: `mock-full-d${dayNumber}`,
        seed: dayNumber,
        count: 4,
        estimatedMinutes: MOCK_FULL_MINUTES,
        kind: "mock_full",
      });
    } else {
      const section = MOCK_SECTIONS[Math.floor((dayNumber - 1) / 7) % MOCK_SECTIONS.length];
      push({
        id: `mock-${section}`,
        skill: SECTION_SKILL[section],
        title: `${MOCK_TITLES.section[locale]}: ${section.charAt(0).toUpperCase()}${section.slice(1)}`,
        level: route.inputs.targetLevel,
        taskId: `mock-${section}-d${dayNumber}`,
        seed: dayNumber,
        count: 1,
        estimatedMinutes: MOCK_SECTION_MINUTES,
        kind: "mock_section",
        mockSection: section,
      });
    }
  }

  /* 4 — the week's topics, ordered by emphasis (skipped in the finale) */
  if (!finale) {
    const emphasized = (Object.entries(week.skillsEmphasis) as [Skill, number][])
      .filter(([s]) => s !== "speaking")
      .sort((a, b) => b[1] - a[1]);
    for (const [skill] of emphasized) {
      const spec = TASK_MINUTES[skill];
      if (!fits(spec.minutes) || tasks.some((t) => t.skill === skill && t.kind === "regular" && !t.focusTopics)) continue;
      push({
        id: `${skill}-week`,
        skill,
        title: skillLabel(skill, locale),
        level: route.inputs.level,
        taskId: `${skill}-${route.inputs.level}-d${dayNumber}`,
        seed: dayNumber,
        count: spec.count,
        estimatedMinutes: spec.minutes,
        kind: "regular",
        // banks are not topic-tagged yet — metadata only (see file header)
        focusTopics: week.topics,
      });
      if (spent >= budget * (1 - BUDGET_TOLERANCE)) break;
    }
  }

  /* 5 — top-up so light days still reach the promised budget
         (skipped in the finale: only reviews + mocks by design, §5).
         Big budgets take several passes — one pass capped every day at
         ~60 min, so 90/120 in settings never changed the plan
         (founder-reported); repeats get their own taskId/seed. */
  const fillers: Skill[] = finale ? [] : ["vocabulary", "reading", "listening", "writing"];
  for (let pass = 0; pass < 6 && spent < budget * (1 - BUDGET_TOLERANCE); pass++) {
    for (const skill of fillers) {
      if (spent >= budget * (1 - BUDGET_TOLERANCE)) break;
      if (pass === 0 && tasks.some((t) => t.skill === skill)) continue;
      const spec = TASK_MINUTES[skill];
      if (!fits(spec.minutes)) continue;
      const nth = tasks.filter((t) => t.skill === skill).length + 1;
      push({
        id: `${skill}-fill${nth > 1 ? nth : ""}`,
        skill,
        title: skillLabel(skill, locale),
        level: route.inputs.level,
        taskId: nth === 1 ? `${skill}-${route.inputs.level}-d${dayNumber}` : `${skill}-${route.inputs.level}-d${dayNumber}-${nth}`,
        seed: nth === 1 ? dayNumber : dayNumber * 10 + nth,
        count: spec.count,
        estimatedMinutes: spec.minutes,
        kind: "regular",
      });
    }
  }

  return tasks;
}
