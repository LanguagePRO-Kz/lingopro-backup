-- 0006: (a) gender — asked once in the diagnostic onboarding (optional,
-- "prefer not to say" stays NULL); used for grammatically correct address in
-- gendered languages (RU) across tutor / reviews / plan texts.
-- (b) exam_date_flexible — the honest-plan fork (founder item 1): a flexible
-- date gets alternatives when the goal doesn't fit, a fixed one gets an
-- honest mobilization plan instead of a useless "postpone it".

alter table profiles add column if not exists gender text
  check (gender in ('female', 'male'));

alter table profiles add column if not exists exam_date_flexible boolean;
