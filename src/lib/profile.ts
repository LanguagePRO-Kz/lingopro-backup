/**
 * Supabase-backed user profile — the persistent home for the selected plan,
 * the diagnostic result and the daily plan progress. localStorage stays as a
 * fast synchronous cache; these helpers mirror writes to the DB and hydrate
 * the cache on login (see the dashboard layout).
 */

import { createClient } from "@/lib/supabase/client";
import { sanitizeResult, type QuizResult } from "./quiz";
import type { Progress } from "./studyplan";

/** Daily study intensity chosen on first dashboard visit. */
export type Intensity = "light" | "medium" | "intensive";

/** Plan is free-form text: a package id ("1m"|"3m"|"6m") or "trial". */
export type Profile = {
  plan: string | null;
  quiz_result: QuizResult | null;
  plan_progress: Progress;
};

/**
 * Есть ли у юзера доступ ПРЯМО СЕЙЧАС (план не истёк). Нужен чекауту:
 * RPC отвечает «trial_used» и юзеру с живым триалом, и юзеру с истёкшим —
 * следующий шаг у них разный (в дашборд vs оплата). Чтение своего профиля
 * по RLS; не вошёл или ошибка чтения → честное false.
 */
export async function fetchAccessActive(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data?.plan) return false;
  const exp = data.plan_expires_at as string | null;
  return exp == null || Date.parse(exp) > Date.now();
}

/** Read the current user's profile (null if not signed in). */
export async function fetchProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // NB: select ONLY columns that exist — one bad column 400s the whole query
  // (a phantom study_intensity here silently broke result migration for weeks)
  const { data, error } = await supabase
    .from("profiles")
    .select("plan, quiz_result, plan_progress")
    .eq("id", user.id)
    .maybeSingle();
  if (error) console.error("[profile] fetch failed:", error.message);

  return {
    plan: (data?.plan as string | null) ?? null,
    // битый JSONB = результата нет — потребители (pricing, quiz/result,
    // гидрация дашборда) не должны падать на неполной форме
    quiz_result: sanitizeResult(data?.quiz_result),
    plan_progress: (data?.plan_progress as Progress | null) ?? {},
  };
}

/** @returns true when the write reached the DB — callers may drop local caches only then */
async function upsert(patch: Record<string, unknown>): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: (user.user_metadata?.full_name as string) ?? null,
    ...patch,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("[profile] upsert failed:", error.message);
  return !error;
}

// saveProfilePlan удалён (P0-2): plan/plan_expires_at пишет только сервер —
// вебхук оплаты (grant.ts) и redeem_promo(); клиентская запись заблокирована
// триггером profiles_protect_plan (миграция 0014).
export const saveProfileResult = (quiz_result: QuizResult) => upsert({ quiz_result });
export const saveProfileProgress = (plan_progress: Progress) => upsert({ plan_progress });

/**
 * City / country used by the leaderboard scopes. Kept in a dedicated helper so
 * a failed write (e.g. columns not migrated yet) can't corrupt other profile
 * fields — this is the only upsert that touches them.
 */
export const saveProfileLocation = (city: string | null, country: string | null) =>
  upsert({ city, country });

/**
 * Синхронизация таймзоны профиля с браузером. До этого timezone не писал
 * НИКТО (0 из 57 профилей в проде на 14.07.2026) — «сегодня» всех юзеров
 * считалось по UTC, и Ahu подписывала ночную работу Казахстана (00:00–05:00
 * локального) вчерашним днём. Пишем только при реальном расхождении.
 */
export async function syncProfileTimezone(): Promise<void> {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("profiles").select("timezone").eq("id", user.id).maybeSingle();
    if (!data || data.timezone === tz) return;
    const { error } = await supabase.from("profiles").update({ timezone: tz }).eq("id", user.id);
    if (error) console.error("[profile] timezone sync failed:", error.message);
  } catch {
    /* Intl/сеть недоступны — не критично, следующий заход попробует снова */
  }
}

/** Read the current user's city/country (error-tolerant — returns nulls if the columns don't exist yet). */
export async function fetchProfileLocation(): Promise<{ city: string | null; country: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { city: null, country: null };
  const { data, error } = await supabase.from("profiles").select("city, country").eq("id", user.id).maybeSingle();
  if (error || !data) return { city: null, country: null };
  return { city: (data.city as string | null) ?? null, country: (data.country as string | null) ?? null };
}
