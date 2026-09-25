-- Make the app feel like "her own place": a real personal profile with a
-- photo, her own words, and ownership over favorites — plus the storage
-- bucket and RLS needed to support it.

-- =========================================================
-- PROFILES: photo + her own words
-- =========================================================
alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists motivation text,
  add column if not exists personal_note text;

comment on column public.profiles.motivation is 'Optional, in her own words: why this matters to her.';
comment on column public.profiles.personal_note is 'A private note to herself — never shown to anyone else.';

-- =========================================================
-- EXERCISE FAVORITES (mirrors public.favorites for recipes)
-- =========================================================
create table if not exists public.exercise_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, exercise_id)
);

create index if not exists exercise_favorites_user_id_idx on public.exercise_favorites(user_id);

alter table public.exercise_favorites enable row level security;

create policy "exercise_favorites_select_own"
  on public.exercise_favorites for select
  using (auth.uid() = user_id);

create policy "exercise_favorites_insert_own"
  on public.exercise_favorites for insert
  with check (auth.uid() = user_id);

create policy "exercise_favorites_delete_own"
  on public.exercise_favorites for delete
  using (auth.uid() = user_id);

-- =========================================================
-- AVATARS storage bucket
-- Public read (shown as a small photo across the app), but — unlike
-- recipe-images — writable by the owning user themselves, scoped to a
-- path prefixed with their own user id (avatars/{userId}/...). Nobody can
-- read, write, or overwrite another user's avatar file.
-- =========================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
