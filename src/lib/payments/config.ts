/**
 * Конфиг платежей: режимы провайдеров из env + правило разделения рынков.
 *
 * Разделение рынка (утверждено основателем):
 *   RU/KK интерфейс → тенге → Kaspi;  EN/TR → USD → Dodo.
 * Валюта уже выводится из языка интерфейса (`currencyFor` в lib/pricing) —
 * здесь только маппинг валюта → провайдер. Клиент присылает валюту, сервер
 * валидирует значение и пересчитывает цену сам (клиентской сумме не верим).
 */

import type { PayCurrency, PaymentMode, PaymentProviderId } from "./types";

export function providerForCurrency(cur: PayCurrency): PaymentProviderId {
  return cur === "kzt" ? "kaspi" : "dodo";
}

function readMode(v: string | undefined): PaymentMode {
  return v === "test" || v === "live" ? v : "off";
}

/** KASPI_MODE=off|test|live (по умолчанию off — честная заглушка). */
export function kaspiMode(): PaymentMode {
  return readMode(process.env.KASPI_MODE);
}

/** DODO_MODE=off|test|live. */
export function dodoMode(): PaymentMode {
  return readMode(process.env.DODO_MODE);
}
