-- Vult de al bestaande "Dingen die ik niet lust" voedingsvoorkeur in: tot nu
-- toe kon je die alleen aanvinken, zonder ergens te kunnen invullen wélke
-- gerechten of ingrediënten je niet lust. Vrije tekst, net als
-- nutrition_preferences zelf een array zodat er meerdere kunnen worden
-- toegevoegd.
alter table public.profiles
  add column if not exists disliked_foods text[] not null default '{}';
