-- =====================================================================
-- LingoPRO 0002 — P0 foundation: exam goal/date, AI usage limits,
-- voice minutes, mock results, promo codes, error memory (topic mastery).
-- Copy this whole file into Supabase → SQL Editor → Run.
-- Idempotent: safe to run more than once.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. profiles: exam goal/date (block D), diagnostic timestamp for the
--    24h discount (block A2), timezone for per-user midnight resets,
--    preferred voice for the speaking teacher (block C).
-- ---------------------------------------------------------------------
alter table profiles add column if not exists exam_date               date;
alter table profiles add column if not exists exam_date_mode          text;    -- 'exact' | 'approx' | 'unknown'
alter table profiles add column if not exists exam_horizon_months     integer; -- 1 | 3 | 6 when mode = 'approx'
alter table profiles add column if not exists diagnostic_completed_at timestamptz;
alter table profiles add column if not exists timezone                text;    -- IANA, e.g. 'Asia/Almaty'
alter table profiles add column if not exists preferred_voice         text;    -- slug from src/lib/ai/voices.ts
alter table profiles add column if not exists created_at              timestamptz default now();

-- Backfill the discount anchor from the stored quiz result (takenAt = epoch ms).
update profiles
   set diagnostic_completed_at = to_timestamp((quiz_result->>'takenAt')::bigint / 1000.0)
 where diagnostic_completed_at is null
   and quiz_result ? 'takenAt'
   and (quiz_result->>'takenAt') ~ '^[0-9]+$';

-- ---------------------------------------------------------------------
-- 2. ai_usage — server-side quota accounting. One row per user/day/feature.
--    Writes happen ONLY through consume_* RPCs (security definer); clients
--    can read their own rows to render counters honestly.
-- ---------------------------------------------------------------------
create table if not exists ai_usage (
  user_id    uuid not null references auth.users(id) on delete cascade,
  day        date not null,
  feature    text not null, -- 'writing' | 'tutor' | 'voice_minutes' | 'diagnostic' | ...
  used       integer not null default 0,
  cost_usd   numeric(10, 4) not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, day, feature)
);

alter table ai_usage enable row level security;

drop policy if exists "read own ai usage" on ai_usage;
create policy "read own ai usage" on ai_usage
  for select to authenticated
  using (auth.uid() = user_id);
-- no insert/update policies on purpose: only the RPCs below may write.

-- ---------------------------------------------------------------------
-- 3. voice_minute_credits — purchased minute packs. Live until end of the
--    calendar month (expires_at), consumed FIFO after the daily base quota.
--    Rows are created by the payments layer (server, service role).
-- ---------------------------------------------------------------------
create table if not exists voice_minute_credits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  minutes    integer not null check (minutes > 0),
  used       integer not null default 0 check (used >= 0),
  source     text not null default 'purchase', -- 'purchase' | 'promo' | 'support'
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (used <= minutes)
);

create index if not exists voice_credits_user_expiry_idx
  on voice_minute_credits (user_id, expires_at);

alter table voice_minute_credits enable row level security;

drop policy if exists "read own voice credits" on voice_minute_credits;
create policy "read own voice credits" on voice_minute_credits
  for select to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 4. voice_sessions — one row per speaking-teacher session: duration for
--    billing, transcript + end-of-session report (block C5). Created and
--    updated by the server route (service role bypasses RLS).
-- ---------------------------------------------------------------------
create table if not exists voice_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  mode       text,                        -- 'bolum1' | 'bolum2' | 'bolum3' | 'full'
  seconds    integer not null default 0,
  started_at timestamptz not null default now(),
  ended_at   timestamptz,
  transcript jsonb,
  report     jsonb,                       -- TÖMER Konuşma review
  created_at timestamptz not null default now()
);

create index if not exists voice_sessions_user_idx
  on voice_sessions (user_id, started_at desc);

alter table voice_sessions enable row level security;

drop policy if exists "read own voice sessions" on voice_sessions;
create policy "read own voice sessions" on voice_sessions
  for select to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 5. mock_results — persisted mock-exam attempts (block E3). Honest per-
--    section scores on the official scale (4 × 25 → /100).
-- ---------------------------------------------------------------------
create table if not exists mock_results (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  exam_id        text not null,
  section_scores jsonb not null default '{}'::jsonb, -- {dinleme, okuma, yazma, konusma}
  total          integer,                            -- /100 when all sections scored
  created_at     timestamptz not null default now()
);

create index if not exists mock_results_user_idx
  on mock_results (user_id, created_at desc);

alter table mock_results enable row level security;

drop policy if exists "insert own mock results" on mock_results;
create policy "insert own mock results" on mock_results
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "read own mock results" on mock_results;
create policy "read own mock results" on mock_results
  for select to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 6. Promo codes (block E1). No public read: validation and redemption go
--    through redeem_promo() below. Strict one-code-one-student is enforced
--    by the unique pair in promo_redemptions.
-- ---------------------------------------------------------------------
create table if not exists promo_codes (
  id                  uuid primary key default gen_random_uuid(),
  code                text not null unique,
  discount_percent    integer not null check (discount_percent in (30, 50, 100)),
  max_uses            integer,           -- null = unlimited
  used_count          integer not null default 0,
  first_purchase_only boolean not null default false,
  single_use_per_user boolean not null default true,
  package_id          text,              -- null = any package ('1m' | '3m' | '6m' | minute packs)
  expires_at          timestamptz,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

create table if not exists promo_redemptions (
  id          uuid primary key default gen_random_uuid(),
  code_id     uuid not null references promo_codes(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  package_id  text,
  redeemed_at timestamptz not null default now(),
  unique (code_id, user_id)
);

alter table promo_codes enable row level security;
alter table promo_redemptions enable row level security;

drop policy if exists "read own redemptions" on promo_redemptions;
create policy "read own redemptions" on promo_redemptions
  for select to authenticated
  using (auth.uid() = user_id);
-- promo_codes has no client policies at all: RPC-only access.

-- Shared 100% test code for B2B demos (rename/deactivate any time).
insert into promo_codes (code, discount_percent, max_uses, single_use_per_user)
values ('LINGOPRO100', 100, 300, true)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------
-- 7. Error memory (block B / RECON-2 §2.1): every mistake from any activity
--    becomes evidence; topic_mastery is the deterministic aggregate the plan
--    and reviews read. Topic ids come from the code registry (src/lib).
-- ---------------------------------------------------------------------
create table if not exists error_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  source      text not null check (source in ('writing', 'tutor', 'voice', 'mock', 'diagnostic')),
  quote       text,
  correction  text,
  rule        text,
  explanation text,
  topic       text not null,
  severity    text not null default 'major' check (severity in ('major', 'minor')),
  created_at  timestamptz not null default now()
);

create index if not exists error_events_user_topic_idx
  on error_events (user_id, topic, created_at desc);

alter table error_events enable row level security;

drop policy if exists "insert own errors" on error_events;
create policy "insert own errors" on error_events
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "read own errors" on error_events;
create policy "read own errors" on error_events
  for select to authenticated
  using (auth.uid() = user_id);

create table if not exists topic_mastery (
  user_id           uuid not null references auth.users(id) on delete cascade,
  topic             text not null,
  strength          integer not null default 50 check (strength between 0 and 100),
  success_count     integer not null default 0,
  error_count       integer not null default 0,
  last_error_at     timestamptz,
  last_practiced_at timestamptz,
  updated_at        timestamptz not null default now(),
  primary key (user_id, topic)
);

alter table topic_mastery enable row level security;

drop policy if exists "insert own mastery" on topic_mastery;
create policy "insert own mastery" on topic_mastery
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "update own mastery" on topic_mastery;
create policy "update own mastery" on topic_mastery
  for update to authenticated
  using (auth.uid() = user_id);

drop policy if exists "read own mastery" on topic_mastery;
create policy "read own mastery" on topic_mastery
  for select to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 8. Tables the app already writes to but which never existed in the DB
--    (saves were silently swallowed by best-effort try/catch): daily plan
--    progress, task results, contact form, B2B leads. Column names match
--    the code exactly (daily-plan.ts, useStats.ts, contacts, b2b).
-- ---------------------------------------------------------------------
create table if not exists daily_progress (
  user_id         uuid not null references auth.users(id) on delete cascade,
  date            date not null,
  tasks           jsonb not null default '[]'::jsonb,
  completed_count integer not null default 0,
  total_count     integer not null default 0,
  updated_at      timestamptz not null default now(),
  primary key (user_id, date) -- upsert onConflict "user_id,date"
);

alter table daily_progress enable row level security;

drop policy if exists "read own daily progress" on daily_progress;
create policy "read own daily progress" on daily_progress
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "insert own daily progress" on daily_progress;
create policy "insert own daily progress" on daily_progress
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "update own daily progress" on daily_progress;
create policy "update own daily progress" on daily_progress
  for update to authenticated using (auth.uid() = user_id);

create table if not exists task_results (
  user_id    uuid not null references auth.users(id) on delete cascade,
  task_id    text not null,
  skill      text,
  score      integer,
  max_score  integer,
  answers    jsonb,
  created_at timestamptz not null default now(),
  -- upsert onConflict "user_id,task_id"; switches to per-attempt rows
  -- together with the stats-block code change (П3)
  primary key (user_id, task_id)
);

alter table task_results enable row level security;

drop policy if exists "read own task results" on task_results;
create policy "read own task results" on task_results
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "insert own task results" on task_results;
create policy "insert own task results" on task_results
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "update own task results" on task_results;
create policy "update own task results" on task_results
  for update to authenticated using (auth.uid() = user_id);

-- Public forms: anonymous visitors submit, nobody reads via the client API.
create table if not exists contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

drop policy if exists "anyone can submit contact" on contact_messages;
create policy "anyone can submit contact" on contact_messages
  for insert to anon, authenticated with check (true);

create table if not exists b2b_leads (
  id            uuid primary key default gen_random_uuid(),
  school_name   text not null,
  contact_name  text not null,
  email         text not null,
  phone         text,
  student_count text,
  created_at    timestamptz not null default now()
);

alter table b2b_leads enable row level security;

drop policy if exists "anyone can submit b2b lead" on b2b_leads;
create policy "anyone can submit b2b lead" on b2b_leads
  for insert to anon, authenticated with check (true);

-- ---------------------------------------------------------------------
-- 9. consume_ai_quota — atomic daily + monthly + per-user budget check.
--    Limits are passed in from the single config (src/lib/ai/limits.ts) so
--    numbers live in ONE place in code. p_day is computed app-side in the
--    user's timezone (midnight reset per user).
-- ---------------------------------------------------------------------
create or replace function consume_ai_quota(
  p_feature               text,
  p_day                   date,
  p_amount                integer,
  p_daily_limit           integer default null,
  p_monthly_limit         integer default null,
  p_cost_usd              numeric default 0,
  p_user_month_budget_usd numeric default null
) returns jsonb language plpgsql security definer
set search_path = public
as $$
declare
  v_uid        uuid := auth.uid();
  v_today      integer;
  v_month      integer;
  v_month_cost numeric;
  v_month_from date := date_trunc('month', p_day)::date;
begin
  if v_uid is null then
    return jsonb_build_object('allowed', false, 'reason', 'unauthenticated');
  end if;

  insert into ai_usage (user_id, day, feature)
  values (v_uid, p_day, p_feature)
  on conflict (user_id, day, feature) do nothing;

  -- lock today's row: concurrent requests for the same feature serialize here
  select used into v_today
    from ai_usage
   where user_id = v_uid and day = p_day and feature = p_feature
   for update;

  select coalesce(sum(used), 0) into v_month
    from ai_usage
   where user_id = v_uid and feature = p_feature and day >= v_month_from;

  select coalesce(sum(cost_usd), 0) into v_month_cost
    from ai_usage
   where user_id = v_uid and day >= v_month_from;

  if p_daily_limit is not null and v_today + p_amount > p_daily_limit then
    return jsonb_build_object('allowed', false, 'reason', 'daily_limit',
                              'used_today', v_today, 'used_month', v_month);
  end if;
  if p_monthly_limit is not null and v_month + p_amount > p_monthly_limit then
    return jsonb_build_object('allowed', false, 'reason', 'monthly_limit',
                              'used_today', v_today, 'used_month', v_month);
  end if;
  if p_user_month_budget_usd is not null and v_month_cost + p_cost_usd > p_user_month_budget_usd then
    return jsonb_build_object('allowed', false, 'reason', 'user_budget',
                              'used_today', v_today, 'used_month', v_month);
  end if;

  update ai_usage
     set used = used + p_amount,
         cost_usd = cost_usd + p_cost_usd,
         updated_at = now()
   where user_id = v_uid and day = p_day and feature = p_feature;

  return jsonb_build_object('allowed', true, 'reason', null,
                            'used_today', v_today + p_amount, 'used_month', v_month + p_amount);
end;
$$;

grant execute on function consume_ai_quota(text, date, integer, integer, integer, numeric, numeric) to authenticated;

-- ---------------------------------------------------------------------
-- 10. Voice minutes: availability check before a session and actual
--     consumption after it (base daily quota first, then credits FIFO).
-- ---------------------------------------------------------------------
create or replace function check_voice_allowance(
  p_day        date,
  p_daily_base integer
) returns jsonb language plpgsql security definer
set search_path = public
as $$
declare
  v_uid        uuid := auth.uid();
  v_used_today integer;
  v_credits    integer;
begin
  if v_uid is null then
    return jsonb_build_object('allowed', false, 'reason', 'unauthenticated');
  end if;

  select coalesce(used, 0) into v_used_today
    from ai_usage
   where user_id = v_uid and day = p_day and feature = 'voice_minutes';
  v_used_today := coalesce(v_used_today, 0);

  select coalesce(sum(minutes - used), 0) into v_credits
    from voice_minute_credits
   where user_id = v_uid and expires_at > now() and used < minutes;

  return jsonb_build_object(
    'allowed', (p_daily_base - v_used_today) + v_credits > 0,
    'base_left', greatest(p_daily_base - v_used_today, 0),
    'credits_left', v_credits
  );
end;
$$;

grant execute on function check_voice_allowance(date, integer) to authenticated;

create or replace function consume_voice_minutes(
  p_day        date,
  p_minutes    integer,
  p_daily_base integer,
  p_cost_usd   numeric default 0
) returns jsonb language plpgsql security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_used      integer;
  v_from_base integer;
  v_rest      integer;
  v_row       record;
  v_take      integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  end if;
  if p_minutes <= 0 then
    return jsonb_build_object('ok', true, 'from_base', 0, 'from_credits', 0);
  end if;

  insert into ai_usage (user_id, day, feature)
  values (v_uid, p_day, 'voice_minutes')
  on conflict (user_id, day, feature) do nothing;

  select used into v_used
    from ai_usage
   where user_id = v_uid and day = p_day and feature = 'voice_minutes'
   for update;

  v_from_base := least(p_minutes, greatest(p_daily_base - v_used, 0));
  v_rest := p_minutes - v_from_base;

  -- burn credits FIFO by expiry; sessions are settled by actual usage, so we
  -- allow the last minute to overdraw a credit row rather than cut the call
  for v_row in
    select id, minutes, used
      from voice_minute_credits
     where user_id = v_uid and expires_at > now() and used < minutes
     order by expires_at asc
     for update
  loop
    exit when v_rest <= 0;
    v_take := least(v_rest, v_row.minutes - v_row.used);
    update voice_minute_credits set used = used + v_take where id = v_row.id;
    v_rest := v_rest - v_take;
  end loop;

  update ai_usage
     set used = used + p_minutes - v_rest, -- uncovered remainder is not billed to quota
         cost_usd = cost_usd + p_cost_usd,
         updated_at = now()
   where user_id = v_uid and day = p_day and feature = 'voice_minutes';

  return jsonb_build_object('ok', true,
                            'from_base', v_from_base,
                            'from_credits', p_minutes - v_from_base - v_rest,
                            'uncovered', v_rest);
end;
$$;

grant execute on function consume_voice_minutes(date, integer, integer, numeric) to authenticated;

-- ---------------------------------------------------------------------
-- 11. redeem_promo — atomic: validates, records the redemption (unique per
--     user via constraint) and bumps the counter.
-- ---------------------------------------------------------------------
create or replace function redeem_promo(
  p_code       text,
  p_package_id text default null
) returns jsonb language plpgsql security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_promo promo_codes%rowtype;
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

  begin
    insert into promo_redemptions (code_id, user_id, package_id)
    values (v_promo.id, v_uid, p_package_id);
  exception when unique_violation then
    return jsonb_build_object('ok', false, 'reason', 'already_used');
  end;

  update promo_codes set used_count = used_count + 1 where id = v_promo.id;

  return jsonb_build_object('ok', true, 'discount_percent', v_promo.discount_percent);
end;
$$;

grant execute on function redeem_promo(text, text) to authenticated;

-- ---------------------------------------------------------------------
-- 12. get_public_stats — honest numbers for the landing ticker (block A1).
--     Only aggregates, no names. NOTE: created_at is backfilled with the
--     migration date for pre-existing rows, so "joined last 24h" becomes
--     accurate from now on.
-- ---------------------------------------------------------------------
create or replace function get_public_stats()
returns jsonb language sql stable security definer
set search_path = public
as $$
  select jsonb_build_object(
    'students_total',    (select count(*) from profiles),
    'joined_24h',        (select count(*) from profiles
                           where created_at >= now() - interval '24 hours'),
    'diagnostics_total', (select count(*) from profiles where quiz_result is not null)
  );
$$;

grant execute on function get_public_stats() to anon, authenticated;
