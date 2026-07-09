-- 0007: платежи (Kaspi KZT + Dodo USD) — боевая структура под заглушки.
-- Применяется вручную основателем (SQL Editor), как и предыдущие миграции.
--
-- payments — журнал оплат: pending создаёт /api/payments/checkout,
-- paid/failed ставит ТОЛЬКО сервер по подписанному webhook'у (service-role).
-- Пользователь видит свои платежи, писать не может вовсе (нет политик
-- insert/update — записи идут mimo RLS через service-role ключ).

create table if not exists payments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  provider            text not null check (provider in ('kaspi', 'dodo')),
  provider_payment_id text,
  package_id          text not null check (package_id in ('1m', '3m', '6m')),
  currency            text not null check (currency in ('kzt', 'usd')),
  -- сумма в минорных единицах (тиын/центы) — целые числа, без float
  amount_minor        integer not null check (amount_minor >= 0),
  discount_percent    integer not null default 0 check (discount_percent between 0 and 100),
  status              text not null default 'pending'
                        check (status in ('pending', 'paid', 'failed', 'canceled')),
  created_at          timestamptz not null default now(),
  paid_at             timestamptz,
  -- сырое webhook-событие: разбор инцидентов и сверка с провайдером
  raw                 jsonb
);

-- идемпотентность webhook'ов: одна оплата провайдера = одна строка
create unique index if not exists payments_provider_payment_uidx
  on payments (provider, provider_payment_id)
  where provider_payment_id is not null;

create index if not exists payments_user_idx on payments (user_id, created_at desc);

alter table payments enable row level security;

drop policy if exists "read own payments" on payments;
create policy "read own payments" on payments
  for select using (auth.uid() = user_id);
