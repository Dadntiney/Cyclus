-- Cyclus initial schema
-- Extensions
create extension if not exists "pgcrypto";

-- =========================================================
-- PROFILES
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  age integer check (age is null or (age >= 10 and age <= 100)),
  goals text[] not null default '{}',
  wellness_preference text,
  training_preferences text[] not null default '{}',
  nutrition_preferences text[] not null default '{}',
  training_frequency integer check (training_frequency is null or (training_frequency between 1 and 7)),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per user, extends auth.users with Cyclus profile data.';

-- =========================================================
-- CYCLE PROFILES
-- =========================================================
create table if not exists public.cycle_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  has_cycle boolean not null default true,
  average_cycle_length integer check (average_cycle_length is null or (average_cycle_length between 15 and 60)),
  last_period_start date,
  regularity text check (regularity is null or regularity in ('regelmatig', 'onregelmatig', 'onbekend')),
  perimenopause_information text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists cycle_profiles_user_id_idx on public.cycle_profiles(user_id);

-- =========================================================
-- CYCLE LOGS
-- =========================================================
create table if not exists public.cycle_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  menstruation boolean not null default false,
  symptoms text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists cycle_logs_user_id_date_idx on public.cycle_logs(user_id, date desc);

-- =========================================================
-- DAILY CHECK-INS
-- =========================================================
create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  energy smallint check (energy between 1 and 5),
  mood smallint check (mood between 1 and 5),
  sleep smallint check (sleep between 1 and 5),
  stress smallint check (stress between 1 and 5),
  symptoms text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists daily_checkins_user_id_date_idx on public.daily_checkins(user_id, date desc);

-- =========================================================
-- WORKOUTS (shared content library)
-- =========================================================
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null,
  duration integer not null check (duration > 0),
  difficulty text not null check (difficulty in ('makkelijk', 'gemiddeld', 'pittig')),
  description text,
  created_at timestamptz not null default now()
);

create index if not exists workouts_type_idx on public.workouts(type);

-- =========================================================
-- EXERCISES
-- =========================================================
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  name text not null,
  muscle_group text,
  instructions text,
  sets integer,
  reps text,
  order_index integer not null default 0
);

create index if not exists exercises_workout_id_idx on public.exercises(workout_id, order_index);

-- =========================================================
-- WORKOUT SESSIONS
-- =========================================================
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid not null references public.workouts(id) on delete cascade,
  date date not null default current_date,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists workout_sessions_user_id_date_idx on public.workout_sessions(user_id, date desc);
create index if not exists workout_sessions_workout_id_idx on public.workout_sessions(workout_id);

-- =========================================================
-- RECIPES (shared content library)
-- =========================================================
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  ingredients jsonb not null default '[]',
  instructions text,
  preparation_time integer,
  nutrition_information jsonb not null default '{}',
  category text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists recipes_category_idx on public.recipes using gin(category);

-- =========================================================
-- MEAL PLANS
-- =========================================================
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  breakfast uuid references public.recipes(id) on delete set null,
  lunch uuid references public.recipes(id) on delete set null,
  dinner uuid references public.recipes(id) on delete set null,
  snack uuid references public.recipes(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists meal_plans_user_id_date_idx on public.meal_plans(user_id, date desc);

-- =========================================================
-- FAVORITES
-- =========================================================
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, recipe_id)
);

create index if not exists favorites_user_id_idx on public.favorites(user_id);

-- =========================================================
-- BUDDY CONVERSATIONS & MESSAGES
-- =========================================================
create table if not exists public.buddy_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists buddy_conversations_user_id_idx on public.buddy_conversations(user_id, updated_at desc);

create table if not exists public.buddy_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.buddy_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists buddy_messages_conversation_id_idx on public.buddy_messages(conversation_id, created_at);

-- =========================================================
-- updated_at trigger helper
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists cycle_profiles_set_updated_at on public.cycle_profiles;
create trigger cycle_profiles_set_updated_at
  before update on public.cycle_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists buddy_conversations_set_updated_at on public.buddy_conversations;
create trigger buddy_conversations_set_updated_at
  before update on public.buddy_conversations
  for each row execute function public.set_updated_at();

-- =========================================================
-- Auto-create profile row on signup
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
