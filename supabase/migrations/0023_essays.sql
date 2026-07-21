-- 0023: эссе — персистентная сущность (Блок 3 захода 2026-07-21).
--
-- Корень «эссе исчезает»: работа студента жила только в React-стейте и
-- JSON-ответе API — текст, разбор и «выполнено» умирали при уходе со
-- страницы (проверка идёт 60-120с, люди не ждут). Теперь эссе пишется
-- СЕРВЕРОМ до квоты и до AI: упала проверка — текст цел, статус честный.
--
-- Статусы: pending (проверяется) | done (разбор готов) | failed (сбой,
-- можно повторить) | quota (лимит дня — сохранено, проверка позже).
create table if not exists essays (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  source      text not null default 'practice' check (source in ('practice', 'diagnostic')),
  task_id     text,
  task_prompt text,
  text        text not null,
  status      text not null default 'pending' check (status in ('pending', 'done', 'failed', 'quota')),
  review      jsonb,
  score       integer,
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists essays_user_created on essays (user_id, created_at desc);

alter table essays enable row level security;

drop policy if exists "read own essays" on essays;
create policy "read own essays" on essays
  for select to authenticated
  using (auth.uid() = user_id);
-- Запись/обновление — ТОЛЬКО service-ролью из API-роутов (клиентских
-- insert/update-политик нет намеренно: статус и review судит сервер).
