-- Explicit "is a period currently active, and since when" state, replacing
-- the earlier heuristic (inferring "still open" from a gap-days guess on
-- cycle_logs). One nullable column on cycle_profiles (already unique per
-- user) makes "double/conflicting active periods" structurally impossible:
-- there is only ever one value to hold it. Not null = a period started on
-- this date and hasn't been stopped yet; null = no active period.
alter table public.cycle_profiles
  add column if not exists active_period_start date;

comment on column public.cycle_profiles.active_period_start is
  'Start date of the currently in-progress menstruation period (set by the
   Vandaag "Menstruatie starten" action, cleared by "Menstruatie stoppen").
   Null when no period is currently active. The day count and calendar
   dots for the active range are computed live from this date through
   today — see src/lib/cycle/history.ts withActivePeriod().';
