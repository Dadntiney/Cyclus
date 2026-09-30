-- How many days before appointment_date the reminder should fire (0 = same day).
alter table public.doctor_appointments
  add column if not exists reminder_lead_days integer not null default 0
    check (reminder_lead_days >= 0 and reminder_lead_days <= 30);

comment on column public.doctor_appointments.reminder_lead_days is
  'Days before appointment_date to fire the reminder (0 = on the day itself).';
