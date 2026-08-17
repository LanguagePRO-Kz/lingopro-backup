/**
 * Shared, currency-aware pricing used by both the landing (/#pricing) and the
 * /pricing page. Currency follows the interface language: RU/KZ → tenge,
 * everything else (EN/TR/…) → US dollars.
 *
 * `disc`/`discPerDay` are the fixed 30% post-diagnostic prices (given, not
 * computed, so rounding matches the design across both currencies).
 * USD: founder-set discounted tier $29.99/$59.99/$89.99 (≈473 ₸/$),
 * base = discounted ÷ 0.7 with .99 rounding; global grid to be tuned later.
 */

import type { Locale } from "./i18n";
import type { PackageId } from "./billing";

export type Currency = "kzt" | "usd";

export type PlanRow = {
  id: PackageId;
  price: number;
  perDay: number;
  disc: number;
  discPerDay: number;
  popular?: boolean;
};

export const PRICING: Record<Currency, { sym: string; plans: PlanRow[] }> = {
  kzt: {
    sym: "₸",
    /* Цены основателя от 16.08.2026 стоят в `disc` — это то, что студент
     * РЕАЛЬНО платит после бесплатной диагностики (checkout берёт disc при
     * скидке 30%, а диагностику проходят практически все). Экономика лимитов
     * считалась именно от 16990/39990/69990; поставить их в `price` значило бы
     * получить фактическую выручку на 30% ниже расчётной. `price` — якорь. */
    plans: [
      { id: "1m", price: 23990, perDay: 800, disc: 16990, discPerDay: 566 },
      { id: "3m", price: 56990, perDay: 633, disc: 39990, discPerDay: 444, popular: true },
      { id: "6m", price: 99990, perDay: 555, disc: 69990, discPerDay: 389 },
    ],
  },
  usd: {
    sym: "$",
    plans: [
      { id: "1m", price: 42.99, perDay: 1.43, disc: 29.99, discPerDay: 1 },
      { id: "3m", price: 85.99, perDay: 0.96, disc: 59.99, discPerDay: 0.67, popular: true },
      { id: "6m", price: 128.99, perDay: 0.72, disc: 89.99, discPerDay: 0.5 },
    ],
  },
};

/** RU/KK → tenge, every other locale → dollars. */
export function currencyFor(locale: Locale): Currency {
  return locale === "ru" || locale === "kk" ? "kzt" : "usd";
}

/** "15 990 ₸" for KZT; "$33" / "$0.56" for USD (2 decimals only when needed). */
export function fmtMoney(cur: Currency, n: number): string {
  if (cur === "kzt") {
    const grouped = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `${grouped} ₸`;
  }
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

/** Look up a currency's plan row by package id. */
export function planRow(cur: Currency, id: PackageId): PlanRow {
  return PRICING[cur].plans.find((p) => p.id === id)!;
}

/* ------------------------------- докупки --------------------------------- */

export type VoicePackId = "pp60" | "pp150" | "pl4" | "pl10" | "pe2" | "pe5";

export const VOICE_PACK_IDS: VoicePackId[] = ["pp60", "pp150", "pl4", "pl10", "pe2", "pe5"];

export type PackKind = "practice_minutes" | "lesson" | "exam";

/**
 * Докупки сверх месячного лимита (Блок 5, цены основателя от 16.08.2026).
 * Купленное ложится СВЕРХ лимита и НЕ сгорает вместе с ним — в отличие от
 * прежних пакетов минут, которые жили до конца календарного месяца.
 * USD — плейсхолдер по курсу ≈512 ₸/$ до финальной сетки.
 *
 * `units`: для практики это минуты, для уроков и экзаменов — штуки.
 */
export const VOICE_PACKS: Record<Currency, Record<VoicePackId, { kind: PackKind; units: number; price: number }>> = {
  kzt: {
    pp60: { kind: "practice_minutes", units: 60, price: 2990 },
    pp150: { kind: "practice_minutes", units: 150, price: 5990 },
    pl4: { kind: "lesson", units: 4, price: 3990 },
    pl10: { kind: "lesson", units: 10, price: 8990 },
    pe2: { kind: "exam", units: 2, price: 2990 },
    pe5: { kind: "exam", units: 5, price: 5990 },
  },
  usd: {
    pp60: { kind: "practice_minutes", units: 60, price: 5.99 },
    pp150: { kind: "practice_minutes", units: 150, price: 11.99 },
    pl4: { kind: "lesson", units: 4, price: 7.99 },
    pl10: { kind: "lesson", units: 10, price: 17.99 },
    pe2: { kind: "exam", units: 2, price: 5.99 },
    pe5: { kind: "exam", units: 5, price: 11.99 },
  },
};

const MONTHS: Record<PackageId, number> = { "1m": 1, "3m": 3, "6m": 6 };

/**
 * Honest savings of a package vs buying the same period month-by-month,
 * computed from the actual prices so the marketing % can never drift.
 */
export function savingsPct(cur: Currency, id: PackageId): number {
  const monthly = planRow(cur, "1m").price * MONTHS[id];
  return Math.round((1 - planRow(cur, id).price / monthly) * 100);
}
