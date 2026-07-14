/**
 * Billing helpers — package identity and per-day math. Real prices live in
 * `@/lib/pricing` (multi-currency). Promo codes are server-side only — see
 * `@/lib/promo` and the `redeem_promo()` RPC.
 *
 * P0-2: доступ решает ТОЛЬКО сервер по profiles.plan + plan_expires_at
 * (выдают вебхук оплаты и redeem_promo). Клиентского флага доступа
 * (бывший localStorage "lingopro:plan") больше не существует.
 */

export type PackageId = "1m" | "3m" | "6m";

/** Access days per package, used for the "per day" price. */
export const DAYS: Record<PackageId, number> = { "1m": 30, "3m": 90, "6m": 180 };

/** Rounded price-per-day for a given total price and package length. */
export function perDay(price: number, id: PackageId): number {
  return Math.round(price / DAYS[id]);
}
