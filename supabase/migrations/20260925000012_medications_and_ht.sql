-- Fully optional hormonal medication / hormone therapy (HT) / contraception
-- / other-medication tracking. Nothing here is ever populated without the
-- user's own action — the profile fields default to "not set" and the
-- medications table starts empty for everyone.

-- =========================================================
-- PROFILES: optional status question + dashboard visibility opt-in
-- =========================================================
alter table public.profiles
  add column if not exists hormonal_medication_status text,
  add column if not exists show_medication_on_dashboard boolean not null default false;

alter table public.profiles
  drop constraint if exists profiles_hormonal_medication_status_check;

alter table public.profiles
  add constraint profiles_hormonal_medication_status_check
  check (
    hormonal_medication_status is null or hormonal_medication_status in (
      'nee', 'ht', 'ac', 'andere_hormonaal', 'andere_medicatie', 'onbekend_liever_niet'
    )
  );

-- =========================================================
-- MEDICATIONS: her own entered schedule — the app never prescribes or
-- suggests dosages/hormones/schedules, only stores what she typed in.
-- =========================================================
create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('ht', 'anticonceptie', 'andere_hormonaal', 'andere_medicatie')),
  name text not null,
  -- Free text (e.g. "Oestrogeen", "Progesteron") — never a controlled list,
  -- since the app doesn't decide what hormones exist in her regimen.
  hormone_type text,
  -- Free text: spray/tablet/pleister/gel/ring/spiraal/implantaat/injectie/anders.
  form text,
  dosage text,
  schedule_type text not null check (
    schedule_type in ('dagelijks', 'om_de_dag', 'wekelijkse_dagen', 'cyclisch', 'eigen_schema')
  ),
  -- ISO weekdays (1=maandag..7=zondag), only for schedule_type = 'wekelijkse_dagen'.
  schedule_days smallint[],
  -- Day counts (weeks are converted to days client-side before saving), only
  -- for schedule_type = 'cyclisch', e.g. 14 on / 14 off = "2 weken wel/niet".
  schedule_days_on integer,
  schedule_days_off integer,
  -- Anchor date for 'om_de_dag' and 'cyclisch' calculations, and "sinds
  -- wanneer" for every schedule type.
  start_date date,
  end_date date,
  time_of_day time,
  reminder_enabled boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists medications_user_id_idx on public.medications (user_id);

alter table public.medications enable row level security;

drop policy if exists "medications_select_own" on public.medications;
create policy "medications_select_own"
  on public.medications for select
  using (auth.uid() = user_id);

drop policy if exists "medications_insert_own" on public.medications;
create policy "medications_insert_own"
  on public.medications for insert
  with check (auth.uid() = user_id);

drop policy if exists "medications_update_own" on public.medications;
create policy "medications_update_own"
  on public.medications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "medications_delete_own" on public.medications;
create policy "medications_delete_own"
  on public.medications for delete
  using (auth.uid() = user_id);

drop trigger if exists set_medications_updated_at on public.medications;
create trigger set_medications_updated_at
  before update on public.medications
  for each row
  execute function public.set_updated_at();

-- =========================================================
-- MEDICATION_LOGS: per-day "taken" state, so the daily overview can show
-- a checkmark vs. an open circle without inferring anything automatically.
-- =========================================================
create table if not exists public.medication_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  medication_id uuid not null references public.medications(id) on delete cascade,
  date date not null,
  taken boolean not null default true,
  created_at timestamptz not null default now(),
  unique (medication_id, date)
);

create index if not exists medication_logs_user_id_idx on public.medication_logs (user_id);

alter table public.medication_logs enable row level security;

drop policy if exists "medication_logs_select_own" on public.medication_logs;
create policy "medication_logs_select_own"
  on public.medication_logs for select
  using (auth.uid() = user_id);

drop policy if exists "medication_logs_insert_own" on public.medication_logs;
create policy "medication_logs_insert_own"
  on public.medication_logs for insert
  with check (auth.uid() = user_id);

drop policy if exists "medication_logs_update_own" on public.medication_logs;
create policy "medication_logs_update_own"
  on public.medication_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "medication_logs_delete_own" on public.medication_logs;
create policy "medication_logs_delete_own"
  on public.medication_logs for delete
  using (auth.uid() = user_id);
