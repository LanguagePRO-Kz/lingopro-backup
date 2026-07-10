-- 0008: слоты одновременных голосовых уроков (лимит конкуренции ElevenLabs).
-- Применяется вручную основателем, как обычно.
--
-- Клейм живёт максимум длину урока + запас (expires_at), поэтому упавший
-- браузер/вкладка самолечится: протухшие клеймы игнорируются и подчищаются.
-- PK по user_id — у студента не может быть двух активных уроков.
-- Писать/читать может только сервер (service-role): политик нет намеренно.

create table if not exists voice_slots (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  claimed_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists voice_slots_expires_idx on voice_slots (expires_at);

alter table voice_slots enable row level security;
