/**
 * Точка входа платёжного адаптера: провайдер по id или по валюте рынка.
 * RU/KK → KZT → Kaspi; EN/TR → USD → Dodo (см. config.ts).
 */

import { providerForCurrency } from "./config";
import { dodoProvider } from "./dodo";
import { kaspiProvider } from "./kaspi";
import type { PayCurrency, PaymentProvider, PaymentProviderId } from "./types";

const PROVIDERS: Record<PaymentProviderId, PaymentProvider> = {
  kaspi: kaspiProvider,
  dodo: dodoProvider,
};

export function getProvider(id: PaymentProviderId): PaymentProvider {
  return PROVIDERS[id];
}

export function providerForMarket(cur: PayCurrency): PaymentProvider {
  return PROVIDERS[providerForCurrency(cur)];
}

export { providerForCurrency } from "./config";
export type * from "./types";
