-- =====================================================================
-- LingoPRO — XP system + real leaderboard
-- Copy this whole file into Supabase → SQL Editor → Run.
-- Idempotent: safe to run more than once.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. profiles: add the columns the leaderboard needs (none existed).
--    `if not exists` keeps this safe whether or not they're already there.
-- ---------------------------------------------------------------------
alter table profiles add column if not exists handle        text;
alter table profiles add column if not exists city          text;
alter table profiles add column if not exists country       text;
alter table profiles add column if not exists current_level text;
alter table profiles add column if not exists target_level  text default 'C1';

-- Backfill from data we already have:
--   handle        ← part of the email before "@"
--   current_level ← the diagnostic level stored inside quiz_result (jsonb)
--   target_level  ← the platform's fixed goal (C1)
update profiles
   set handle = coalesce(handle, nullif(split_part(coalesce(email, ''), '@', 1), ''))
 where handle is null;

update profiles
   set current_level = coalesce(current_level, quiz_result->>'level')
 where current_level is null and quiz_result is not null;

update profiles
   set target_level = coalesce(target_level, 'C1')
 where target_level is null;

-- ---------------------------------------------------------------------
-- 2. xp_events — append-only log. One row per action, no per-day cap.
-- ---------------------------------------------------------------------
create table if not exists xp_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  amount     integer not null check (amount > 0),
  reason     text not null,
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists xp_events_user_created_idx
  on xp_events (user_id, created_at desc);

-- De-dup guard for once-only awards (diagnostic, daily plan / streak per day).
-- We put a stable key in metadata->>'dedup_key' and make it unique per user.
create unique index if not exists xp_events_user_dedup_idx
  on xp_events (user_id, (metadata->>'dedup_key'))
  where metadata->>'dedup_key' is not null;

alter table xp_events enable row level security;

drop policy if exists "insert own xp" on xp_events;
create policy "insert own xp" on xp_events
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "read own xp" on xp_events;
create policy "read own xp" on xp_events
  for select to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 3. get_leaderboard — SECURITY DEFINER so it can aggregate across users,
--    but it only ever returns public fields + the XP total.
-- ---------------------------------------------------------------------
create or replace function get_leaderboard(
  p_period text default 'all',    -- 'week' | 'month' | 'all'
  p_scope  text default 'global', -- 'global' | 'city' | 'country'
  p_limit  int  default 100
) returns table (
  user_id       uuid,
  handle        text,
  current_level text,
  target_level  text,
  city          text,
  country       text,
  total_xp      bigint,
  rank          int,
  is_me         boolean
) language plpgsql security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_city    text;
  v_country text;
begin
  if p_scope in ('city', 'country') then
    select p.city, p.country into v_city, v_country
      from profiles p where p.id = v_uid;
  end if;

  return query
  with xp as (
    -- sum each user's XP once, filtered by period — no joins to profiles here
    select
      e.user_id,
      sum(
        case
          when p_period = 'week'  and e.created_at >= now() - interval '7 days'  then e.amount
          when p_period = 'month' and e.created_at >= now() - interval '30 days' then e.amount
          when p_period = 'all' then e.amount
          else 0
        end
      )::bigint as xp
    from xp_events e
    group by e.user_id
  )
  select
    p.id,
    coalesce(nullif(p.handle, ''), nullif(split_part(coalesce(p.email, ''), '@', 1), ''), 'user'),
    coalesce(p.current_level, p.quiz_result->>'level'),
    coalesce(p.target_level, 'C1'),
    p.city,
    p.country,
    coalesce(x.xp, 0)::bigint,
    row_number() over (order by coalesce(x.xp, 0) desc, p.handle asc nulls last)::int,
    (p.id = v_uid)
  from profiles p
  left join xp x on x.user_id = p.id
  where
       (p_scope = 'global')
    or (p_scope = 'city'    and p.city    is not distinct from v_city)
    or (p_scope = 'country' and p.country is not distinct from v_country)
  order by coalesce(x.xp, 0) desc, p.handle asc nulls last
  limit p_limit;
end;
$$;

grant execute on function get_leaderboard(text, text, int) to authenticated;
