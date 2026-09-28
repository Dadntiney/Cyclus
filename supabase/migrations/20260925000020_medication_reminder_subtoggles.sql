-- Splits the single reminder_enabled switch for "cyclisch" medications
-- (e.g. progesteron 2 weken wel/2 weken niet) into three independently
-- toggleable notification types: the recurring start melding, the daily
-- reminder during the "wel" period, and the recurring stop melding.
-- Defaulting all three to true exactly reproduces today's behavior for
-- every existing medication (currently all three always fire together
-- whenever reminder_enabled is true), so this is purely additive.
alter table public.medications
  add column if not exists remind_on_start boolean not null default true,
  add column if not exists remind_daily boolean not null default true,
  add column if not exists remind_on_stop boolean not null default true;
