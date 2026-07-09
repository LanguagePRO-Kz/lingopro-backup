/**
 * Kaspi (Казахстан, тенге) — боевая структура, спящая до ключей.
 *
 * Поддержаны ОБА сценария Kaspi (какой именно даст банк — уточнит основатель,
 * переключение одной env-переменной KASPI_FLOW=api|qr):
 *   • api — Merchant API: создаём счёт → редирект на страницу оплаты Kaspi →
 *           webhook «оплачено»;
 *   • qr  — платёж по QR: создаём QR-инвойс → показываем QR → webhook.
 *
 * Активация (см. docs/PAYMENTS.md):
 *   KASPI_MODE=test|live
 *   KASPI_API_BASE=…        ← базовый URL из договора (sandbox/prod)
 *   KASPI_MERCHANT_ID=…
 *   KASPI_API_KEY=…
 *   KASPI_WEBHOOK_SECRET=…  ← секрет подписи callback'ов
 *   KASPI_FLOW=api|qr
 *
 * ЕДИНСТВЕННОЕ, что нужно будет сверить с документацией Kaspi при получении
 * договора, — пути endpoints и имена полей (помечены `TODO(kaspi)`).
 * Логика вокруг (суммы, идемпотентность, выдача доступа) уже боевая.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { kaspiMode } from "./config";
import type { CheckoutInput, CheckoutSession, PaymentProvider, WebhookEvent } from "./types";

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

function configured(): boolean {
  return !!(env("KASPI_API_BASE") && env("KASPI_MERCHANT_ID") && env("KASPI_API_KEY"));
}

async function createCheckout(input: CheckoutInput): Promise<CheckoutSession> {
  const mode = kaspiMode();
  if (mode === "off") return { ok: false, reason: "off" };
  if (!configured()) return { ok: false, reason: "not_configured", detail: "KASPI_API_BASE/MERCHANT_ID/API_KEY" };

  const flow = env("KASPI_FLOW") === "qr" ? "qr" : "api";
  // Kaspi оперирует целыми тенге — минорные единицы (тиын) переводим назад.
  const amountTenge = Math.round(input.amountMinor / 100);

  // Общий payload обоих сценариев: наш payments.id уходит как merchant order id,
  // webhook вернёт его и однозначно свяжет оплату с платежом.
  const payload = {
    merchantId: env("KASPI_MERCHANT_ID"),
    orderId: input.paymentId, // TODO(kaspi): точное имя поля по договору (merchantOrderId / ExternalId)
    amount: amountTenge,
    currency: "KZT",
    description: input.description,
    returnUrl: input.returnUrl,
  };

  // TODO(kaspi): точный путь endpoint'а из документации договора.
  const path = flow === "qr" ? "/qr/create" : "/invoice/create";

  try {
    const res = await fetch(`${env("KASPI_API_BASE")}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // TODO(kaspi): схема авторизации по договору (Bearer / X-Api-Key)
        Authorization: `Bearer ${env("KASPI_API_KEY")}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { ok: false, reason: "provider_error", detail: `kaspi ${res.status}` };
    }
    const data = (await res.json()) as Record<string, unknown>;

    if (flow === "qr") {
      // TODO(kaspi): имя поля с QR-нагрузкой (qrToken / qrPaymentLink)
      const qr = (data.qrToken ?? data.qrPaymentLink ?? data.qr) as string | undefined;
      if (!qr) return { ok: false, reason: "provider_error", detail: "no qr in response" };
      return { ok: true, kind: "qr", qrPayload: qr, providerPaymentId: String(data.paymentId ?? data.invoiceId ?? "") || undefined };
    }
    // TODO(kaspi): имя поля с URL страницы оплаты (paymentUrl / redirectUrl)
    const url = (data.paymentUrl ?? data.redirectUrl ?? data.url) as string | undefined;
    if (!url) return { ok: false, reason: "provider_error", detail: "no payment url in response" };
    return { ok: true, kind: "redirect", url, providerPaymentId: String(data.paymentId ?? data.invoiceId ?? "") || undefined };
  } catch (e) {
    return { ok: false, reason: "provider_error", detail: e instanceof Error ? e.message : "fetch failed" };
  }
}

async function verifyAndParseWebhook(rawBody: string, headers: Headers): Promise<WebhookEvent> {
  if (kaspiMode() === "off") return { ok: false, reason: "not_configured", detail: "KASPI_MODE=off" };
  const secret = env("KASPI_WEBHOOK_SECRET");
  if (!secret) return { ok: false, reason: "not_configured", detail: "KASPI_WEBHOOK_SECRET" };

  /* ------------------------- проверка подписи -------------------------
   * Без валидной подписи оплату НЕ засчитываем. Дефолт: HMAC-SHA256(hex)
   * от сырого тела в заголовке x-kaspi-signature; имя заголовка и алгоритм
   * настраиваются env'ом, чтобы принять любой вариант из договора.
   * TODO(kaspi): сверить алгоритм и заголовок с документацией. */
  const headerName = env("KASPI_WEBHOOK_SIGNATURE_HEADER") ?? "x-kaspi-signature";
  const given = headers.get(headerName);
  if (!given) return { ok: false, reason: "bad_signature", detail: `no ${headerName} header` };
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(given.trim().toLowerCase());
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad_signature" };
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return { ok: false, reason: "bad_payload" };
  }

  // TODO(kaspi): точные имена полей события по договору.
  const status = String(data.status ?? data.paymentStatus ?? "").toLowerCase();
  const providerPaymentId = String(data.paymentId ?? data.invoiceId ?? data.transactionId ?? "");
  const paymentId = (data.orderId ?? data.merchantOrderId ?? data.externalId) as string | undefined;
  const amountTenge = Number(data.amount ?? NaN);

  if (["paid", "processed", "success", "completed"].includes(status)) {
    if (!providerPaymentId) return { ok: false, reason: "bad_payload", detail: "no provider payment id" };
    return {
      ok: true,
      type: "paid",
      providerPaymentId,
      paymentId,
      amountMinor: Number.isFinite(amountTenge) ? Math.round(amountTenge * 100) : undefined,
      currency: "kzt",
      raw: data,
    };
  }
  if (["failed", "canceled", "cancelled", "error"].includes(status)) {
    return { ok: true, type: "failed", providerPaymentId: providerPaymentId || undefined, paymentId, raw: data };
  }
  return { ok: true, type: "ignored", providerPaymentId: providerPaymentId || undefined, paymentId, raw: data };
}

export const kaspiProvider: PaymentProvider = {
  id: "kaspi",
  mode: kaspiMode,
  createCheckout,
  verifyAndParseWebhook,
};
