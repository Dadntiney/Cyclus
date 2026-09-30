-- Allow multiple Goedemorgen content pieces (quote + affirmation, etc.).
-- Migrates the single morning_reminder_content_type to an array.

alter table public.profiles
  add column if not exists morning_reminder_content_types text[] not null default '{reminder}';

update public.profiles
set morning_reminder_content_types = array[morning_reminder_content_type]
where morning_reminder_content_type is not null
  and cardinality(morning_reminder_content_types) = 1
  and morning_reminder_content_types[1] = 'reminder'
  and morning_reminder_content_type <> 'reminder';

-- Also backfill any row still on the default array but with a different single type.
update public.profiles
set morning_reminder_content_types = array[morning_reminder_content_type]
where morning_reminder_content_type is not null
  and morning_reminder_content_type <> coalesce(morning_reminder_content_types[1], '');

alter table public.profiles
  drop constraint if exists profiles_morning_reminder_content_type_check;

alter table public.profiles
  drop column if exists morning_reminder_content_type;

alter table public.profiles
  drop constraint if exists profiles_morning_reminder_content_types_check;

alter table public.profiles
  add constraint profiles_morning_reminder_content_types_check check (
    cardinality(morning_reminder_content_types) >= 1
    and morning_reminder_content_types <@ array['reminder', 'quote', 'affirmation', 'buddy']::text[]
  );

comment on column public.profiles.morning_reminder_content_types is
  'Multi-select content for the Goedemorgen melding (reminder, quote, affirmation, buddy).';
