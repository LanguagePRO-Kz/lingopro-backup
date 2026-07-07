-- 0003: diagnostic v2 + plan engine (DESIGN-DIAGNOSTIC-V2 §5-6, DESIGN-PLAN-ENGINE §2)

-- Daily study minutes chosen in the quiz onboarding; editable in settings.
-- The plan engine consumes it directly; until then the dashboard maps it
-- onto the legacy intensity (15→light, 30→medium, 45/60→intensive).
alter table profiles
  add column if not exists study_minutes_daily integer
  check (study_minutes_daily is null or study_minutes_daily between 5 and 240);

-- The AI-generated weekly study route (StudyRoute JSON, one current version;
-- regenerated only on explicit events — settings change, big mock gap).
alter table profiles
  add column if not exists study_route jsonb;
