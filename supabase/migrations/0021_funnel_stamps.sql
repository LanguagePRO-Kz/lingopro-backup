-- 0021: штампы воронки оплаты (Блок 1 захода после деплоя, 2026-07-21).
-- Зачем: воронка не различала «не было промокода» и «застрял в чекауте» —
-- 26 человек с диагностикой и без redemption остались неразличимыми.
-- Первое касание (only-if-NULL пишет клиент): дошёл до чекаута / жал «Применить».
alter table profiles add column if not exists checkout_opened_at timestamptz;
alter table profiles add column if not exists promo_attempted_at timestamptz;
