-- Student profiles: one row per Supabase Auth user, created automatically on sign-up.
-- A row here means the person made an account. Passwords are never stored here;
-- Supabase Auth keeps them hashed in auth.users.

create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  internet_id    text not null unique              -- UMN x500, e.g. "moha2048"
                 check (internet_id ~ '^[a-z0-9]{2,32}$'),
  email          text not null unique check (email = internet_id || '@umn.edu'),
  full_name      text not null check (length(trim(full_name)) > 0),
  student_number text unique check (student_number ~ '^[0-9]{7}$'),  -- 7-digit UMN ID
  program        text,
  canvas_user_id text,                             -- set once Canvas is linked
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Rows are only created by the trigger below. Internet ID and email are fixed at
-- sign-up; students can edit everything else.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, student_number, program, canvas_user_id)
  on public.profiles to authenticated;

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Sign-up passes full_name / program as user metadata:
--   supabase.auth.signUp({ email, password, options: { data: { full_name, program } } })
-- The Internet ID comes from the email so it can't be spoofed, and only @umn.edu
-- emails can create accounts.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_email text := lower(new.email);
  x500      text := split_part(lower(new.email), '@', 1);
begin
  if new_email is null or new_email not like '%@umn.edu' then
    raise exception 'Accounts require a @umn.edu email';
  end if;

  insert into public.profiles (id, internet_id, email, full_name, program)
  values (
    new.id,
    x500,
    new_email,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), x500),
    nullif(trim(new.raw_user_meta_data ->> 'program'), '')
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
