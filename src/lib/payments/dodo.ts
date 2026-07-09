/**
 * Dodo Payments (международный рынок, USD) — Merchant of Record: налоги/VAT
 * считает и платит сам Dodo, нам остаётся создать checkout и обработать
 * webhook. Боевая структура, спящая до ключей.
 *
 * Активация (см. docs/PAYMENTS.md):
 *   DODO_MODE=test|live      ← test → test.dodopayments.com, live → live.…
 *   DODO_API_KEY=…           ← Dashboard → Developer → API Keys
 *   DODO_WEBHOOK_SECRET=…    ← Dashboard → Developer → Webhooks (whsec_…)
 *   DODO_PRODUCT_1M / _3M / _6M ← id продуктов, созданных в дашборде Dodo
 *   DODO_PRODUCT_1M_DISC / _3M_DISC / _6M_DISC ← те же пакеты по цене −30%
 *     (Dodo как MoR берёт цену из продукта в дашборде, поэтому скидка после
 *      диагностики = отдельный продукт со скидочной ценой)
 *
 * Подпись webhook'ов — спецификация Standard Webhooks (webhook-id /
 * webhook-timestamp / webhook-signature, HMAC-SHA256 base64) — реализована
 * полностью; при получении секрета работает сразу.
 * TODO(dodo): при активации сверить путь `/checkouts` и имена полей ответа
 * с актуальной документацией — форма запроса уже целевая.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import type { PackageId } from "@/lib/billing";
import { dodoMode } from "./config";
import type { CheckoutInput, CheckoutSession, PaymentProvider, WebhookEvent } from "./types";

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

function baseUrl(): string {
  return dodoMode() === "live" ? "https://live.dodopayments.com" : "https://test.dodopayments.com";
}

function productIdFor(pkg: PackageId, discounted: boolean): string | undefined {
  const base = { "1m": "DODO_PRODUCT_1M", "3m": "DODO_PRODUCT_3M", "6m": "DODO_PRODUCT_6M" }[pkg];
  // скидка = отдельный продукт; молча подменять на полный прайс НЕЛЬЗЯ —
  // сумма разойдётся с ожидаемой и webhook отклонит оплату (amount_mismatch)
  return env(discounted ? `${base}_DISC` : base);
}

async function createCheckout(input: CheckoutInput): Promise<CheckoutSession> {
  const mode = dodoMode();
  if (mode === "off") return { ok: false, reason: "off" };
  const apiKey = env("DODO_API_KEY");
  const productId = productIdFor(input.packageId, input.discountPercent >= 30);
  if (!apiKey || !productId) {
    return { ok: false, reason: "not_configured", detail: "DODO_API_KEY/DODO_PRODUCT_*" };
  }

  try {
    const res = await fetch(`${baseUrl()}/checkouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        product_cart: [{ product_id: productId, quantity: 1 }],
        return_url: input.returnUrl,
        customer: input.customerEmail ? { email: input.customerEmail } : undefined,
        // metadata возвращается в webhook — по нему находим наш платёж
        metadata: {
          payment_id: input.paymentId,
          user_id: input.userId,
          package_id: input.packageId,
          discount_percent: String(input.discountPercent),
        },
      }),
    });
    if (!res.ok) return { ok: false, reason: "provider_error", detail: `dodo ${res.status}` };
    const data = (await res.json()) as Record<string, unknown>;
    const url = (data.checkout_url ?? data.payment_link ?? data.url) as string | undefined;
    if (!url) return { ok: false, reason: "provider_error", detail: "no checkout_url in response" };
    return {
      ok: true,
      kind: "redirect",
      url,
      providerPaymentId: String(data.session_id ?? data.payment_id ?? "") || undefined,
    };
  } catch (e) {
    return { ok: false, reason: "provider_error", detail: e instanceof Error ? e.message : "fetch failed" };
  }
}

/** Standard Webhooks: подпись v1 = base64(HMAC-SHA256(`${id}.${ts}.${body}`)). */
async function verifyAndParseWebhook(rawBody: string, headers: Headers): Promise<WebhookEvent> {
  if (dodoMode() === "off") return { ok: false, reason: "not_configured", detail: "DODO_MODE=off" };
  const secret = env("DODO_WEBHOOK_SECRET");
  if (!secret) return { ok: false, reason: "not_configured", detail: "DODO_WEBHOOK_SECRET" };

  const id = headers.get("webhook-id");
  const ts = headers.get("webhook-timestamp");
  const signatures = headers.get("webhook-signature");
  if (!id || !ts || !signatures) return { ok: false, reason: "bad_signature", detail: "missing webhook headers" };

  // защита от replay: событие старше 5 минут не принимаем
  const age = Math.abs(Date.now() / 1000 - Number(ts));
  if (!Number.isFinite(age) || age > 300) return { ok: false, reason: "bad_signature", detail: "stale timestamp" };

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${ts}.${rawBody}`).digest("base64");
  // заголовок может содержать несколько подписей: "v1,xxx v1,yyy"
  const match = signatures.split(" ").some((part) => {
    const sig = part.startsWith("v1,") ? part.slice(3) : part;
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    return a.length === b.length && timingSafeEqual(a, b);
  });
  if (!match) return { ok: false, reason: "bad_signature" };

  let event: { type?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return { ok: false, reason: "bad_payload" };
  }

  const data = event.data ?? {};
  const meta = (data.metadata ?? {}) as Record<string, unknown>;
  const providerPaymentId = String(data.payment_id ?? data.id ?? "");
  const paymentId = typeof meta.payment_id === "string" ? meta.payment_id : undefined;

  if (event.type === "payment.succeeded") {
    if (!providerPaymentId) return { ok: false, reason: "bad_payload", detail: "no payment_id" };
    const amount = Number(data.total_amount ?? NaN); // Dodo отдаёт сумму в центах
    return {
      ok: true,
      type: "paid",
      providerPaymentId,
      paymentId,
      amountMinor: Number.isFinite(amount) ? amount : undefined,
      currency: "usd",
      raw: event,
    };
  }
  if (event.type === "payment.failed" || event.type === "payment.cancelled") {
    return { ok: true, type: "failed", providerPaymentId: providerPaymentId || undefined, paymentId, raw: event };
  }
  return { ok: true, type: "ignored", providerPaymentId: providerPaymentId || undefined, paymentId, raw: event };
}

export const dodoProvider: PaymentProvider = {
  id: "dodo",
  mode: dodoMode,
  createCheckout,
  verifyAndParseWebhook,
};
