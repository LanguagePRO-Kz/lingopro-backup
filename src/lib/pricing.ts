/**
 * Shared, currency-aware pricing used by both the landing (/#pricing) and the
 * /pricing page. Currency follows the interface language: RU/KZ → tenge,
 * everything else (EN/TR/…) → US dollars.
 *
 * `disc`/`discPerDay` are the fixed 30% post-diagnostic prices (given, not
 * computed, so rounding matches the design across both currencies).
 * USD mirrors KZT at ≈512 ₸/$ with psychological rounding, keeping the
 * package savings identical across currencies (3m ≈ −28%, 6m ≈ −46%).
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
    plans: [
      { id: "1m", price: 19990, perDay: 666, disc: 13990, discPerDay: 466 },
      { id: "3m", price: 42990, perDay: 478, disc: 29990, discPerDay: 333, popular: true },
      { id: "6m", price: 64990, perDay: 361, disc: 44990, discPerDay: 250 },
    ],
  },
  usd: {
    sym: "$",
    plans: [
      { id: "1m", price: 39, perDay: 1.3, disc: 27, discPerDay: 0.9 },
      { id: "3m", price: 84, perDay: 0.93, disc: 59, discPerDay: 0.66, popular: true },
      { id: "6m", price: 126, perDay: 0.7, disc: 88, discPerDay: 0.49 },
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

const MONTHS: Record<PackageId, number> = { "1m": 1, "3m": 3, "6m": 6 };

/**
 * Honest savings of a package vs buying the same period month-by-month,
 * computed from the actual prices so the marketing % can never drift.
 */
export function savingsPct(cur: Currency, id: PackageId): number {
  const monthly = planRow(cur, "1m").price * MONTHS[id];
  return Math.round((1 - planRow(cur, id).price / monthly) * 100);
}
