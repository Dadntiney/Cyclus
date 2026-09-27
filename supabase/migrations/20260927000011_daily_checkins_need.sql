-- Persist the daily "waar heb je behoefte aan" answer used by Vandaag
-- recommendations. The app already reads/writes this column; the schema
-- was missing the matching migration.

alter table public.daily_checkins
  add column if not exists need text
  check (
    need is null
    or need in ('rust', 'beweging', 'voeding', 'energie', 'mezelf')
  );

comment on column public.daily_checkins.need is
  'Optional daily need from the Vandaag picker; steers recommendations.';
