-- 0005: onboarding flag — when the student closed (or completed) the
-- "getting started" checklist. Null = show it. Settings can reset it to
-- re-show the checklist and section hints. One column, no new tables;
-- checklist PROGRESS itself is never stored — it is recomputed live from
-- real data (daily_progress, voice_sessions, ai_usage), so it can't lie.

alter table profiles add column if not exists onboarded_at timestamptz;
