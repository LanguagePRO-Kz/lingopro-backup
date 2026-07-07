/**
 * Server-side quota gate for AI routes: session required, then the atomic
 * consume_ai_quota RPC (daily + monthly + per-user budget), plus an optional
 * global monthly budget stop (AI_MONTHLY_BUDGET_USD, needs the service key).
 *
 * Import only from route handlers / server code — uses next/headers cookies.
 */

import { createClient as createSupabaseJs } from "@supabase/supabase-js";
import { createClient } from "../supabase/server";
import {
  AI_COST_ESTIMATE_USD,
  AI_LIMITS,
  todayInTimezone,
  userMonthBudgetUsd,
  type QuotaFeature,
} from "./limits";

export type QuotaOutcome =
  | { ok: true; userId: string; usedToday: number; usedMonth: number }
  | { ok: false; status: 401 | 429 | 503; reason: string };

/** Global spend this month, cached for a minute to avoid a query per request. */
let globalCache: { at: number; total: number } | null = null;

async function globalBudgetExceeded(): Promise<boolean> {
  const budget = Number(process.env.AI_MONTHLY_BUDGET_USD);
  // new key format (sb_secret_...) preferred; legacy service_role JWT also works
  const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!budget || !serviceKey) return false; // guard not configured → skip

  if (!globalCache || Date.now() - globalCache.at > 60_000) {
    const admin = createSupabaseJs(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
    const monthStart = new Date();
    const from = `${monthStart.getUTCFullYear()}-${String(monthStart.getUTCMonth() + 1).padStart(2, "0")}-01`;
    const { data, error } = await admin.from("ai_usage").select("cost_usd").gte("day", from);
    if (error) return false; // fail open: the guard is a safety net, not a wall
    const total = (data ?? []).reduce((s, r) => s + Number(r.cost_usd ?? 0), 0);
    globalCache = { at: Date.now(), total };
  }
  return globalCache.total >= budget;
}

/**
 * Authenticates the request and consumes one unit of the feature's quota.
 * Callers translate {status, reason} into an honest localized response.
 */
export async function consumeQuota(feature: QuotaFeature): Promise<QuotaOutcome> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, status: 401, reason: "auth_required" };

  if (await globalBudgetExceeded()) {
    return { ok: false, status: 503, reason: "global_budget" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();
  const day = todayInTimezone((profile?.timezone as string | null) ?? null);

  const { data, error } = await supabase.rpc("consume_ai_quota", {
    p_feature: feature,
    p_day: day,
    p_amount: 1,
    p_daily_limit: AI_LIMITS[feature].daily,
    p_monthly_limit: AI_LIMITS[feature].monthly,
    p_cost_usd: AI_COST_ESTIMATE_USD[feature],
    p_user_month_budget_usd: userMonthBudgetUsd(new Date()),
  });

  if (error) {
    console.error("[quota] consume_ai_quota failed:", error.message);
    return { ok: false, status: 503, reason: "quota_unavailable" };
  }

  const r = data as { allowed: boolean; reason: string | null; used_today?: number; used_month?: number };
  if (!r.allowed) {
    return { ok: false, status: r.reason === "unauthenticated" ? 401 : 429, reason: r.reason ?? "limit" };
  }
  return { ok: true, userId: user.id, usedToday: r.used_today ?? 0, usedMonth: r.used_month ?? 0 };
}
