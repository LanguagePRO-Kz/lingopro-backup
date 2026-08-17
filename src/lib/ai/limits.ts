/**
 * THE single place for AI limit numbers (founder's final P0 decisions).
 * Server enforcement happens in quota.ts → consume_ai_quota RPC; clients may
 * read ai_usage to render honest counters, but can never bypass these.
 */

export const AI_LIMITS = {
  writing: { daily: 3, monthly: 60 },
  tutor: { daily: 30, monthly: 500 },
  /** Текстовая подсказка Ahu на странице плана (/api/speaking) — класс чата. */
  speaking: { daily: 30, monthly: 500 },
  /** Diagnostic Yazma review — separate feature so retakes can't drain the cabinet writing quota. */
  diagnostic: { daily: 2, monthly: 10 },
  /** Study-route generation — event-driven only (settings change / big mock gap). */
  route: { daily: 3, monthly: 10 },
  /** Daily Ahu note on the dashboard — client caches per day, 2 covers a
   * mid-day language switch. */
  motivator: { daily: 2, monthly: 40 },
  /** 15 (было 10): Konuşma-симуляция B1+ идёт 12-14 мин — обрыв на монологе
   * хуже лишних минут (решение основателя 27.07). Экономика: медиана голоса
   * ~45 мин/МЕСЯЦ (RECON-2 §4) в дневной лимит не упирается — изменение
   * двигает только хвост распределения; база не накапливается день-к-дню. */
  voice: { dailyBaseMinutes: 15 },
} as const;

/* ------------------------- лимиты голоса по плану -------------------------
 * Блок 4 (16.08.2026). Одинаковы для всех пакетов и для B2B — тариф даёт
 * СРОК доступа, а не объём: так проще продавать и невозможно ошибиться,
 * называя лимиты на созвоне.
 *
 * Практика считается МИНУТАМИ, уроки и экзамены — ШТУКАМИ: у практики нет
 * естественной единицы (говорить можно 3 минуты и 30), у урока и экзамена
 * есть — сам урок и сам экзамен.
 *
 * 150 мин/мес практики (не 240-300): пока практика живёт на ElevenLabs,
 * её минута стоит ~45 ₸ — 300 минут съедали бы всю выручку 6-месячного
 * пакета. Поднимаем после переезда на другого провайдера (решение
 * основателя 16.08.2026). Дневные 5 минут размазывают расход по месяцу и
 * заодно держат привычку ежедневности.
 */
export type UsageKind = "practice_minutes" | "lesson" | "exam";

export type PlanLimits = {
  /** дневной потолок минут практики; 0 = потолка нет */
  practiceDaily: number;
  practiceMonthly: number;
  lessonsMonthly: number;
  examsMonthly: number;
};

export const PLAN_LIMITS: Record<"paid" | "trial", PlanLimits> = {
  paid: { practiceDaily: 5, practiceMonthly: 150, lessonsMonthly: 4, examsMonthly: 2 },
  /* Триал 3 дня: 1 урок + 30 минут практики, экзамена нет. Дневные 10 (а не
   * 5) — иначе обещанные 30 минут физически не выбрать за три дня. */
  trial: { practiceDaily: 10, practiceMonthly: 30, lessonsMonthly: 1, examsMonthly: 0 },
};

/**
 * Из чего списывается занятие (Блок 4). Практика — минуты, урок и экзамен —
 * штуки. Проба уровня не берёт ничего: она бесплатна by design и бывает
 * ровно одна на студента (гейт стоит в роуте сессии).
 */
export function usageKindFor(mode: string): UsageKind | null {
  if (mode === "practice") return "practice_minutes";
  if (mode === "sinav") return "exam";
  if (mode === "diagnostic_speaking") return null;
  return "lesson"; // lesson и его серверный вариант foundation
}

export function limitsForPlan(plan: string | null): PlanLimits {
  return plan === "trial" || !plan ? PLAN_LIMITS.trial : PLAN_LIMITS.paid;
}

/** Дневной и месячный потолок конкретного вида занятия. */
export function limitFor(kind: UsageKind, plan: string | null): { daily: number; monthly: number } {
  const l = limitsForPlan(plan);
  if (kind === "practice_minutes") return { daily: l.practiceDaily, monthly: l.practiceMonthly };
  if (kind === "lesson") return { daily: 0, monthly: l.lessonsMonthly };
  return { daily: 0, monthly: l.examsMonthly };
}

const CYCLE_MS = 30 * 86_400_000;

/**
 * Ключ месячного цикла — ПОДПИСОЧНОГО, не календарного.
 *
 * Календарный месяц дарит лишний лимит тому, кто купил в конце месяца:
 * подписка на 30 дней с 28 августа получила бы и августовские 150 минут, и
 * сентябрьские — 300 минут за один оплаченный месяц. Поэтому циклы
 * отсчитываются 30-дневными шагами НАЗАД от даты окончания доступа: она
 * известна точно (`profiles.plan_expires_at`) и корректно учитывает
 * продления, которые стакаются.
 *
 * Без срока доступа (данных нет) честно падаем на календарный месяц.
 */
export function billingPeriod(planExpiresAt: string | null, now: Date = new Date(), tz?: string | null): string {
  const exp = planExpiresAt ? Date.parse(planExpiresAt) : NaN;
  if (!Number.isFinite(exp)) return `cal-${dateInTimezone(now, tz).slice(0, 7)}`;
  const cycle = Math.max(0, Math.floor((exp - now.getTime()) / CYCLE_MS));
  return `sub-${new Date(exp).toISOString().slice(0, 10)}-${cycle}`;
}

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
