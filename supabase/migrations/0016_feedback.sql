-- ---------------------------------------------------------------------
-- 0016: обратная связь (Фаза 6 финального захода).
--
-- Плавающая кнопка «Сообщить о проблеме»: текст студента + автоконтекст
-- (страница, user agent). RLS: пишет свои, читает свои; админ-панель
-- (Фаза 9) читает всё через service_role.
-- ---------------------------------------------------------------------

create table if not exists feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  message    text not null check (char_length(message) between 3 and 2000),
  page       text,          -- pathname, откуда отправлено
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_idx on feedback (created_at desc);

alter table feedback enable row level security;

drop policy if exists "insert own feedback" on feedback;
create policy "insert own feedback" on feedback
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "read own feedback" on feedback;
create policy "read own feedback" on feedback
  for select to authenticated
  using (auth.uid() = user_id);
