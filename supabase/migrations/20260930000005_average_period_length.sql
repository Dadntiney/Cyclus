-- Average bleeding length (menstruation days), separate from full-cycle length.
alter table public.cycle_profiles
  add column if not exists average_period_length integer
    check (average_period_length is null or (average_period_length >= 2 and average_period_length <= 14));

comment on column public.cycle_profiles.average_period_length is
  'Typical number of bleeding days (2–14). Used to seed last-period logs and phase boundaries.';
