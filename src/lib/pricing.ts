/**
 * Shared, currency-aware pricing used by both the landing (/#pricing) and the
 * /pricing page. Currency follows the interface language: RU/KZ → tenge,
 * everything else (EN/TR/…) → US dollars.
 *
 * `disc`/`discPerDay` are the fixed 30% post-diagnostic prices (given, not
 * computed, so rounding matches the design across both currencies).
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
      { id: "1m", price: 15990, perDay: 533, disc: 11190, discPerDay: 373 },
      { id: "3m", price: 23990, perDay: 267, disc: 16790, discPerDay: 187, popular: true },
      { id: "6m", price: 33990, perDay: 189, disc: 23790, discPerDay: 132 },
    ],
  },
  usd: {
    sym: "$",
    plans: [
      { id: "1m", price: 33, perDay: 1.1, disc: 23, discPerDay: 0.77 },
      { id: "3m", price: 50, perDay: 0.56, disc: 35, discPerDay: 0.39, popular: true },
      { id: "6m", price: 72, perDay: 0.4, disc: 50, discPerDay: 0.28 },
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
