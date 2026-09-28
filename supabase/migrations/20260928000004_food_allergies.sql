-- Specific allergens the user wants excluded from recipe suggestions.
-- Separate from disliked_foods ("lust niet") so toggling either preference
-- chip does not wipe the other list.
alter table public.profiles
  add column if not exists food_allergies text[] not null default '{}';
