/**
 * Honest realistic plan — the product's core promise (founder-approved
 * logic, 07.2026). Replaces the old 90-minutes-per-grammar-topic guess,
 * which counted only grammar and lowballed the real work.
 *
 *   needHours = CEFR hours ladder from the student's level to the target,
 *               each step discounted by mastered registry topics (≤50%),
 *               × 0.75 for Kazakh speakers (agglutination, vowel harmony
 *               and the case system are native concepts)
 *   haveHours = daysLeft × minutes/day × 0.85 (nobody holds 100% discipline)
 *   verdict   = ok ≤ 80% load · tight ≤ 100% · notEnough above
 *
 * Pure functions; every surface (diagnostic result, settings, dashboard
 * checkpoint) renders its own texts from the same numbers.
 */

import { LEVELS, type Level } from "@/data/types";
import { TOPICS } from "@/lib/ai/topics";

/**
 * Hours to CLOSE the step ending at each level — anchored to the founder's
 * school empirics (07.2026), NOT the generic CEFR classroom ladder (which
 * gave "A1→C1 ≈ 780 h / 20 мес" and undersold the product's whole point):
 *   A2 → B2 ≈ 2-3 months, from zero → B2 ≈ 5-6 months at ~60 min/day.
 * The estimate is an ориентир, never a promise. CONFIG — the methodologist
 * adjusts as real pace data accumulates.
 */
export const STEP_HOURS: Record<Level, number> = {
  A1: 40, // 0 → A1
  A2: 40, // A1 → A2   (0 → A2 ≈ 3 мес при 60 мин/день)
  B1: 30, // A2 → B1
  B2: 35, // B1 → B2   (A2 → B2 = 65 ч ≈ 2.5 мес; 0 → B2 = 145 ч ≈ 5.7 мес)
  C1: 65, // B2 → C1   (честно дольше — но цель по умолчанию B2, порог вуза)
};

/** Kazakh speakers: shared grammar concepts cut the work substantially. */
export const KK_NATIVE_FACTOR = 0.75;
/** Planning on 100% attendance is lying to the student. */
export const DISCIPLINE = 0.85;
/** Grammar topics are the backbone but ≈ half of a step's work (vocab,
 * listening, writing practice fill the rest) → mastery discount cap. */
export const MASTERY_DISCOUNT_CAP = 0.5;

/**
 * PASSING the exam is a separate skill from OWNING the level (founder
 * methodology, 07.2026): task formats, section strategies and timing are
 * trainable fast and genuinely raise the odds of scoring above one's "pure"
 * proficiency. The ladder above measures proficiency; these two measure
 * format readiness. CONFIG — the methodologist tunes both.
 */
export const FORMAT_HOURS = 30; // full TÖMER format training: all sections, task types, timing
export const FORMAT_SHARE = 0.25; // share of the resource the plan dedicates to mocks/format work

/** Pace choices offered everywhere (founder: 15 is the useful minimum, and
 * nobody sustains beyond 2 h/day — extra practice is a soft bonus, not plan). */
export const PACE_CHOICES = [15, 30, 45, 60, 90, 120] as const;
export const MAX_SUSTAINABLE_MINUTES = 120;

/** The quiz can report A0; the ladder starts one rung below A1. */
export type StudentLevel = "A0" | Level;

const ladderIndex = (l: StudentLevel): number => (l === "A0" ? -1 : LEVELS.indexOf(l as Level));

/** Ladder steps still ahead of the student, in climb order. */
export function stepsAhead(level: StudentLevel, targetLevel: Level): Level[] {
  const from = ladderIndex(level);
  const to = LEVELS.indexOf(targetLevel);
  return LEVELS.slice(from + 1, to + 1);
}

/**
 * Honest hours to the target. Mastered topics (strength ≥ 60) discount the
 * step they belong to, proportionally to the step's registry coverage and
 * capped at MASTERY_DISCOUNT_CAP.
 */
export function hoursNeeded(input: {
  level: StudentLevel;
  targetLevel: Level;
  masteredTopics?: string[];
  kkNative?: boolean;
}): number {
  const mastered = new Set(input.masteredTopics ?? []);
  let hours = 0;
  for (const step of stepsAhead(input.level, input.targetLevel)) {
    const stepTopics = TOPICS.filter((t) => t.level === step && t.id !== "other");
    const doneShare = stepTopics.length
      ? stepTopics.filter((t) => mastered.has(t.id)).length / stepTopics.length
      : 0;
    hours += STEP_HOURS[step] * (1 - doneShare * MASTERY_DISCOUNT_CAP);
  }
  return input.kkNative ? hours * KK_NATIVE_FACTOR : hours;
}

export type PlanVerdict = "unknown" | "ok" | "tight" | "notEnough";

export type HonestPlan = {
  verdict: PlanVerdict;
  /** honest work to the target, hours (rounded) */
  needHours: number;
  /** realistic resource until the date, hours (0 when no date) */
  haveHours: number;
  /** need / have, % (null when no date) */
  loadPct: number | null;
  daysLeft: number | null;
  /** months of work at the current pace — "обычно нужно ~N месяцев" */
  monthsNeeded: number;
  /* ------- alternatives, meaningful when the verdict is notEnough ------- */
  /** pace that WOULD make the date; may exceed MAX_SUSTAINABLE_MINUTES —
   * then the honest message is "даже 4 часа в день не хватит" */
  minutesNeeded: number | null;
  /** ISO date the target becomes real at the current pace */
  dateNeeded: string | null;
  /** best level fully closeable within haveHours; null = current level */
  reachableLevel: Level | null;
  /** progress into the step AFTER reachableLevel, 0..1 — "подступ к B2" */
  nextStepShare: number;
  /** exam-FORMAT readiness by the date, 0..100 (null without a date):
   * separate axis from proficiency — task types/strategies/timing train fast */
  formatReadiness: number | null;
};

export function assessPlan(input: {
  level: StudentLevel;
  targetLevel: Level;
  masteredTopics?: string[];
  minutesDaily: number;
  daysLeft: number | null;
  kkNative?: boolean;
  todayIso?: string;
}): HonestPlan {
  const { daysLeft } = input;
  const minutes = Math.max(1, input.minutesDaily);
  const needHours = hoursNeeded(input);

  const daysNeeded = Math.ceil((needHours * 60) / (minutes * DISCIPLINE));
  const monthsNeeded = Math.max(1, Math.round(daysNeeded / 30));
  const base = input.todayIso ? Date.parse(input.todayIso) : Date.now();
  const d = new Date(base + daysNeeded * 86_400_000);
  const dateNeeded = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  if (daysLeft == null) {
    return {
      verdict: "unknown",
      needHours: Math.round(needHours),
      haveHours: 0,
      loadPct: null,
      daysLeft: null,
      monthsNeeded,
      minutesNeeded: null,
      dateNeeded,
      reachableLevel: null,
      nextStepShare: 0,
      formatReadiness: null,
    };
  }

  const haveHours = (Math.max(0, daysLeft) * minutes * DISCIPLINE) / 60;
  const loadPct = haveHours > 0 ? Math.round((needHours / haveHours) * 100) : Infinity;
  const verdict: PlanVerdict = loadPct <= 80 ? "ok" : loadPct <= 100 ? "tight" : "notEnough";

  // honest forecast: climb the ladder while the resource lasts
  let spent = 0;
  let reachableLevel: Level | null = null;
  let nextStepShare = 0;
  for (const step of stepsAhead(input.level, input.targetLevel)) {
    const stepHours = STEP_HOURS[step] * (input.kkNative ? KK_NATIVE_FACTOR : 1);
    if (spent + stepHours <= haveHours) {
      spent += stepHours;
      reachableLevel = step;
    } else {
      nextStepShare = Math.max(0, Math.min(1, (haveHours - spent) / stepHours));
      break;
    }
  }

  const minutesNeeded = Math.ceil((needHours * 60) / (Math.max(1, daysLeft) * DISCIPLINE));
  // the second, faster axis: how much of the exam FORMAT fits before the date
  const formatReadiness = Math.min(100, Math.round(((haveHours * FORMAT_SHARE) / FORMAT_HOURS) * 100));

  return {
    verdict,
    needHours: Math.round(needHours),
    haveHours: Math.round(haveHours),
    loadPct: Number.isFinite(loadPct) ? loadPct : null,
    daysLeft,
    monthsNeeded,
    minutesNeeded,
    dateNeeded,
    reachableLevel,
    nextStepShare,
    formatReadiness,
  };
}

/** Smallest offered pace covering `minutes`; null when even 240 is short. */
export function paceChoiceFor(minutes: number): number | null {
  for (const p of PACE_CHOICES) if (p >= minutes) return p;
  return null;
}
