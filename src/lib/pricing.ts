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
    plans: [
      { id: "1m", price: 19990, perDay: 666, disc: 13990, discPerDay: 466 },
      { id: "3m", price: 42990, perDay: 478, disc: 29990, discPerDay: 333, popular: true },
      { id: "6m", price: 64990, perDay: 361, disc: 44990, discPerDay: 250 },
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

/* ------------------------- пакеты голосовых минут ------------------------- */

export type VoicePackId = "vp30" | "vp60" | "vp120";

export const VOICE_PACK_IDS: VoicePackId[] = ["vp30", "vp60", "vp120"];

/**
 * Допы: докупаемые минуты голосовых уроков (живут до конца календарного
 * месяца покупки — см. grant.ts). KZT — цены основателя (P0);
 * USD — плейсхолдер по курсу ≈512 ₸/$ до финальной сетки.
 */
export const VOICE_PACKS: Record<Currency, Record<VoicePackId, { minutes: number; price: number }>> = {
  kzt: {
    vp30: { minutes: 30, price: 4990 },
    vp60: { minutes: 60, price: 8990 },
    vp120: { minutes: 120, price: 15990 },
  },
  usd: {
    vp30: { minutes: 30, price: 9.99 },
    vp60: { minutes: 60, price: 17.99 },
    vp120: { minutes: 120, price: 30.99 },
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
