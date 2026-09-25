-- Expand the data model to support a fuller lifestyle-coach experience:
-- richer profile intake, low-carb nutrition, step-by-step recipes/exercises,
-- budget recipes, and a daily knowledge/tips library.

-- =========================================================
-- PROFILES: body metrics, health context, nutrition style
-- =========================================================
alter table public.profiles
  add column if not exists height_cm integer,
  add column if not exists weight_kg numeric(5,1),
  add column if not exists goal_weight_kg numeric(5,1),
  add column if not exists health_conditions text[] not null default '{}',
  add column if not exists movement_limitations text[] not null default '{}',
  add column if not exists nutrition_style text not null default 'normaal';

alter table public.profiles
  add constraint profiles_nutrition_style_check
  check (nutrition_style in ('normaal', 'koolhydraatarm'));

-- =========================================================
-- RECIPES: step-by-step, servings, difficulty, budget/low-carb
-- =========================================================
alter table public.recipes
  add column if not exists servings integer,
  add column if not exists difficulty text,
  add column if not exists steps jsonb,
  add column if not exists optional_ingredients jsonb,
  add column if not exists low_carb_variant text,
  add column if not exists storage_tip text,
  add column if not exists meal_prep_tip text,
  add column if not exists is_budget boolean not null default false;

alter table public.recipes
  add constraint recipes_difficulty_check
  check (difficulty is null or difficulty in ('makkelijk', 'gemiddeld', 'pittig'));

-- =========================================================
-- EXERCISES: step-by-step execution + educational context
-- =========================================================
alter table public.exercises
  add column if not exists steps jsonb,
  add column if not exists why_it_helps text,
  add column if not exists common_mistakes text,
  add column if not exists fun_fact text;

-- =========================================================
-- DAILY TIPS (public read-only content, "Tip van vandaag")
-- =========================================================
create table if not exists public.daily_tips (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  short_explanation text not null,
  practical_example text not null,
  fun_fact text,
  quiz_question text,
  quiz_options jsonb,
  quiz_answer_explanation text,
  created_at timestamptz not null default now()
);

alter table public.daily_tips enable row level security;

create policy "daily_tips_select_all"
  on public.daily_tips for select
  to authenticated
  using (true);
