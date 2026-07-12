-- ---------------------------------------------------------------------
-- 0010: память единого агента Ahu (coach_messages).
--
-- Одна таблица на все каналы:
--   proactive     — дневная заметка Ahu на дашборде (пишет СЕРВЕР);
--   chat          — переписка студента с Ahu (вопрос студента — своей
--                   сессией под RLS, ответ Ahu — сервером);
--   voice_summary — карточка-итог голосового урока в ленте чата (сервер).
--
-- Дедуп проактивных: уникальный индекс по (user, meta->>'day_key');
-- day_key = 'YYYY-MM-DD#STATE' (CoachDecision.dayKey) — одно сообщение на
-- состояние в день, смена состояния даёт второе; жёсткий потолок 2/день
-- держит существующая квота `motivator` (consume_ai_quota).
-- ---------------------------------------------------------------------

create table if not exists coach_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  channel    text not null check (channel in ('proactive', 'chat', 'voice_summary')),
  role       text not null check (role in ('ahu', 'student')),
  content    text not null,
  -- proactive: {day_key, state, action, focus_topics}; chat: {};
  -- voice_summary: {conversation_id, minutes, criteria_total, topics}
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists coach_messages_user_idx
  on coach_messages (user_id, created_at desc);

-- лента чата грузится отдельно от проактивных заметок
create index if not exists coach_messages_user_channel_idx
  on coach_messages (user_id, channel, created_at desc);

create unique index if not exists coach_messages_proactive_uniq
  on coach_messages (user_id, (meta->>'day_key'))
  where channel = 'proactive';

alter table coach_messages enable row level security;

-- читать: только свои строки
drop policy if exists "read own coach messages" on coach_messages;
create policy "read own coach messages" on coach_messages
  for select to authenticated
  using (auth.uid() = user_id);

-- писать своей сессией: ТОЛЬКО свои сообщения студента в чат.
-- Строки Ahu (proactive/chat-ответ/voice_summary) вставляет сервер
-- service-ролью (createAdminClient — тот же паттерн, что voice_slots):
-- клиент не может писать от имени преподавателя.
drop policy if exists "student writes own chat" on coach_messages;
create policy "student writes own chat" on coach_messages
  for insert to authenticated
  with check (auth.uid() = user_id and role = 'student' and channel = 'chat');

-- update/delete-политик нет намеренно: журнал append-only для клиента.
