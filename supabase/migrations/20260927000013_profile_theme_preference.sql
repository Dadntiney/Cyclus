-- Weergave-instelling (Dag/Nacht/Automatisch) op het profiel. "auto" volgt
-- de systeeminstelling van het apparaat (prefers-color-scheme); "light"/
-- "dark" forceren een vaste weergave ongeacht het systeem.
alter table public.profiles
  add column if not exists theme_preference text not null default 'auto';

alter table public.profiles
  add constraint profiles_theme_preference_check
  check (theme_preference in ('light', 'dark', 'auto'));
