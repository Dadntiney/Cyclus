-- Life-stage, richer symptom logging, custom symptoms, and monthly
-- peri symptom-burden assessments. Educational tooling only — never a diagnosis.

-- 1) Explicit life stage on the cycle profile (drives copy + UI mode).
alter table public.cycle_profiles
  add column if not exists life_stage text
  check (
    life_stage is null
    or life_stage in (
      'regelmatig',
      'veranderend',
      'perimenopauze',
      'menopauze',
      'onbekend'
    )
  );

comment on column public.cycle_profiles.life_stage is
  'Self-selected life stage; steers cyclus UI and educational emphasis. Not a clinical label.';

-- 2) Optional severity / episode counts alongside the existing symptoms text[].
alter table public.daily_checkins
  add column if not exists symptom_details jsonb not null default '{}'::jsonb;

comment on column public.daily_checkins.symptom_details is
  'Map of symptom -> { severity?: 1|2|3, count?: number }. Keys match daily_checkins.symptoms.';

-- 3) User-defined symptom labels + pinned favorites for faster check-in.
alter table public.profiles
  add column if not exists custom_symptoms text[] not null default '{}';

alter table public.profiles
  add column if not exists preferred_symptoms text[] not null default '{}';

comment on column public.profiles.custom_symptoms is
  'User-defined symptom labels shown alongside the built-in list.';

comment on column public.profiles.preferred_symptoms is
  'Pinned symptom labels shown first in the daily check-in.';

-- 4) Monthly (or ad-hoc) symptom-burden questionnaire for the overgang journey.
create table if not exists public.peri_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  assessed_on date not null default (timezone('utc', now()))::date,
  answers jsonb not null default '{}'::jsonb,
  score integer not null check (score >= 0 and score <= 100),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, assessed_on)
);

create index if not exists peri_assessments_user_id_assessed_on_idx
  on public.peri_assessments (user_id, assessed_on desc);

alter table public.peri_assessments enable row level security;

create policy "peri_assessments_select_own"
  on public.peri_assessments for select
  using (auth.uid() = user_id);

create policy "peri_assessments_insert_own"
  on public.peri_assessments for insert
  with check (auth.uid() = user_id);

create policy "peri_assessments_update_own"
  on public.peri_assessments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "peri_assessments_delete_own"
  on public.peri_assessments for delete
  using (auth.uid() = user_id);

comment on table public.peri_assessments is
  'Self-reported symptom burden score (0-100). Educational progress log for GP conversations — not a validated medical instrument.';
