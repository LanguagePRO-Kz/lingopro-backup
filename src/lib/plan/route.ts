/**
 * Study route — the weekly topic structure to the exam goal
 * (DESIGN-PLAN-ENGINE §2-3). The AI generates it RARELY (events only);
 * pure code lays out the days from it (see ./layout.ts).
 *
 * Everything here is deterministic and unit-testable: validation of the AI
 * reply, the no-AI fallback route, and the mock-share schedule that code
 * enforces on top of whatever the AI proposed (§5).
 */

import { LEVELS, type Level } from "@/data/types";
import { TOPICS, normalizeTopicId } from "@/lib/ai/topics";
import type { Skill } from "@/lib/daily-plan";
import type { Locale } from "@/lib/i18n";

export type Localized = Record<Locale, string>;

export type RouteWeek = {
  index: number; // 1-based
  theme: Localized;
  /** 2–4 registry topic ids — the week's focus */
  topics: string[];
  /** weights 0..1 over non-speaking skills, sum ≈ 1 (speaking = voice lessons, scheduled separately) */
  skillsEmphasis: Partial<Record<Skill, number>>;
  /** enforced by mockPolicyForWeek(), the AI may only propose */
  mockPolicy: "none" | "section" | "full";
  milestone?: Localized;
};

export type StudyRoute = {
  version: 1;
  generatedAt: string; // ISO
  /** which model produced it; "fallback" = deterministic template */
  model: string;
  inputs: {
    level: Level;
    targetLevel: "B2" | "C1";
    examDate?: string; // YYYY-MM-DD
    horizonMonths?: number;
    minutesDaily: number;
    weakTopics: string[]; // strength<60 at generation time
    /** ISO date the route (re)started — week index counts from here */
    routeStartedAt: string;
  };
  weeks: RouteWeek[]; // 4..16
};

export type RouteInputs = StudyRoute["inputs"];

/* ------------------------------ Week counting ---------------------------- */

export const MIN_WEEKS = 4;
export const MAX_WEEKS = 16;

export function daysLeftFrom(inputs: Pick<RouteInputs, "examDate">, todayIso: string): number | null {
  if (!inputs.examDate) return null;
  const diff = Math.ceil((Date.parse(inputs.examDate) - Date.parse(todayIso)) / 86_400_000);
  return diff >= 0 ? diff : null;
}

/** Route length in weeks: from the exam date, else the horizon, else 12. */
export function weeksCount(inputs: Pick<RouteInputs, "examDate" | "horizonMonths">, todayIso: string): number {
  const daysLeft = daysLeftFrom(inputs, todayIso);
  const raw =
    daysLeft != null ? Math.ceil(daysLeft / 7)
    : inputs.horizonMonths ? Math.round(inputs.horizonMonths * 4.3)
    : 12;
  return Math.min(MAX_WEEKS, Math.max(MIN_WEEKS, raw));
}

/** 1-based index of the current route week (days counted from routeStartedAt). */
export function currentWeekIndex(route: StudyRoute, todayIso: string): number {
  const started = Date.parse(route.inputs.routeStartedAt);
  const day = Math.max(1, Math.floor((Date.parse(todayIso) - started) / 86_400_000) + 1);
  return Math.min(route.weeks.length, Math.max(1, Math.ceil(day / 7)));
}

/* ----------------------------- Mock schedule §5 --------------------------- */

/**
 * Enforced mock share per week, from the days left at that week's START.
 * The AI may propose mockPolicy; this is what actually applies.
 */
export function mockPolicyForWeek(
  weekIndex: number,
  daysLeftToday: number | null,
): RouteWeek["mockPolicy"] {
  if (daysLeftToday == null) return "section"; // unknown date → 1 section mock / week
  const daysLeftAtWeek = daysLeftToday - (weekIndex - 1) * 7;
  return daysLeftAtWeek <= 30 ? "full" : "section";
}

/* -------------------------------- Validation ------------------------------ */

const levelIdx = (l: Level) => LEVELS.indexOf(l);

/** Registry topics from the student's level up to the target, file order. */
export function topicsForSpan(level: Level, targetLevel: "B2" | "C1"): string[] {
  const lo = levelIdx(level);
  const hi = levelIdx(targetLevel);
  return TOPICS.filter((t) => {
    if (t.id === "other") return false;
    const i = levelIdx(t.level as Level);
    return i >= Math.min(lo, hi) && i <= hi;
  }).map((t) => t.id);
}

const normWeights = (w: Partial<Record<Skill, number>>): Partial<Record<Skill, number>> => {
  const entries = (Object.entries(w) as [Skill, number][]).filter(
    ([k, v]) => k !== "speaking" && typeof v === "number" && v > 0,
  );
  const sum = entries.reduce((s, [, v]) => s + v, 0);
  if (!sum) return DEFAULT_EMPHASIS;
  return Object.fromEntries(entries.map(([k, v]) => [k, +(v / sum).toFixed(3)]));
};

const DEFAULT_EMPHASIS: Partial<Record<Skill, number>> = {
  grammar: 0.3,
  vocabulary: 0.15,
  reading: 0.2,
  listening: 0.2,
  writing: 0.15,
};

/**
 * Coerce a parsed AI reply into a valid StudyRoute; null = unusable (caller
 * falls back to fallbackRoute). Topics outside the registry are dropped;
 * weeks are clamped to the horizon; the mock schedule is enforced.
 */
export function validateRoute(
  raw: unknown,
  inputs: RouteInputs,
  todayIso: string,
  model: string,
): StudyRoute | null {
  if (!raw || typeof raw !== "object") return null;
  const weeksRaw = (raw as { weeks?: unknown }).weeks;
  if (!Array.isArray(weeksRaw) || weeksRaw.length === 0) return null;

  const targetCount = weeksCount(inputs, todayIso);
  const daysLeft = daysLeftFrom(inputs, todayIso);
  const span = new Set(topicsForSpan(inputs.level, inputs.targetLevel));

  const loc = (v: unknown, fallback: string): Localized => {
    const o = (v ?? {}) as Record<string, unknown>;
    const ru = typeof o.ru === "string" && o.ru ? o.ru : fallback;
    return {
      ru,
      en: typeof o.en === "string" && o.en ? o.en : ru,
      tr: typeof o.tr === "string" && o.tr ? o.tr : ru,
      kk: typeof o.kk === "string" && o.kk ? o.kk : ru,
    };
  };

  const weeks: RouteWeek[] = [];
  for (const [i, wRaw] of (weeksRaw as unknown[]).entries()) {
    if (weeks.length >= targetCount) break;
    const w = (wRaw ?? {}) as Record<string, unknown>;
    const topics = (Array.isArray(w.topics) ? w.topics : [])
      .map((t) => normalizeTopicId(t))
      .filter((t) => span.has(t))
      .slice(0, 4);
    if (topics.length === 0) continue; // a week without registry topics is useless
    weeks.push({
      index: weeks.length + 1,
      theme: loc(w.theme, `Hafta ${i + 1}`),
      topics,
      skillsEmphasis: normWeights((w.skillsEmphasis ?? {}) as Partial<Record<Skill, number>>),
      mockPolicy: mockPolicyForWeek(weeks.length + 1, daysLeft),
      milestone: w.milestone ? loc(w.milestone, "") : undefined,
    });
  }
  if (weeks.length < Math.min(MIN_WEEKS, targetCount)) return null;

  // AI may return fewer weeks than the horizon — pad by cycling its weeks
  const baseLen = weeks.length;
  while (weeks.length < targetCount) {
    const src = weeks[weeks.length % baseLen];
    weeks.push({
      ...src,
      index: weeks.length + 1,
      mockPolicy: mockPolicyForWeek(weeks.length + 1, daysLeft),
      milestone: undefined,
    });
  }

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    model,
    inputs: { ...inputs, routeStartedAt: todayIso },
    weeks,
  };
}

/* --------------------------------- Fallback ------------------------------- */

/**
 * Deterministic template route — the product works without an AI key:
 * registry topics from the student's level to the goal in file order
 * ("supports before superstructure" is the registry's own ordering),
 * weak topics first, 2–3 per week, cycling weak ones when weeks remain.
 */
export function fallbackRoute(inputs: RouteInputs, todayIso: string): StudyRoute {
  const count = weeksCount(inputs, todayIso);
  const daysLeft = daysLeftFrom(inputs, todayIso);

  const span = topicsForSpan(inputs.level, inputs.targetLevel);
  const weak = inputs.weakTopics.filter((t) => span.includes(t));
  const rest = span.filter((t) => !weak.includes(t));
  const ordered = [...weak, ...rest];

  const perWeek = Math.max(2, Math.min(3, Math.ceil(ordered.length / count)));
  const weeks: RouteWeek[] = [];
  for (let i = 0; i < count; i++) {
    let topics = ordered.slice(i * perWeek, (i + 1) * perWeek);
    if (topics.length < 2) {
      // tail week or horizon longer than the topic list → revisit weak
      // topics (spaced re-exposure), cycling the whole span if none
      const cycle = weak.length ? weak : ordered;
      let k = 0;
      while (topics.length < 2 && k < cycle.length) {
        const candidate = cycle[(i + k) % cycle.length];
        if (!topics.includes(candidate)) topics = [...topics, candidate];
        k += 1;
      }
    }
    const first = TOPICS.find((t) => t.id === topics[0]);
    weeks.push({
      index: i + 1,
      theme: first ? { ...first.label } : { ru: `Неделя ${i + 1}`, en: `Week ${i + 1}`, tr: `Hafta ${i + 1}`, kk: `${i + 1}-апта` },
      topics,
      skillsEmphasis: { ...DEFAULT_EMPHASIS },
      mockPolicy: mockPolicyForWeek(i + 1, daysLeft),
    });
  }

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    model: "fallback",
    inputs: { ...inputs, routeStartedAt: todayIso },
    weeks,
  };
}

/* ------------------------------- Regeneration ----------------------------- */

/** True when the stored route's inputs no longer match the profile (§3 trigger 2). */
export function needsRegen(route: StudyRoute | null, current: Omit<RouteInputs, "weakTopics" | "routeStartedAt">): boolean {
  if (!route) return true;
  const i = route.inputs;
  return (
    i.level !== current.level ||
    i.targetLevel !== current.targetLevel ||
    (i.examDate ?? null) !== (current.examDate ?? null) ||
    (i.horizonMonths ?? null) !== (current.horizonMonths ?? null) ||
    i.minutesDaily !== current.minutesDaily
  );
}
