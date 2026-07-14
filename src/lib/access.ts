/**
 * Серверная проверка доступа (P0-2): активная подписка = plan is not null
 * AND plan_expires_at > now(). Единственный источник правды — profiles в БД
 * (колонки пишет только сервер: вебхук оплаты и redeem_promo, миграция 0014).
 *
 * Использовать в КАЖДОМ платном API-роуте — «до этого экрана дошёл только
 * платный» не защита: клиент дёргает API напрямую. Бесплатны по решению
 * основателя: диагностика (вход в продукт), payments/* (покупка),
 * voice/session/end|wrap (биллинг-сеттл уже начатого урока).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type AccessCheck =
  | { ok: true; userId: string; plan: string; expiresAt: string }
  | { ok: false; status: 401 | 402; reason: "auth_required" | "plan_required" };

export async function requireActivePlan(client?: SupabaseClient): Promise<AccessCheck> {
  const supabase = client ?? (await createClient());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, status: 401, reason: "auth_required" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .maybeSingle();

  const plan = (profile?.plan as string | null) ?? null;
  const expiresAt = (profile?.plan_expires_at as string | null) ?? null;
  if (!plan || !expiresAt || Date.parse(expiresAt) <= Date.now()) {
    return { ok: false, status: 402, reason: "plan_required" };
  }
  return { ok: true, userId: user.id, plan, expiresAt };
}
