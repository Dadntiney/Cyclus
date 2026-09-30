-- Saved tips / quotes / affirmations she wants to keep (heart), separate from recipe/exercise favorites.
create table if not exists public.saved_moments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in (
    'affirmation',
    'quote',
    'tip',
    'fun_fact',
    'day_close',
    'roadmap'
  )),
  text text not null,
  source text,
  source_key text,
  created_at timestamptz not null default now(),
  unique (user_id, text)
);

create index if not exists saved_moments_user_id_created_at_idx
  on public.saved_moments (user_id, created_at desc);

alter table public.saved_moments enable row level security;

create policy "saved_moments_select_own"
  on public.saved_moments for select
  using (auth.uid() = user_id);

create policy "saved_moments_insert_own"
  on public.saved_moments for insert
  with check (auth.uid() = user_id);

create policy "saved_moments_delete_own"
  on public.saved_moments for delete
  using (auth.uid() = user_id);
