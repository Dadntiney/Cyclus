-- Small per-user key/value store for state that used to live only in the
-- browser's localStorage: week-plan adjustments, the grocery checklist,
-- servings preferences and "dag afgesloten". Keeping a copy on the account
-- means it follows her to another phone and survives clearing the browser.
-- The app still reads localStorage first (instant), and syncs this table in
-- the background. Rows are removed with the account (on delete cascade).

create table if not exists public.user_client_state (
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null check (char_length(key) between 1 and 200),
  value text not null check (char_length(value) <= 20000),
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

comment on table public.user_client_state is
  'Synced copy of per-device UI state (week overrides, grocery checks, servings, day closed). Keys are the localStorage keys.';

alter table public.user_client_state enable row level security;

create policy user_client_state_select_own on public.user_client_state
  for select using ((select auth.uid()) = user_id);
create policy user_client_state_insert_own on public.user_client_state
  for insert with check ((select auth.uid()) = user_id);
create policy user_client_state_update_own on public.user_client_state
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy user_client_state_delete_own on public.user_client_state
  for delete using ((select auth.uid()) = user_id);

