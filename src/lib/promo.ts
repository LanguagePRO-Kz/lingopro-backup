/**
 * Promo redemption — the ONLY promo path. Codes live in the `promo_codes`
 * table and are validated + consumed atomically by the `redeem_promo()` RPC
 * (0002, переписан в 0014): one code per user, use-limited, expiry-aware.
 * Два типа кодов (P0-2): 'trial' — RPC САМ выдаёт доступ на N дней (клиент
 * план не пишет никогда); 'discount' — % скидки к реальной оплате.
 * There is no client-side code list — the database is the single source of
 * truth.
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
  | "not_first_purchase"
  | "already_used"
  | "trial_used"
  | "already_active";

export type PromoResult =
  | { ok: true; kind: "trial"; trialDays: number }
  | { ok: true; kind: "discount"; discountPercent: number }
  | { ok: false; reason: PromoReason | "error" };

type RpcResponse = {
  ok: boolean;
  reason?: PromoReason;
  kind?: "trial" | "discount";
  discount_percent?: number;
  trial_days?: number;
};

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
  if (res?.ok && res.kind === "trial") {
    return { ok: true, kind: "trial", trialDays: res.trial_days ?? 3 };
  }
  if (res?.ok) {
    return { ok: true, kind: "discount", discountPercent: res.discount_percent ?? 0 };
  }
  return { ok: false, reason: res?.reason ?? "error" };
}
