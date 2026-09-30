-- Doctor appointments / visit log for the arts-samenvatting flow.
-- Optional date + notes (e.g. HT adjustments agreed with GP) + optional
-- one-shot reminder on the appointment date. At least one of date/notes
-- is required at the application layer.
create table if not exists public.doctor_appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  appointment_date date,
  notes text,
  reminder_enabled boolean not null default false,
  reminder_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint doctor_appointments_has_content check (
    appointment_date is not null
    or (notes is not null and length(trim(notes)) > 0)
  ),
  constraint doctor_appointments_reminder_needs_date check (
    reminder_enabled = false
    or (appointment_date is not null and reminder_time is not null)
  )
);

create index if not exists doctor_appointments_user_id_date_idx
  on public.doctor_appointments (user_id, appointment_date desc nulls last);

create index if not exists doctor_appointments_user_reminder_idx
  on public.doctor_appointments (user_id)
  where reminder_enabled = true;

alter table public.doctor_appointments enable row level security;

drop policy if exists "doctor_appointments_select_own" on public.doctor_appointments;
create policy "doctor_appointments_select_own"
  on public.doctor_appointments for select
  using (auth.uid() = user_id);

drop policy if exists "doctor_appointments_insert_own" on public.doctor_appointments;
create policy "doctor_appointments_insert_own"
  on public.doctor_appointments for insert
  with check (auth.uid() = user_id);

drop policy if exists "doctor_appointments_update_own" on public.doctor_appointments;
create policy "doctor_appointments_update_own"
  on public.doctor_appointments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "doctor_appointments_delete_own" on public.doctor_appointments;
create policy "doctor_appointments_delete_own"
  on public.doctor_appointments for delete
  using (auth.uid() = user_id);

drop trigger if exists set_doctor_appointments_updated_at on public.doctor_appointments;
create trigger set_doctor_appointments_updated_at
  before update on public.doctor_appointments
  for each row
  execute function public.set_updated_at();

comment on table public.doctor_appointments is
  'Optional GP/specialist appointment dates and visit notes (e.g. HT changes), with optional one-shot reminder.';
