-- ---------------------------------------------------------------------
-- 0020: цель по умолчанию в лидерборде — B2, не C1 (рецидив 19.07.2026).
--
-- get_leaderboard подставлял 'C1' всем без явного выбора цели — седьмое
-- и последнее найденное место C1-дефолта. Продукт продаёт B2 (порог
-- вуза); C1 показывается только тем, кто выбрал его сам. Тело функции —
-- копия 0011, изменена ОДНА строка (coalesce target_level).
-- ---------------------------------------------------------------------

drop function if exists get_leaderboard(text, text, int);
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
  is_me         boolean,
  title_slug    text
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
    coalesce(p.target_level, 'B2'), -- B2 — цель по умолчанию (порог вуза)
    p.city,
    p.country,
    coalesce(x.xp, 0)::bigint,
    row_number() over (order by coalesce(x.xp, 0) desc, p.handle asc nulls last)::int,
    (p.id = v_uid),
    p.title_slug
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
