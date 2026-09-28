-- Goedemorgen-melding: a dedicated singleton settings block (not a generic
-- `reminders` row) because it needs a structured content_type choice beyond
-- what that shared table models — same reasoning as why medications got
-- their own dedicated columns/logic rather than being folded into
-- `reminders`. Nullable/default-null enabled flag, same as
-- mental_wellbeing_enabled: a brand new optional feature nobody has opted
-- into yet, so existing users are unaffected until they explicitly choose.
alter table public.profiles
  add column if not exists morning_reminder_enabled boolean,
  add column if not exists morning_reminder_time time not null default '07:00',
  add column if not exists morning_reminder_days smallint[] not null default '{1,2,3,4,5,6,7}',
  add column if not exists morning_reminder_content_type text not null default 'reminder',
  add column if not exists sleep_tracking_enabled boolean;

alter table public.profiles drop constraint if exists profiles_morning_reminder_content_type_check;
alter table public.profiles add constraint profiles_morning_reminder_content_type_check
  check (morning_reminder_content_type in ('reminder', 'quote', 'affirmation', 'buddy'));

-- Optional, simple sleep tracker: one row per user per day. All fields
-- except date are nullable — "eenvoudig blijven" means she can log just a
-- bedtime and wake time and skip the rest, or log nothing at all some days.
create table if not exists public.sleep_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  bedtime time,
  wake_time time,
  wake_feeling text,
  sleep_quality text,
  -- 0/1/2/3, where 3 means "3 of meer keer" — a bucket, not an exact count.
  wake_count smallint check (wake_count is null or wake_count between 0 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.sleep_entries add constraint sleep_entries_wake_feeling_check
  check (wake_feeling is null or wake_feeling in ('uitgerust', 'redelijk_uitgerust', 'moe', 'erg_moe'));
alter table public.sleep_entries add constraint sleep_entries_sleep_quality_check
  check (sleep_quality is null or sleep_quality in ('slecht', 'matig', 'redelijk', 'goed', 'heel_goed'));

alter table public.sleep_entries enable row level security;

create policy "sleep_entries_select_own"
  on public.sleep_entries for select
  using (auth.uid() = user_id);

create policy "sleep_entries_insert_own"
  on public.sleep_entries for insert
  with check (auth.uid() = user_id);

create policy "sleep_entries_update_own"
  on public.sleep_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "sleep_entries_delete_own"
  on public.sleep_entries for delete
  using (auth.uid() = user_id);
