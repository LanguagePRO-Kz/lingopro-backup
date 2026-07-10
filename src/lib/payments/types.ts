/**
 * Платёжная абстракция (по образцу AI-адаптера src/lib/ai/): единый интерфейс
 * «создать оплату / проверить и разобрать webhook», провайдер выбирается по
 * валюте рынка. Провайдеры: Kaspi (KZT, Казахстан) и Dodo Payments (USD,
 * международный, Merchant of Record).
 *
 * Активация реальной оплаты = ключи в .env.local + KASPI_MODE/DODO_MODE —
 * без правок логики. Чек-лист: docs/PAYMENTS.md.
 */

import type { PackageId } from "@/lib/billing";
import type { VoicePackId } from "@/lib/pricing";

/** Покупаемое: пакет доступа (1/3/6 мес) или пакет голосовых минут. */
export type PurchasableId = PackageId | VoicePackId;

export type PaymentProviderId = "kaspi" | "dodo";

/** off — заглушка «оплата скоро»; test — sandbox-ключи; live — боевые. */
export type PaymentMode = "off" | "test" | "live";

export type PayCurrency = "kzt" | "usd";

export type CheckoutInput = {
  userId: string;
  packageId: PurchasableId;
  currency: PayCurrency;
  /** Сумма в МИНОРНЫХ единицах (тиын/центы) — без float-ошибок. */
  amountMinor: number;
  /** Применённая скидка, для сверки и аналитики. */
  discountPercent: number;
  /** Наш внутренний payments.id — уходит провайдеру в metadata/order id,
   *  чтобы webhook однозначно нашёл платёж. */
  paymentId: string;
  description: string;
  returnUrl: string;
  customerEmail?: string | null;
};

export type CheckoutSession =
  /** Обычный сценарий: редирект на страницу оплаты провайдера. */
  | { ok: true; kind: "redirect"; url: string; providerPaymentId?: string }
  /** Kaspi QR-сценарий: полезная нагрузка для отрисовки QR. */
  | { ok: true; kind: "qr"; qrPayload: string; providerPaymentId?: string }
  | { ok: false; reason: "off" | "not_configured" | "provider_error"; detail?: string };

export type WebhookEvent =
  | {
      ok: true;
      type: "paid";
      /** id платежа на стороне провайдера (идемпотентность). */
      providerPaymentId: string;
      /** Наш payments.id из metadata, если провайдер его вернул. */
      paymentId?: string;
      /** Сумма/валюта из события — сверяем с ожидаемой. */
      amountMinor?: number;
      currency?: PayCurrency;
      raw: unknown;
    }
  | { ok: true; type: "failed" | "pending" | "ignored"; providerPaymentId?: string; paymentId?: string; raw?: unknown }
  | { ok: false; reason: "bad_signature" | "not_configured" | "bad_payload"; detail?: string };

export interface PaymentProvider {
  id: PaymentProviderId;
  mode(): PaymentMode;
  /** Создать оплату у провайдера. При mode=off → { ok:false, reason:"off" }. */
  createCheckout(input: CheckoutInput): Promise<CheckoutSession>;
  /**
   * Проверить подпись и разобрать webhook. БЕЗ валидной подписи событие
   * не признаётся оплатой — иначе оплату можно подделать простым POST.
   */
  verifyAndParseWebhook(rawBody: string, headers: Headers): Promise<WebhookEvent>;
}
