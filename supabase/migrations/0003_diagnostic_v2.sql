-- 0003: diagnostic v2 (DESIGN-DIAGNOSTIC-V2 §5-6)
-- Daily study minutes chosen in the quiz onboarding; editable in settings.
-- The plan engine (DESIGN-PLAN-ENGINE §4) consumes it directly; until then
-- the dashboard maps it onto the legacy intensity (15→light, 30→medium,
-- 45/60→intensive).

alter table profiles
  add column if not exists study_minutes_daily integer
  check (study_minutes_daily is null or study_minutes_daily between 5 and 240);
