/**
 * Server-only: применение webhook-события к нашей БД. Общая логика обоих
 * провайдеров: идемпотентность, сверка суммы/валюты, выдача доступа.
 *
 * Доступ выдаётся ТОЛЬКО здесь (сервером, по подписанному webhook'у) —
 * клиент никогда не «сам себе открывает» оплату.
 */

import { createAdminClient } from "@/lib/supabase/admin";
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

  // выдача доступа — тот же флаг, что ставит redeem_promo (гейт дашборда)
  const { error: grantErr } = await admin.from("profiles").update({ plan: row.package_id }).eq("id", row.user_id);
  if (grantErr) {
    console.error("[payments] grant failed", grantErr.message);
    return { status: 500, body: { ok: false, reason: "grant_failed" } };
  }

  return { status: 200, body: { ok: true, paid: true } };
}
