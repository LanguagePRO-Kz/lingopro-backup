/**
 * Feasibility model (DESIGN-PLAN-ENGINE §6) — the honest math behind
 * "will I make it by the exam at this pace?". Pure function; the settings
 * UI turns the verdict into a confirmation modal with real alternatives
 * (more minutes / later date / B2 instead of C1) — never a silent rebuild.
 */

/**
 * Practice minutes to "close" one topic. A calibration ESTIMATE, not a
 * measurement — recompute from task_results.created_at pace after a few
 * weeks of real data.
 */
export const TOPIC_MINUTES = 90;
/** Share of daily minutes that goes into topic work (rest: mocks, reviews). */
export const PRACTICE_SHARE = 0.7;

export type Feasibility =
  | { verdict: "unknown"; daysNeeded: number } // no exam date — nothing to miss
  | {
      verdict: "ok" | "tight" | "notEnough";
      daysNeeded: number;
      daysLeft: number;
      /** notEnough only: minutes/day that would make it */
      minutesNeeded?: number;
      /** notEnough only: ISO date that would make it at the current pace */
      dateNeeded?: string;
    };

export function assessFeasibility(input: {
  remainingTopics: number;
  minutesDaily: number;
  daysLeft: number | null;
  todayIso?: string;
}): Feasibility {
  const { remainingTopics, minutesDaily, daysLeft } = input;
  const perDay = Math.max(1, minutesDaily) * PRACTICE_SHARE;
  const daysNeeded = Math.ceil((remainingTopics * TOPIC_MINUTES) / perDay);

  if (daysLeft == null) return { verdict: "unknown", daysNeeded };

  if (daysNeeded <= daysLeft * 0.85) return { verdict: "ok", daysNeeded, daysLeft };
  if (daysNeeded <= daysLeft) return { verdict: "tight", daysNeeded, daysLeft };

  const minutesNeeded = Math.ceil((remainingTopics * TOPIC_MINUTES) / (Math.max(1, daysLeft) * PRACTICE_SHARE));
  const base = input.todayIso ? Date.parse(input.todayIso) : Date.now();
  const d = new Date(base + daysNeeded * 86_400_000);
  const dateNeeded = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { verdict: "notEnough", daysNeeded, daysLeft, minutesNeeded, dateNeeded };
}
