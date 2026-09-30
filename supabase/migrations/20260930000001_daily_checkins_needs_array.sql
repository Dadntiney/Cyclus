-- Allow multiple "waar heb je behoefte aan" answers on Vandaag.
-- Migrates the single `need` text column to `needs text[]`.

alter table public.daily_checkins
  add column if not exists needs text[] not null default '{}';

update public.daily_checkins
set needs = array[need]
where need is not null
  and cardinality(needs) = 0;

alter table public.daily_checkins
  drop constraint if exists daily_checkins_need_check;

alter table public.daily_checkins
  drop column if exists need;

alter table public.daily_checkins
  drop constraint if exists daily_checkins_needs_valid;

alter table public.daily_checkins
  add constraint daily_checkins_needs_valid check (
    needs <@ array['rust', 'beweging', 'voeding', 'energie', 'mezelf']::text[]
  );

comment on column public.daily_checkins.needs is
  'Optional daily needs from the Vandaag picker (multi-select); steers recommendations.';
