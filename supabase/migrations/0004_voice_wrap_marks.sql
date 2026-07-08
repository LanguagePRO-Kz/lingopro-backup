-- 0004: voice wrap marks — billing stops the moment the student presses
-- "end lesson". The client stamps the press server-side; the settle route
-- then bills min(call duration, press moment). Anti-abuse: the discount is
-- honoured only when the call actually ended within a short grace window
-- after the stamp (a real wrap-up is <60s) — stamping early and continuing
-- to talk voids the cutoff, so it can only make a bill smaller honestly.

create table if not exists voice_wrap_marks (
  user_id         uuid not null references auth.users(id) on delete cascade,
  conversation_id text not null,
  requested_at    timestamptz not null default now(),
  primary key (user_id, conversation_id)
);

alter table voice_wrap_marks enable row level security;

-- students may stamp only their own sessions; first press wins (PK),
-- reads/updates are server-only (service role bypasses RLS)
drop policy if exists "insert own wrap mark" on voice_wrap_marks;
create policy "insert own wrap mark" on voice_wrap_marks
  for insert to authenticated
  with check (auth.uid() = user_id);
