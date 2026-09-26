-- Optional "geestelijke ondersteuning" (mental wellbeing) module: meditations,
-- mindfulness exercises and affirmations, gated entirely behind an opt-in.
--
-- Unlike movement_enabled/nutrition_enabled (which default to `true` because
-- those features existed before their opt-out was added), this is a brand
-- new, genuinely optional feature nobody has asked for yet — so it defaults
-- to NULL, not `false`. NULL means "never asked, or chose 'misschien later'";
-- `false` means she explicitly said no during onboarding. Both read as "off"
-- everywhere the app checks `=== true`, but keeping them distinct preserves
-- the signal for any future soft re-invitation, without building that now.
alter table public.profiles
  add column if not exists mental_wellbeing_enabled boolean,
  add column if not exists mental_wellbeing_categories text[] not null default '{}';

alter table public.profiles drop constraint if exists profiles_mental_wellbeing_categories_check;
alter table public.profiles add constraint profiles_mental_wellbeing_categories_check
  check (mental_wellbeing_categories <@ array[
    'rust', 'angst_spanning', 'overprikkeling', 'prikkelbaarheid', 'somberheid',
    'eenzaamheid', 'piekeren', 'zelfvertrouwen', 'slaap', 'positiviteit', 'zelfzorg'
  ]::text[]);

-- Additive: widen the existing reminders type check with the new type.
alter table public.reminders drop constraint if exists reminders_type_check;
alter table public.reminders add constraint reminders_type_check
  check (type in (
    'dagelijkse_checkin', 'symptomen', 'beweging', 'routine',
    'voeding', 'cyclus', 'herstel', 'mentale_ondersteuning', 'anders'
  ));
