-- Migration 002: child + activity_log.
--
-- One child per parent (UNIQUE on parent_id) is intentional. When we
-- add multi-child support we'll relax the constraint and add a
-- child_id column to activity_log (currently activity_log links to
-- parent_id directly since the log is the parent's record).

create table public.child (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null unique references public.profiles(id) on delete cascade,
  name text not null,
  dob date not null,
  pronouns text not null default 'they' check (pronouns in ('he', 'she', 'they')),
  photo_url text,
  created_at timestamptz not null default now()
);

alter table public.child enable row level security;

create policy "Child viewable by parent"
  on public.child for select using (auth.uid() = parent_id);
create policy "Child insertable by parent"
  on public.child for insert with check (auth.uid() = parent_id);
create policy "Child updatable by parent"
  on public.child for update using (auth.uid() = parent_id);
create policy "Child deletable by parent"
  on public.child for delete using (auth.uid() = parent_id);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  activity_id text not null,
  completed_at timestamptz not null default now(),
  parent_note text
);

alter table public.activity_log enable row level security;

create policy "Activity log viewable by parent"
  on public.activity_log for select using (auth.uid() = parent_id);
create policy "Activity log insertable by parent"
  on public.activity_log for insert with check (auth.uid() = parent_id);
create policy "Activity log updatable by parent"
  on public.activity_log for update using (auth.uid() = parent_id);
create policy "Activity log deletable by parent"
  on public.activity_log for delete using (auth.uid() = parent_id);

create index activity_log_parent_id_idx on public.activity_log(parent_id);
create index activity_log_completed_at_idx on public.activity_log(completed_at desc);
