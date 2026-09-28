-- Real web push infrastructure: one row per subscribed browser/device, plus
-- a send-log so the cron job never pushes the same reminder twice on the
-- same day even if it ticks more than once before the grace window closes.

-- =========================================================
-- PUSH_SUBSCRIPTIONS: one per browser endpoint. Written by the user's own
-- authenticated session (normal RLS applies), read/deleted by the cron job
-- via the service role.
-- =========================================================
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_subscriptions_select_own" on public.push_subscriptions;
create policy "push_subscriptions_select_own"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "push_subscriptions_insert_own" on public.push_subscriptions;
create policy "push_subscriptions_insert_own"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists "push_subscriptions_update_own" on public.push_subscriptions;
create policy "push_subscriptions_update_own"
  on public.push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "push_subscriptions_delete_own" on public.push_subscriptions;
create policy "push_subscriptions_delete_own"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

-- =========================================================
-- PUSH_NOTIFICATION_LOG: internal bookkeeping only — the cron job's dedupe
-- ledger ("did source X already get pushed today?"). RLS is enabled with no
-- policies at all, so only the service role (which bypasses RLS) can ever
-- read or write it; no user session, however authenticated, gets a row.
-- =========================================================
create table if not exists public.push_notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null check (
    source_type in ('reminder', 'medication_daily', 'medication_start', 'medication_stop')
  ),
  source_id uuid not null,
  date date not null,
  sent_at timestamptz not null default now(),
  unique (source_type, source_id, date)
);

create index if not exists push_notification_log_user_id_idx on public.push_notification_log (user_id);

alter table public.push_notification_log enable row level security;

-- =========================================================
-- REMINDERS: extend the type list with the three categories called out in
-- the notifications brief that didn't have a home yet (voeding, cyclus,
-- herstel) — additive, existing rows/types unaffected.
-- =========================================================
alter table public.reminders
  drop constraint if exists reminders_type_check;

alter table public.reminders
  add constraint reminders_type_check
  check (
    type in (
      'dagelijkse_checkin', 'symptomen', 'beweging', 'routine',
      'voeding', 'cyclus', 'herstel', 'anders'
    )
  );
