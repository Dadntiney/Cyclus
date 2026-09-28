-- Optional, fully user-controlled Buddy tone-of-voice preference. Empty
-- array = "geen voorkeur" -> the app falls back to the existing warm,
-- neutral default tone everywhere. Never populated without her own action.
alter table public.profiles
  add column if not exists buddy_styles text[] not null default '{}';

-- Optional cadence preference for the passive/ambient buddy content (daily
-- quote card, "even onthouden" moments) — distinct from the explicit,
-- per-item `reminders` schedule, which she already configures precisely
-- herself and shouldn't be silently reshaped by a vaguer meta-setting.
alter table public.profiles
  add column if not exists buddy_message_frequency text;

alter table public.profiles
  drop constraint if exists profiles_buddy_message_frequency_check;

alter table public.profiles
  add constraint profiles_buddy_message_frequency_check
  check (
    buddy_message_frequency is null or buddy_message_frequency in (
      'elke_dag', 'paar_keer_per_week', 'alleen_relevant', 'uit'
    )
  );

alter table public.profiles
  drop constraint if exists profiles_buddy_styles_check;

alter table public.profiles
  add constraint profiles_buddy_styles_check
  check (
    buddy_styles <@ array[
      'liefdevol', 'humor', 'spiritueel', 'motiverend',
      'informatief', 'rustig', 'direct', 'luchtig'
    ]::text[]
  );
