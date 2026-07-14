-- ---------------------------------------------------------------------
-- 0018: сгенерированные задания (Фаза 7.5).
--
-- Учебник даёт 5 пробников — мы даём задания под конкретные пробелы.
-- Генерация ЗАРАНЕЕ В ФОНЕ (scripts/generate-tasks.mts), не на лету.
-- В банк попадает ТОЛЬКО прошедшее QA-проход «злого экзаменатора»
-- (другой AI-провайдер; чек-лист: ровно один верный ответ, уровень,
-- ключ = объяснению, естественность). Rejected хранится для аудита
-- качества генератора, студентам не отдаётся.
-- ---------------------------------------------------------------------

create table if not exists generated_tasks (
  id          uuid primary key default gen_random_uuid(),
  skill       text not null default 'grammar' check (skill in ('grammar', 'reading', 'listening')),
  level       text not null check (level in ('A1', 'A2', 'B1', 'B2', 'C1')),
  topic       text not null,
  payload     jsonb not null,   -- {question, options[4], correctAnswer, explanation}
  qa          jsonb not null,   -- вердикт злого экзаменатора (флаги + problems)
  status      text not null check (status in ('approved', 'rejected')),
  gen_model   text,             -- кто генерил / кто судил — аудит качества
  qa_model    text,
  created_at  timestamptz not null default now()
);

create index if not exists generated_tasks_pick_idx
  on generated_tasks (status, skill, level, topic);

alter table generated_tasks enable row level security;

-- студенты читают только одобренное; пишет только сервер (service_role)
drop policy if exists "read approved tasks" on generated_tasks;
create policy "read approved tasks" on generated_tasks
  for select to authenticated
  using (status = 'approved');
