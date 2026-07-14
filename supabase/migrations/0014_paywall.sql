-- ---------------------------------------------------------------------
-- 0014: боевой пейволл (P0-2). Оплата — единственный путь к доступу.
--
-- 1. Срок подписки: plan_expires_at; requireActivePlan() на сервере
--    проверяет plan is not null AND plan_expires_at > now().
-- 2. Поля доступа (plan, plan_expires_at, trial_used) пишет ТОЛЬКО
--    сервер: вебхук оплаты (service_role) и redeem_promo() (security
--    definer). Клиентская запись блокируется триггером на уровне БД.
-- 3. Промокоды двух типов: 'trial' (доступ на N дней, одноразово на
--    человека через profiles.trial_used) и 'discount' (% к реальной
--    оплате). LINGOPRO100 становится триалом на 3 дня.
-- 4. Существующие профили с plan — тестовые аккаунты основателя:
--    получают plan_expires_at = now() + 6 месяцев.
-- ---------------------------------------------------------------------

/* ------------------------- 1. срок подписки --------------------------- */

alter table profiles add column if not exists plan_expires_at timestamptz;
alter table profiles add column if not exists trial_used boolean not null default false;

-- бекфилл тестовых аккаунтов (единственные 12 профилей с plan — тесты)
update profiles
   set plan_expires_at = now() + interval '6 months'
 where plan is not null and plan_expires_at is null;

/* ------------- 2. поля доступа пишет только сервер -------------------- */

-- security definer внутри RPC выполняется от владельца (postgres),
-- admin-клиент через PostgREST — от service_role, клиент — от
-- authenticated: current_user разделяет их надёжно.
create or replace function profiles_protect_plan() returns trigger
language plpgsql as $$
begin
  if current_user in ('postgres', 'service_role', 'supabase_admin') then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if new.plan is not null or new.plan_expires_at is not null or new.trial_used then
      raise exception 'plan fields are server-managed';
    end if;
    return new;
  end if;
  if new.plan is distinct from old.plan
     or new.plan_expires_at is distinct from old.plan_expires_at
     or new.trial_used is distinct from old.trial_used then
    raise exception 'plan fields are server-managed';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_plan on profiles;
create trigger profiles_protect_plan
  before insert or update on profiles
  for each row execute function profiles_protect_plan();

/* --------------------- 3. промокоды двух типов ------------------------ */

alter table promo_codes add column if not exists kind text not null default 'discount'
  check (kind in ('discount', 'trial'));
alter table promo_codes add column if not exists trial_days integer
  check (trial_days between 1 and 90);

-- LINGOPRO100: был «100% скидка = доступ навсегда» → триал на 3 дня
update promo_codes
   set kind = 'trial', trial_days = 3
 where code = 'LINGOPRO100';

-- скидочный код больше не бывает 100% (бесплатный доступ — только триал);
-- старый check заменяем: trial-коды хранят исторический discount_percent,
-- он для них не используется
alter table promo_codes drop constraint if exists promo_codes_discount_percent_check;
alter table promo_codes add constraint promo_codes_discount_percent_check
  check (kind = 'trial' or discount_percent in (30, 50));

/* -------------------- 4. redeem_promo v2 (типизированный) ------------- */

create or replace function redeem_promo(
  p_code       text,
  p_package_id text default null
) returns jsonb language plpgsql security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_promo promo_codes%rowtype;
  v_expires timestamptz;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  end if;

  select * into v_promo
    from promo_codes
   where lower(code) = lower(trim(p_code))
   for update;

  if not found or not v_promo.is_active then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;
  if v_promo.expires_at is not null and v_promo.expires_at < now() then
    return jsonb_build_object('ok', false, 'reason', 'expired');
  end if;
  if v_promo.max_uses is not null and v_promo.used_count >= v_promo.max_uses then
    return jsonb_build_object('ok', false, 'reason', 'exhausted');
  end if;
  if v_promo.package_id is not null and p_package_id is not null
     and v_promo.package_id <> p_package_id then
    return jsonb_build_object('ok', false, 'reason', 'wrong_package');
  end if;
  if v_promo.first_purchase_only
     and exists (select 1 from profiles where id = v_uid and plan is not null) then
    return jsonb_build_object('ok', false, 'reason', 'not_first_purchase');
  end if;

  /* ----------------------------- триал ------------------------------- */
  if v_promo.kind = 'trial' then
    -- одноразово на человека: флаг переживает удаление/повтор кодов
    if exists (select 1 from profiles where id = v_uid and trial_used) then
      return jsonb_build_object('ok', false, 'reason', 'trial_used');
    end if;
    -- активную ОПЛАЧЕННУЮ подписку триал не затирает
    if exists (select 1 from profiles
                where id = v_uid and plan is not null
                  and plan <> 'trial' and plan_expires_at > now()) then
      return jsonb_build_object('ok', false, 'reason', 'already_active');
    end if;

    begin
      insert into promo_redemptions (code_id, user_id, package_id)
      values (v_promo.id, v_uid, p_package_id);
    exception when unique_violation then
      return jsonb_build_object('ok', false, 'reason', 'trial_used');
    end;

    v_expires := now() + make_interval(days => coalesce(v_promo.trial_days, 3));
    update promo_codes set used_count = used_count + 1 where id = v_promo.id;
    -- выдача доступа СЕРВЕРОМ, атомарно с потреблением кода
    update profiles
       set plan = 'trial', plan_expires_at = v_expires, trial_used = true
     where id = v_uid;

    return jsonb_build_object(
      'ok', true, 'kind', 'trial',
      'trial_days', coalesce(v_promo.trial_days, 3),
      'plan_expires_at', v_expires
    );
  end if;

  /* ---------------------------- скидка ------------------------------- */
  begin
    insert into promo_redemptions (code_id, user_id, package_id)
    values (v_promo.id, v_uid, p_package_id);
  exception when unique_violation then
    return jsonb_build_object('ok', false, 'reason', 'already_used');
  end;

  update promo_codes set used_count = used_count + 1 where id = v_promo.id;

  return jsonb_build_object(
    'ok', true, 'kind', 'discount',
    'discount_percent', v_promo.discount_percent
  );
end;
$$;

grant execute on function redeem_promo(text, text) to authenticated;
