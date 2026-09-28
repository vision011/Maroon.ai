-- Dashboard tour: shown on the first visit after onboarding. Clearing it replays the tour.

alter table public.profiles
  add column toured_at timestamptz;

grant update (toured_at) on public.profiles to authenticated;
