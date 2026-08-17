-- 0024: лимиты по типам занятий (Блок 4) и докупки сверх лимита (Блок 5).
-- Применяется вручную основателем.
--
-- ПОРЯДОК ОБЯЗАТЕЛЕН: сначала эта миграция, ПОТОМ деплой кода. Новый код
-- зовёт check_usage_allowance/consume_usage — без них голос вернёт 503.
-- Обратный порядок безопасен: старые функции ниже не трогаются, и прод,
-- работающий на старой сборке, доживёт до деплоя без единой ошибки.
--
-- Что меняется:
--   1. monthly_usage — месячные счётчики: минуты практики, уроки, экзамены.
--      Периоды не календарные, а ПОДПИСОЧНЫЕ (ключ считает сервер): купивший
--      28-го числа иначе получал бы два месячных лимита за 30 дней подписки.
--   2. voice_minute_credits — получает kind (докупать можно все три вида) и
--      бессрочность (expires_at = null): купленное НЕ сгорает вместе с
--      месячным лимитом.
--   3. check_usage_allowance / consume_usage — новые RPC.
--   4. payments.package_id — пакеты докупок из Блока 5.
--
-- Данных, которые надо переносить, нет: на 16.08.2026 в voice_minute_credits
-- 0 строк и ни одной покупки пакета минут (проверено чтением прода).

begin;

-- 1 --------------------------------------------------------------------
-- Месячные счётчики. Дневной счётчик остаётся в ai_usage (feature = kind) —
-- второй таблицы под то же самое заводить незачем.
create table if not exists monthly_usage (
  user_id    uuid    not null references auth.users(id) on delete cascade,
  period     text    not null,  -- ключ подписочного цикла, считает сервер
  kind       text    not null check (kind in ('practice_minutes', 'lesson', 'exam')),
  used       integer not null default 0 check (used >= 0),
  cost_usd   numeric(10, 4) not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, period, kind)
);

alter table monthly_usage enable row level security;

drop policy if exists "read own monthly usage" on monthly_usage;
create policy "read own monthly usage" on monthly_usage
  for select to authenticated
  using (auth.uid() = user_id);
-- политик на запись нет намеренно: пишут только RPC ниже (security definer)

-- 2 --------------------------------------------------------------------
-- Кредиты докупок: тот же FIFO, но теперь трёх видов и без обязательного
-- срока. expires_at = null означает «не сгорает никогда» — это и есть
-- обещание Блока 5 «купленное лежит сверх месячного лимита».
alter table voice_minute_credits
  add column if not exists kind text not null default 'practice_minutes';

alter table voice_minute_credits
  drop constraint if exists voice_minute_credits_kind_check;
alter table voice_minute_credits
  add constraint voice_minute_credits_kind_check
  check (kind in ('practice_minutes', 'lesson', 'exam'));

alter table voice_minute_credits alter column expires_at drop not null;

create index if not exists voice_credits_user_kind_idx
  on voice_minute_credits (user_id, kind, expires_at);

-- 3 --------------------------------------------------------------------
-- Проверка перед стартом занятия.
--   p_kind    — 'practice_minutes' (минуты) | 'lesson' | 'exam' (штуки)
--   p_day     — календарная дата в таймзоне студента (дневной потолок)
--   p_period  — ключ подписочного цикла (месячный потолок)
--   p_daily   — дневной потолок; 0 = дневного потолка нет
--   p_monthly — месячный потолок
-- Докупленное СНИМАЕТ и дневной потолок тоже: студент заплатил за то, чтобы
-- заниматься сколько хочет, а дневной потолок существует ради размазывания
-- нашей себестоимости по месяцу — на оплаченное сверху он не распространяется.
create or replace function check_usage_allowance(
  p_kind    text,
  p_day     date,
  p_period  text,
  p_daily   integer,
  p_monthly integer
) returns jsonb language plpgsql security definer
set search_path = public
as $$
declare
  v_uid        uuid := auth.uid();
  v_day_used   integer;
  v_mon_used   integer;
  v_credits    integer;
  v_daily_left integer;
  v_month_left integer;
  v_base_ok    boolean;
begin
  if v_uid is null then
    return jsonb_build_object('allowed', false, 'reason', 'unauthenticated');
  end if;
  if p_kind not in ('practice_minutes', 'lesson', 'exam') then
    return jsonb_build_object('allowed', false, 'reason', 'bad_kind');
  end if;

  select coalesce(used, 0) into v_day_used
    from ai_usage
   where user_id = v_uid and day = p_day and feature = p_kind;
  v_day_used := coalesce(v_day_used, 0);

  select coalesce(used, 0) into v_mon_used
    from monthly_usage
   where user_id = v_uid and period = p_period and kind = p_kind;
  v_mon_used := coalesce(v_mon_used, 0);

  select coalesce(sum(minutes - used), 0) into v_credits
    from voice_minute_credits
   where user_id = v_uid and kind = p_kind
     and (expires_at is null or expires_at > now())
     and used < minutes;

  -- p_daily <= 0 → дневного потолка нет (уроки и экзамены считаются штуками)
  v_daily_left := case when p_daily <= 0 then null else greatest(p_daily - v_day_used, 0) end;
  v_month_left := greatest(p_monthly - v_mon_used, 0);
  v_base_ok    := v_month_left > 0 and (v_daily_left is null or v_daily_left > 0);

  return jsonb_build_object(
    'allowed',      v_base_ok or v_credits > 0,
    'daily_left',   v_daily_left,
    'monthly_left', v_month_left,
    'credits_left', v_credits
  );
end;
$$;

grant execute on function check_usage_allowance(text, date, text, integer, integer) to authenticated;

-- Списание по факту занятия. Сначала базовый лимит (дневной ∩ месячный),
-- остаток — из докупленного FIFO по сроку (бессрочное горит последним).
create or replace function consume_usage(
  p_kind     text,
  p_day      date,
  p_period   text,
  p_amount   integer,
  p_daily    integer,
  p_monthly  integer,
  p_cost_usd numeric default 0
) returns jsonb language plpgsql security definer
set search_path = public
as $$
declare
  v_uid        uuid := auth.uid();
  v_day_used   integer;
  v_mon_used   integer;
  v_base_left  integer;
  v_from_base  integer;
  v_rest       integer;
  v_row        record;
  v_take       integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  end if;
  if p_kind not in ('practice_minutes', 'lesson', 'exam') then
    return jsonb_build_object('ok', false, 'reason', 'bad_kind');
  end if;
  -- p_amount = 0 — законный вызов: занятие не дотянуло до порога и в лимит не
  -- пишется, но провайдеру за него уже заплачено, и стоимость обязана попасть
  -- в счётчики (правило «нет данных ≠ ноль расходов»). Дальше вся арифметика
  -- честно даст from_base = 0 и просто запишет cost.
  if p_amount < 0 then
    return jsonb_build_object('ok', false, 'reason', 'bad_amount');
  end if;

  insert into ai_usage (user_id, day, feature)
  values (v_uid, p_day, p_kind)
  on conflict (user_id, day, feature) do nothing;

  insert into monthly_usage (user_id, period, kind)
  values (v_uid, p_period, p_kind)
  on conflict (user_id, period, kind) do nothing;

  -- обе строки под замком до конца транзакции: два параллельных сеттла
  -- одного студента не должны списать одну и ту же минуту дважды
  select used into v_day_used
    from ai_usage
   where user_id = v_uid and day = p_day and feature = p_kind
   for update;

  select used into v_mon_used
    from monthly_usage
   where user_id = v_uid and period = p_period and kind = p_kind
   for update;

  v_base_left := greatest(p_monthly - v_mon_used, 0);
  if p_daily > 0 then
    v_base_left := least(v_base_left, greatest(p_daily - v_day_used, 0));
  end if;

  v_from_base := least(p_amount, v_base_left);
  v_rest := p_amount - v_from_base;

  -- докупленное FIFO: сначала то, что сгорит раньше; бессрочное — последним
  for v_row in
    select id, minutes, used
      from voice_minute_credits
     where user_id = v_uid and kind = p_kind
       and (expires_at is null or expires_at > now())
       and used < minutes
     order by expires_at asc nulls last
     for update
  loop
    exit when v_rest <= 0;
    v_take := least(v_rest, v_row.minutes - v_row.used);
    update voice_minute_credits set used = used + v_take where id = v_row.id;
    v_rest := v_rest - v_take;
  end loop;

  -- в счётчики базы уходит ТОЛЬКО базовая часть: докупленное живёт своим
  -- остатком в voice_minute_credits и потолков не касается.
  -- Стоимость пишется целиком в оба счётчика — деньги мы платим за всё.
  update ai_usage
     set used = used + v_from_base,
         cost_usd = cost_usd + p_cost_usd,
         updated_at = now()
   where user_id = v_uid and day = p_day and feature = p_kind;

  update monthly_usage
     set used = used + v_from_base,
         cost_usd = cost_usd + p_cost_usd,
         updated_at = now()
   where user_id = v_uid and period = p_period and kind = p_kind;

  return jsonb_build_object(
    'ok', true,
    'from_base', v_from_base,
    'from_credits', p_amount - v_from_base - v_rest,
    'uncovered', v_rest  -- не покрытый остаток в лимит не пишется и не биллится
  );
end;
$$;

grant execute on function consume_usage(text, date, text, integer, integer, integer, numeric) to authenticated;

-- 4 --------------------------------------------------------------------
-- Пакеты докупок (Блок 5). vp30/vp60/vp120 остаются в ограничении как
-- исторические: покупок по ним не было, но выкидывать значение из check —
-- значит сломать любую старую ссылку на оплату, которая ещё может прийти.
alter table payments drop constraint if exists payments_package_id_check;
alter table payments add constraint payments_package_id_check
  check (package_id in (
    '1m', '3m', '6m',
    'vp30', 'vp60', 'vp120',
    'pp60', 'pp150',   -- +60 / +150 минут практики
    'pl4',  'pl10',    -- +4 / +10 уроков
    'pe2',  'pe5'      -- +2 / +5 экзаменов
  ));

commit;

-- Старые check_voice_allowance / consume_voice_minutes намеренно оставлены
-- живыми на время выката. После того как прод отработает на новом коде,
-- их можно снять отдельной миграцией:
--   drop function if exists check_voice_allowance(date, integer);
--   drop function if exists consume_voice_minutes(date, integer, integer, numeric);
