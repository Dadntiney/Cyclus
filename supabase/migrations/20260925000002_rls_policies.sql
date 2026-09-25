-- Row Level Security for Cyclus
-- Every user-specific table: users can only read/write their own rows.
-- Shared content tables (workouts, exercises, recipes): public read, no client writes.

-- =========================================================
-- PROFILES
-- =========================================================
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- =========================================================
-- CYCLE PROFILES
-- =========================================================
alter table public.cycle_profiles enable row level security;

create policy "cycle_profiles_select_own"
  on public.cycle_profiles for select
  using (auth.uid() = user_id);

create policy "cycle_profiles_insert_own"
  on public.cycle_profiles for insert
  with check (auth.uid() = user_id);

create policy "cycle_profiles_update_own"
  on public.cycle_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "cycle_profiles_delete_own"
  on public.cycle_profiles for delete
  using (auth.uid() = user_id);

-- =========================================================
-- CYCLE LOGS
-- =========================================================
alter table public.cycle_logs enable row level security;

create policy "cycle_logs_select_own"
  on public.cycle_logs for select
  using (auth.uid() = user_id);

create policy "cycle_logs_insert_own"
  on public.cycle_logs for insert
  with check (auth.uid() = user_id);

create policy "cycle_logs_update_own"
  on public.cycle_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "cycle_logs_delete_own"
  on public.cycle_logs for delete
  using (auth.uid() = user_id);

-- =========================================================
-- DAILY CHECK-INS
-- =========================================================
alter table public.daily_checkins enable row level security;

create policy "daily_checkins_select_own"
  on public.daily_checkins for select
  using (auth.uid() = user_id);

create policy "daily_checkins_insert_own"
  on public.daily_checkins for insert
  with check (auth.uid() = user_id);

create policy "daily_checkins_update_own"
  on public.daily_checkins for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily_checkins_delete_own"
  on public.daily_checkins for delete
  using (auth.uid() = user_id);

-- =========================================================
-- WORKOUTS (public read-only content)
-- =========================================================
alter table public.workouts enable row level security;

create policy "workouts_select_all"
  on public.workouts for select
  to authenticated
  using (true);

-- =========================================================
-- EXERCISES (public read-only content)
-- =========================================================
alter table public.exercises enable row level security;

create policy "exercises_select_all"
  on public.exercises for select
  to authenticated
  using (true);

-- =========================================================
-- WORKOUT SESSIONS
-- =========================================================
alter table public.workout_sessions enable row level security;

create policy "workout_sessions_select_own"
  on public.workout_sessions for select
  using (auth.uid() = user_id);

create policy "workout_sessions_insert_own"
  on public.workout_sessions for insert
  with check (auth.uid() = user_id);

create policy "workout_sessions_update_own"
  on public.workout_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "workout_sessions_delete_own"
  on public.workout_sessions for delete
  using (auth.uid() = user_id);

-- =========================================================
-- RECIPES (public read-only content)
-- =========================================================
alter table public.recipes enable row level security;

create policy "recipes_select_all"
  on public.recipes for select
  to authenticated
  using (true);

-- =========================================================
-- MEAL PLANS
-- =========================================================
alter table public.meal_plans enable row level security;

create policy "meal_plans_select_own"
  on public.meal_plans for select
  using (auth.uid() = user_id);

create policy "meal_plans_insert_own"
  on public.meal_plans for insert
  with check (auth.uid() = user_id);

create policy "meal_plans_update_own"
  on public.meal_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "meal_plans_delete_own"
  on public.meal_plans for delete
  using (auth.uid() = user_id);

-- =========================================================
-- FAVORITES
-- =========================================================
alter table public.favorites enable row level security;

create policy "favorites_select_own"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites_delete_own"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- =========================================================
-- BUDDY CONVERSATIONS
-- =========================================================
alter table public.buddy_conversations enable row level security;

create policy "buddy_conversations_select_own"
  on public.buddy_conversations for select
  using (auth.uid() = user_id);

create policy "buddy_conversations_insert_own"
  on public.buddy_conversations for insert
  with check (auth.uid() = user_id);

create policy "buddy_conversations_update_own"
  on public.buddy_conversations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "buddy_conversations_delete_own"
  on public.buddy_conversations for delete
  using (auth.uid() = user_id);

-- =========================================================
-- BUDDY MESSAGES (ownership via parent conversation)
-- =========================================================
alter table public.buddy_messages enable row level security;

create policy "buddy_messages_select_own"
  on public.buddy_messages for select
  using (
    exists (
      select 1 from public.buddy_conversations c
      where c.id = buddy_messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

create policy "buddy_messages_insert_own"
  on public.buddy_messages for insert
  with check (
    exists (
      select 1 from public.buddy_conversations c
      where c.id = buddy_messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

create policy "buddy_messages_delete_own"
  on public.buddy_messages for delete
  using (
    exists (
      select 1 from public.buddy_conversations c
      where c.id = buddy_messages.conversation_id
        and c.user_id = auth.uid()
    )
  );
