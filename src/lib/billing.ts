/**
 * Billing helpers — package identity, per-day math and the "selected plan"
 * flag that gates dashboard access. Real prices live in `@/lib/pricing`
 * (multi-currency). Promo codes are server-side only — see `@/lib/promo`
 * and the `redeem_promo()` RPC; there is deliberately NO client-side code list.
 * Access is granted by the payment webhook (lib/payments/grant.ts) or by a
 * genuine 100% promo redemption — never silently by the client.
 */

export type PackageId = "1m" | "3m" | "6m";

/** Access days per package, used for the "per day" price. */
export const DAYS: Record<PackageId, number> = { "1m": 30, "3m": 90, "6m": 180 };

/** Rounded price-per-day for a given total price and package length. */
export function perDay(price: number, id: PackageId): number {
  return Math.round(price / DAYS[id]);
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
