/**
 * Server-only: применение webhook-события к нашей БД. Общая логика обоих
 * провайдеров: идемпотентность, сверка суммы/валюты, выдача доступа.
 *
 * Доступ выдаётся ТОЛЬКО здесь (сервером, по подписанному webhook'у) —
 * клиент никогда не «сам себе открывает» оплату.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { VOICE_PACKS, type VoicePackId } from "@/lib/pricing";
import type { PaymentProviderId, WebhookEvent } from "./types";

type PaymentRow = {
  id: string;
  user_id: string;
  package_id: string;
  currency: string;
  amount_minor: number;
  status: string;
};

export async function applyWebhookEvent(
  providerId: PaymentProviderId,
  event: WebhookEvent,
): Promise<{ status: number; body: Record<string, unknown> }> {
  if (!event.ok) {
    // bad_signature → 401 (провайдер поймёт, что подпись не сошлась);
    // not_configured → 503 (заглушка ещё спит); bad_payload → 400.
    const status = event.reason === "bad_signature" ? 401 : event.reason === "not_configured" ? 503 : 400;
    return { status, body: { ok: false, reason: event.reason } };
  }
  if (event.type === "ignored" || event.type === "pending") {
    return { status: 200, body: { ok: true, ignored: true } };
  }

  const admin = createAdminClient();
  if (!admin) return { status: 503, body: { ok: false, reason: "no_admin_client" } };

  // ищем наш платёж: сперва по payments.id из metadata, иначе по id провайдера
  let row: PaymentRow | null = null;
  if (event.paymentId) {
    const { data } = await admin
      .from("payments")
      .select("id, user_id, package_id, currency, amount_minor, status")
      .eq("id", event.paymentId)
      .maybeSingle();
    row = (data as PaymentRow | null) ?? null;
  }
  if (!row && event.providerPaymentId) {
    const { data } = await admin
      .from("payments")
      .select("id, user_id, package_id, currency, amount_minor, status")
      .eq("provider", providerId)
      .eq("provider_payment_id", event.providerPaymentId)
      .maybeSingle();
    row = (data as PaymentRow | null) ?? null;
  }
  // 404 → провайдер ретраит позже (строка может ещё не закоммититься)
  if (!row) return { status: 404, body: { ok: false, reason: "payment_not_found" } };

  if (event.type === "failed") {
    if (row.status === "pending") {
      await admin.from("payments").update({ status: "failed", raw: event.raw ?? null }).eq("id", row.id);
    }
    return { status: 200, body: { ok: true, failed: true } };
  }

  /* ------------------------------- paid ------------------------------- */
  if (event.type !== "paid") return { status: 200, body: { ok: true, ignored: true } };

  // идемпотентность: повторный webhook той же оплаты — просто 200
  if (row.status === "paid") return { status: 200, body: { ok: true, already: true } };

  // сверка суммы и валюты — оплату с чужой суммой не засчитываем
  if (event.amountMinor != null && event.amountMinor !== row.amount_minor) {
    console.error("[payments] amount mismatch", { paymentId: row.id, expected: row.amount_minor, got: event.amountMinor });
    return { status: 409, body: { ok: false, reason: "amount_mismatch" } };
  }
  if (event.currency && event.currency !== row.currency) {
    console.error("[payments] currency mismatch", { paymentId: row.id, expected: row.currency, got: event.currency });
    return { status: 409, body: { ok: false, reason: "currency_mismatch" } };
  }

  const { error: updErr } = await admin
    .from("payments")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      provider_payment_id: event.providerPaymentId,
      raw: event.raw ?? null,
    })
    .eq("id", row.id)
    .eq("status", "pending"); // гонка двух webhook'ов: выигрывает один
  if (updErr) {
    console.error("[payments] update failed", updErr.message);
    return { status: 500, body: { ok: false, reason: "db_error" } };
  }

  /* ------------- докупка (Блок 5) → voice_minute_credits ------------- */
  const pack = VOICE_PACKS.kzt[row.package_id as VoicePackId] as
    | { kind: string; units: number }
    | undefined;
  if (pack) {
    // expires_at = null: купленное лежит СВЕРХ месячного лимита и не сгорает
    // вместе с ним (решение основателя 16.08.2026). Прежние пакеты минут
    // жили до конца календарного месяца — купивший 28-го терял их через три
    // дня, и это была самая частая претензия к допам.
    const { error: creditErr } = await admin.from("voice_minute_credits").insert({
      user_id: row.user_id,
      kind: pack.kind,
      minutes: pack.units, // колонка называется minutes исторически; для уроков и экзаменов это штуки
      source: "purchase",
      expires_at: null,
    });
    if (creditErr) {
      console.error("[payments] top-up grant failed", creditErr.message);
      return { status: 500, body: { ok: false, reason: "grant_failed" } };
    }
    return { status: 200, body: { ok: true, paid: true, kind: pack.kind, units: pack.units } };
  }

  /* --------------- пакет доступа → plan + срок (P0-2, 0014) --------------- */
  const days = ACCESS_DAYS[row.package_id];
  if (!days) {
    console.error("[payments] unknown access package", row.package_id);
    return { status: 500, body: { ok: false, reason: "grant_failed" } };
  }
  // продление стакается: остаток ОПЛАЧЕННОГО срока не сгорает; триал
  // не продлевается, а заменяется платным сроком от «сейчас»
  const { data: prof } = await admin
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", row.user_id)
    .maybeSingle();
  const nowMs = Date.now();
  const currentMs = prof?.plan_expires_at ? Date.parse(prof.plan_expires_at as string) : 0;
  const baseMs = prof?.plan && prof.plan !== "trial" && currentMs > nowMs ? currentMs : nowMs;
  const expiresAt = new Date(baseMs + days * 86_400_000).toISOString();

  const { error: grantErr } = await admin
    .from("profiles")
    .update({ plan: row.package_id, plan_expires_at: expiresAt })
    .eq("id", row.user_id);
  if (grantErr) {
    console.error("[payments] grant failed", grantErr.message);
    return { status: 500, body: { ok: false, reason: "grant_failed" } };
  }

  return { status: 200, body: { ok: true, paid: true, expiresAt } };
}

/** Дни доступа по тарифу — источник срока plan_expires_at. */
const ACCESS_DAYS: Record<string, number> = { "1m": 30, "3m": 90, "6m": 180 };
