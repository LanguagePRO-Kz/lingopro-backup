/**
 * Promo redemption — the ONLY promo path. Codes live in the `promo_codes`
 * table and are validated + consumed atomically by the `redeem_promo()` RPC
 * (block E1, migration 0002): one code per user, use-limited, expiry-aware.
 * There is no client-side code list — the database is the single source of
 * truth. See supabase/migrations/0002_foundation.sql line ~503.
 */
import { createClient } from "@/lib/supabase/client";
import type { PackageId } from "@/lib/billing";

/** Decline reasons returned verbatim by redeem_promo(). */
export type PromoReason =
  | "unauthenticated"
  | "not_found"
  | "expired"
  | "exhausted"
  | "wrong_package"
  | "not_first_purchase";

export type PromoResult =
  | { ok: true; discountPercent: number; alreadyRedeemed: boolean }
  | { ok: false; reason: PromoReason | "error" };

type RpcResponse = {
  ok: boolean;
  reason?: PromoReason | "already_used";
  discount_percent?: number;
};

/**
 * Redeem `code` for `pkgId`. `already_used` is surfaced as success with
 * `alreadyRedeemed: true` — the user legitimately redeemed this code before,
 * so they keep the access it grants (idempotent from the caller's view).
 */
export async function redeemPromo(code: string, pkgId: PackageId): Promise<PromoResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("redeem_promo", {
    p_code: code.trim(),
    p_package_id: pkgId,
  });

  if (error) {
    console.error("[redeem_promo]", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return { ok: false, reason: "error" };
  }

  const res = data as RpcResponse | null;
  if (res?.ok) {
    return { ok: true, discountPercent: res.discount_percent ?? 0, alreadyRedeemed: false };
  }
  if (res?.reason === "already_used") {
    return { ok: true, discountPercent: 0, alreadyRedeemed: true };
  }
  return { ok: false, reason: res?.reason ?? "error" };
}
