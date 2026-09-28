-- Onboarding preferences: the language Goldy answers in, whether answers stay short and
-- simple, and whether the student transferred in (Goldy uses it for Liberal Ed advice).

alter table public.profiles
  add column preferred_language text not null default 'en'
    check (preferred_language ~ '^[a-z]{2,3}$'),   -- ISO 639 code, e.g. "es", "so", "hmn"
  add column plain_language     boolean not null default false,
  add column transfer_student   boolean;           -- null until the student answers

grant update (preferred_language, plain_language, transfer_student)
  on public.profiles to authenticated;
