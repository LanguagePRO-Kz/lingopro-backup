# Платежи: Kaspi (KZT) + Dodo (USD) — активация заглушек

Обе заглушки построены боевыми: **активация = ключи в `.env.local` + режим
`test|live` — без правок логики.** Пока `*_MODE=off` (или переменной нет) —
модалка честно показывает «оплата откроется при запуске», работает только
промокод (`redeem_promo`, LINGOPRO100 и т.д.). Промокоды остаются рабочими
параллельно оплате всегда.

## Архитектура (по образцу AI-адаптера)

```
UI (EarlyAccessModal)                        сервер
  GET /api/payments/status  ←── режим провайдера (off → кнопки оплаты нет)
  POST /api/payments/checkout ─→ цена считается СЕРВЕРОМ (lib/pricing + скидки)
                                 → строка payments (pending, миграция 0007)
                                 → провайдер по валюте: KZT→Kaspi, USD→Dodo
                                 ← redirect-URL (или QR) страницы оплаты
  /payment/return  ←── возврат; страница ЖДЁТ webhook (доступ выдаёт не она)
  POST /api/payments/webhook/{kaspi|dodo}
        → проверка ПОДПИСИ → сверка суммы/валюты → идемпотентность
        → payments.status=paid → profiles.plan=пакет (тот же флаг, что промокод)
```

Разделение рынка: язык интерфейса RU/KK → тенге → Kaspi; EN/TR → USD → Dodo
(`currencyFor` в `lib/pricing` + `providerForCurrency` в `lib/payments/config`).

Ключевые файлы: `src/lib/payments/*` (адаптер), `src/app/api/payments/*`
(роуты), `supabase/migrations/0007_payments.sql` (журнал платежей).

## Шаг 0 — миграции (один раз, до включения любого провайдера)

Применить в SQL Editor: `0007_payments.sql` (журнал платежей) и
`0009_voice_packs.sql` (пакеты минут vp30/vp60/vp120 в журнале). Без них
checkout честно вернёт `migration_missing`.

Пакеты минут: оплата тем же адаптером; по webhook'у сервер начисляет минуты
в `voice_minute_credits` (срок — до конца календарного месяца покупки),
`check_voice_allowance` подхватывает их автоматически.

## Kaspi (Казахстан, тенге)

**Что получить от Kaspi (по договору Kaspi Pay / эквайринг):**

| Что | Куда вставить |
|---|---|
| Тип интеграции: Merchant API (redirect) или QR | `KASPI_FLOW=api` или `KASPI_FLOW=qr` |
| Базовый URL API (sandbox и production) | `KASPI_API_BASE=` |
| ID мерчанта | `KASPI_MERCHANT_ID=` |
| API-ключ | `KASPI_API_KEY=` |
| Секрет подписи callback'ов | `KASPI_WEBHOOK_SECRET=` |
| Имя заголовка подписи (если не `x-kaspi-signature`) | `KASPI_WEBHOOK_SIGNATURE_HEADER=` |

**Дать Kaspi:** URL callback'а — `https://<домен>/api/payments/webhook/kaspi`.

**Включение:** `KASPI_MODE=test` → тестовый платёж → `KASPI_MODE=live`.

**Сверить с документацией договора** (10 минут, всё помечено `TODO(kaspi)`
в `src/lib/payments/kaspi.ts`): пути endpoints (`/invoice/create`,
`/qr/create`), имена полей запроса/ответа/события, алгоритм подписи
(заложен дефолт HMAC-SHA256 от тела). Структура принимает оба сценария.

## Dodo Payments (международный, USD)

Dodo — Merchant of Record: налоги/VAT считает и платит сам, нам — checkout
и webhook. **Важно:** цену Dodo берёт из продукта в дашборде, поэтому
скидка −30% после диагностики = отдельные продукты со скидочной ценой.

**Сделать в дашборде Dodo (dodopayments.com):**

1. API-ключ: Developer → API Keys (сначала test mode) → `DODO_API_KEY=`.
2. Webhook: Developer → Webhooks → добавить
   `https://<домен>/api/payments/webhook/dodo` → секрет `whsec_…` →
   `DODO_WEBHOOK_SECRET=`.
3. Создать **6 продуктов** (one-time payment) с ценами из `src/lib/pricing.ts`
   (USD-сетка — плейсхолдер, финальные цифры даст основатель; при смене цен
   поменять В ОБОИХ местах — в pricing.ts и в продуктах Dodo):
   | Продукт | Цена сейчас | env |
   |---|---|---|
   | 1 месяц | $42.99 | `DODO_PRODUCT_1M=` |
   | 3 месяца | $85.99 | `DODO_PRODUCT_3M=` |
   | 6 месяцев | $128.99 | `DODO_PRODUCT_6M=` |
   | 1 месяц −30% | $29.99 | `DODO_PRODUCT_1M_DISC=` |
   | 3 месяца −30% | $59.99 | `DODO_PRODUCT_3M_DISC=` |
   | 6 месяцев −30% | $89.99 | `DODO_PRODUCT_6M_DISC=` |

   Плюс **3 продукта пакетов голосовых минут** (допы; USD — плейсхолдеры
   до цифр основателя, KZT-цены Kaspi берёт из запроса):
   | Продукт | Цена сейчас | env |
   |---|---|---|
   | 30 минут | $9.99 | `DODO_PRODUCT_VP30=` |
   | 60 минут | $17.99 | `DODO_PRODUCT_VP60=` |
   | 120 минут | $30.99 | `DODO_PRODUCT_VP120=` |

**Включение:** `DODO_MODE=test` (API ходит на test.dodopayments.com) →
тестовая карта → `DODO_MODE=live` + live-ключ.

**Сверить при активации** (помечено `TODO(dodo)` в `src/lib/payments/dodo.ts`):
путь `/checkouts` и поле `checkout_url` по актуальной документации Dodo.
Подпись webhook'ов (Standard Webhooks) реализована полностью.

## Блок для .env.local (скопировать, заполнить по мере получения)

```bash
# --- Kaspi (Казахстан, тенге) ---
KASPI_MODE=off            # off | test | live
KASPI_FLOW=api            # api | qr — скажет Kaspi
KASPI_API_BASE=
KASPI_MERCHANT_ID=
KASPI_API_KEY=
KASPI_WEBHOOK_SECRET=
# KASPI_WEBHOOK_SIGNATURE_HEADER=x-kaspi-signature

# --- Dodo Payments (международный, USD) ---
DODO_MODE=off             # off | test | live
DODO_API_KEY=
DODO_WEBHOOK_SECRET=
DODO_PRODUCT_1M=
DODO_PRODUCT_3M=
DODO_PRODUCT_6M=
DODO_PRODUCT_1M_DISC=
DODO_PRODUCT_3M_DISC=
DODO_PRODUCT_6M_DISC=
DODO_PRODUCT_VP30=
DODO_PRODUCT_VP60=
DODO_PRODUCT_VP120=
```

На Vercel те же переменные добавить в Project → Settings → Environment
Variables (webhook'и работают только на задеплоенном домене).

## Гарантии безопасности (уже в коде)

- Webhook без валидной подписи **не открывает доступ** (401); секреты не
  заведены → 503, событие не признаётся.
- Сумма и валюта события сверяются с ожидаемыми из строки `payments` —
  оплата «не той суммой» отклоняется (409, `amount_mismatch`).
- Идемпотентность: повторный webhook той же оплаты — no-op (уникальный
  индекс `provider + provider_payment_id` + статус-гвард).
- Клиентской сумме сервер не верит: цена всегда пересчитывается на сервере.
- Таблица `payments`: пользователь читает только свои строки, писать может
  только сервер (service-role), у клиента нет insert/update-политик.
- Replay-защита Dodo: событие старше 5 минут отклоняется.
