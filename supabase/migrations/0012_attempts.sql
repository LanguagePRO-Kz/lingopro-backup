-- ---------------------------------------------------------------------
-- 0012: attempts — сырые попытки студента, APPEND-ONLY (Фаза 1 P0-ядра).
--
-- Одна строка = один ответ на один вопрос. Никогда не перезаписывается:
-- RLS-политик UPDATE/DELETE нет, а триггер-замок ниже блокирует мутации
-- даже для service-роли. История нужна агенту: SRS («ошибся здесь 3 дня
-- назад»), динамика точности, «ты ошибался здесь трижды». task_results
-- не трогаем — другая зернистость (задача плана дня целиком).
--
-- topic — ТОЛЬКО канонический id из src/lib/ai/topics.ts (маппинг
-- src/data/topic-map.ts); null = «тема неизвестна» честно, НЕ 'other'.
-- is_self_reported = true — самооценка (флэшкарты «знаю/не знаю»):
-- любой расчёт точности обязан фильтровать where is_self_reported = false
-- (правило продукта: отсутствие проверки ≠ положительный результат).
-- ---------------------------------------------------------------------

create table if not exists attempts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  question_id       text not null,
  skill             text not null check (skill in
                      ('grammar','reading','listening','vocabulary','writing','speaking')),
  topic             text,
  level             text check (level in ('A1','A2','B1','B2','C1')),
  is_correct        boolean not null,
  is_self_reported  boolean not null default false,
  source            text not null check (source in
                      ('daily_plan','free_practice','diagnostic','mock_exam','voice_lesson')),
  answer            jsonb,
  time_spent_ms     integer check (time_spent_ms between 0 and 3600000),
  client_attempt_id uuid,
  answered_at       timestamptz not null default now()
);

alter table attempts enable row level security;

-- юзер пишет и читает ТОЛЬКО свои; UPDATE/DELETE-политик нет намеренно
drop policy if exists "insert own attempts" on attempts;
create policy "insert own attempts" on attempts
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "read own attempts" on attempts;
create policy "read own attempts" on attempts
  for select to authenticated using (auth.uid() = user_id);

-- замок append-only: блокирует UPDATE/DELETE для ВСЕХ ролей, включая
-- service_role (RLS она обходит, триггер — нет)
create or replace function attempts_block_mutation() returns trigger
language plpgsql as $$
begin
  raise exception 'attempts is append-only: % is not allowed', tg_op;
end;
$$;

drop trigger if exists attempts_append_only on attempts;
create trigger attempts_append_only
  before update or delete on attempts
  for each row execute function attempts_block_mutation();

-- двойной submit одного клика (ретрай сети) → одна строка; осознанный
-- повтор вопроса — новый клик, новый uuid, НОВАЯ строка (повторы — норма)
create unique index if not exists attempts_client_dedup
  on attempts (user_id, client_attempt_id) where client_attempt_id is not null;

-- рабочие индексы: точность по теме, точность по навыку, SRS «этот вопрос»
create index if not exists attempts_user_topic_idx    on attempts (user_id, topic, answered_at desc);
create index if not exists attempts_user_skill_idx    on attempts (user_id, skill, answered_at desc);
create index if not exists attempts_user_question_idx on attempts (user_id, question_id, answered_at desc);
