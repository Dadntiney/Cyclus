-- Drop the duplicate "overprikkeling" mental-wellbeing category.
-- Existing selections map onto "prikkelbaarheid".

update public.profiles
set mental_wellbeing_categories = array(
  select distinct
    case
      when cat = 'overprikkeling' then 'prikkelbaarheid'
      else cat
    end
  from unnest(mental_wellbeing_categories) as cat
)
where 'overprikkeling' = any (mental_wellbeing_categories);

alter table public.profiles drop constraint if exists profiles_mental_wellbeing_categories_check;
alter table public.profiles add constraint profiles_mental_wellbeing_categories_check
  check (mental_wellbeing_categories <@ array[
    'rust', 'angst_spanning', 'prikkelbaarheid', 'somberheid',
    'eenzaamheid', 'piekeren', 'zelfvertrouwen', 'slaap', 'positiviteit', 'zelfzorg'
  ]::text[]);
