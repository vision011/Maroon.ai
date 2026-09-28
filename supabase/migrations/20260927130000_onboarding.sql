-- Onboarding progress (docs/prd/onboarding-flow.md). A null onboarded_at routes the
-- student to /onboarding; onboarding_step lets them resume where they left off.

alter table public.profiles
  add column graduation_year smallint check (graduation_year between 2000 and 2100),
  add column onboarding_step text,
  add column onboarded_at    timestamptz;

grant update (graduation_year, onboarding_step, onboarded_at)
  on public.profiles to authenticated;
