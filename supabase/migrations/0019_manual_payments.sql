-- ---------------------------------------------------------------------
-- 0019: ручные оплаты (Фаза 9, вкладка «Оплаты» админ-панели).
--
-- Старт без подключённых провайдеров: Kaspi-перевод / наличные / на ИП
-- фиксируются админом вручную — payments становится единой книгой
-- продаж (status='paid', provider='manual', note — способ и комментарий).
-- ---------------------------------------------------------------------

alter table payments drop constraint if exists payments_provider_check;
alter table payments add constraint payments_provider_check
  check (provider in ('kaspi', 'dodo', 'manual'));

alter table payments add column if not exists note text;

comment on column payments.note is
  'Ручная оплата: способ (Kaspi перевод / наличные / ИП) и комментарий админа';
