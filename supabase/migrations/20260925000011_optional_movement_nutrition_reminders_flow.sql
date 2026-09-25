-- Support: (1) movement being fully optional and preference-driven, (2)
-- nutrition being fully optional, (3) optional reminders, (4) optional
-- period flow-intensity tracking.

-- =========================================================
-- PROFILES: movement/nutrition optionality, flow-tracking opt-in
-- =========================================================
-- Both default to true so every existing profile keeps seeing exactly what
-- it sees today (movement and nutrition remain "on" until someone actively
-- turns them off in her profile).
alter table public.profiles
  add column if not exists movement_enabled boolean not null default true,
  add column if not exists nutrition_enabled boolean not null default true,
  add column if not exists track_flow_intensity boolean not null default false;

-- =========================================================
-- CYCLE_LOGS: optional flow intensity per period day
-- =========================================================
-- Null = not specified (the default for every existing row, and for anyone
-- who hasn't opted into tracking this). Only meaningful on days already
-- marked `menstruation = true`.
alter table public.cycle_logs
  add column if not exists flow text;

alter table public.cycle_logs
  drop constraint if exists cycle_logs_flow_check;

alter table public.cycle_logs
  add constraint cycle_logs_flow_check
  check (flow is null or flow in ('geen', 'licht', 'gemiddeld', 'hevig'));

-- =========================================================
-- REMINDERS: fully optional, user-configured
-- =========================================================
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('dagelijkse_checkin', 'symptomen', 'beweging', 'routine', 'anders')),
  -- Free-text label — required in the UI when type = 'anders', optional
  -- elsewhere as a personal note (e.g. "Yoga op maandag").
  label text,
  enabled boolean not null default true,
  -- ISO weekday numbers, 1 = maandag .. 7 = zondag.
  days smallint[] not null default '{1,2,3,4,5,6,7}',
  time time not null default '09:00',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reminders_user_id_idx on public.reminders (user_id);

alter table public.reminders enable row level security;

drop policy if exists "reminders_select_own" on public.reminders;
create policy "reminders_select_own"
  on public.reminders for select
  using (auth.uid() = user_id);

drop policy if exists "reminders_insert_own" on public.reminders;
create policy "reminders_insert_own"
  on public.reminders for insert
  with check (auth.uid() = user_id);

drop policy if exists "reminders_update_own" on public.reminders;
create policy "reminders_update_own"
  on public.reminders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "reminders_delete_own" on public.reminders;
create policy "reminders_delete_own"
  on public.reminders for delete
  using (auth.uid() = user_id);

drop trigger if exists set_reminders_updated_at on public.reminders;
create trigger set_reminders_updated_at
  before update on public.reminders
  for each row
  execute function public.set_updated_at();
