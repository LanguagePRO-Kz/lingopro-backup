/**
 * Billing helpers — package prices, the diagnostic discount, promo codes and
 * the "selected plan" flag that gates access to the dashboard.
 * Everything is client-side placeholder logic; no real payment yet.
 */

export type PackageId = "1m" | "3m" | "6m";

export type Package = { id: PackageId; base: number; popular?: boolean };

export const PACKAGES: Package[] = [
  { id: "1m", base: 15990 },
  { id: "3m", base: 23990, popular: true },
  { id: "6m", base: 33990 },
];

/** 30% off for anyone who finished the diagnostic. */
export const QUIZ_DISCOUNT = 0.3;

/** Access days per package, used for the "per day" price. */
export const DAYS: Record<PackageId, number> = { "1m": 30, "3m": 90, "6m": 180 };

/** Rounded ₸-per-day for a given total price and package length. */
export function perDay(price: number, id: PackageId): number {
  return Math.round(price / DAYS[id]);
}

/** Discount window after the diagnostic, in ms (24h). */
export const DISCOUNT_WINDOW = 24 * 60 * 60 * 1000;

/** Promo codes stack additively on top of the diagnostic discount. */
export const PROMO_CODES: Record<string, number> = {
  LINGOPRO: 20,
  TOMER2026: 15,
  STUDENT: 10,
};

/** Round a price down to the nearest 10 ₸. */
export function roundPrice(n: number): number {
  return Math.floor(n / 10) * 10;
}

/** Apply a total discount fraction (0–0.9) to a base price. */
export function applyDiscount(base: number, fraction: number): number {
  const f = Math.min(0.9, Math.max(0, fraction));
  return roundPrice(base * (1 - f));
}

/** "15 990" with non-breaking thousands separators. */
export function formatPrice(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const PLAN_KEY = "lingopro:plan";

export function savePlan(id: PackageId) {
  try {
    window.localStorage.setItem(PLAN_KEY, id);
  } catch {
    /* ignore */
  }
}

export function loadPlan(): PackageId | null {
  try {
    return window.localStorage.getItem(PLAN_KEY) as PackageId | null;
  } catch {
    return null;
  }
}
