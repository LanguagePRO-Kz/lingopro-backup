/**
 * THE single place for AI limit numbers (founder's final P0 decisions).
 * Server enforcement happens in quota.ts → consume_ai_quota RPC; clients may
 * read ai_usage to render honest counters, but can never bypass these.
 */

export const AI_LIMITS = {
  writing: { daily: 3, monthly: 60 },
  tutor: { daily: 30, monthly: 500 },
  /** Push-to-talk text coach (/api/speaking) — same class as the tutor. */
  speaking: { daily: 30, monthly: 500 },
  /** Diagnostic Yazma review — separate feature so retakes can't drain the cabinet writing quota. */
  diagnostic: { daily: 2, monthly: 10 },
  /** Study-route generation — event-driven only (settings change / big mock gap). */
  route: { daily: 3, monthly: 10 },
  /** Daily Ahu note on the dashboard — client caches per day, 2 covers a
   * mid-day language switch. */
  motivator: { daily: 2, monthly: 40 },
  voice: { dailyBaseMinutes: 10 },
} as const;

export type QuotaFeature = "writing" | "tutor" | "speaking" | "diagnostic" | "route" | "motivator";

/**
 * Unit-cost estimates for budget accounting (worst-case, USD).
 * Sources: bake-off actuals (RECON-2 §2.3) and voice pricing (RECON-1 §4).
 */
export const AI_COST_ESTIMATE_USD: Record<QuotaFeature, number> & { voiceMinute: number } = {
  writing: 0.03, // Sonnet path (KK); DeepSeek path is ~$0.004
  tutor: 0.006,
  speaking: 0.006,
  diagnostic: 0.03, // same task class as writing
  route: 0.05, // Sonnet + full registry in the prompt (cached)
  motivator: 0.002, // DeepSeek one-liner (KK → Sonnet, still tiny)
  voiceMinute: 0.13,
};

/**
 * Per-user monthly budget stop, founder's formula:
 * max($10, cost of the base voice quota + purchased minutes).
 * The stop catches anomalies — it must never cut into promised quotas.
 */
export function userMonthBudgetUsd(referenceDay: Date, purchasedMinutes = 0): number {
  const daysInMonth = new Date(referenceDay.getFullYear(), referenceDay.getMonth() + 1, 0).getDate();
  const baseQuotaCost = AI_LIMITS.voice.dailyBaseMinutes * daysInMonth * AI_COST_ESTIMATE_USD.voiceMinute;
  return Math.max(10, baseQuotaCost + purchasedMinutes * AI_COST_ESTIMATE_USD.voiceMinute);
}

/** Current date (YYYY-MM-DD) in the user's timezone — per-user midnight reset. */
export function todayInTimezone(tz?: string | null): string {
  return dateInTimezone(new Date(), tz);
}

/**
 * Календарная дата (YYYY-MM-DD) момента `at` в таймзоне юзера. Датировать
 * таймстампы срезом UTC-строки нельзя: активность в 01:30 ночи по Алматы
 * (UTC+5) — это ещё «вчера» по UTC, и Ahu честную сегодняшнюю работу
 * подписывала «dün» (правило 1.3).
 */
export function dateInTimezone(at: Date | string, tz?: string | null): string {
  const d = typeof at === "string" ? new Date(at) : at;
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: tz || "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10); // unknown tz string → UTC
  }
}
