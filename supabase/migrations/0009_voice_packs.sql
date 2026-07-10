-- 0009: покупка пакетов голосовых минут (vp30/vp60/vp120) через тот же
-- платёжный журнал. Применяется вручную основателем, как обычно.
--
-- payments.package_id расширяется: помимо пакетов доступа (1m/3m/6m)
-- допускаются пакеты минут. Начисление минут делает сервер по webhook'у
-- (lib/payments/grant.ts → insert в voice_minute_credits, срок — до конца
-- календарного месяца покупки).

alter table payments drop constraint if exists payments_package_id_check;
alter table payments add constraint payments_package_id_check
  check (package_id in ('1m', '3m', '6m', 'vp30', 'vp60', 'vp120'));
