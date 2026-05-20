-- Migration 001: profiles table + RLS + auto-create trigger.
--
-- profiles is the application-level mirror of auth.users. We store
-- email here so the rest of the schema can foreign-key into profiles
-- without reaching across schemas.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- RLS: a signed-in user can read + update only their own profile.
-- Insert is handled by the trigger below; no manual insert policy is
-- needed (and we explicitly do NOT add one so client-side code can't
-- create profiles for other users).
create policy "Profile viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profile updatable by owner"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Profile deletable by owner"
  on public.profiles for delete
  using (auth.uid() = id);

-- Auto-create a profiles row whenever a new auth.users row is
-- inserted. security definer so the trigger can write across the
-- RLS boundary; the function itself is locked down by the search_path
-- pin and the trigger context (runs on auth.users INSERT only).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
