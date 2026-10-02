-- Security + performance hardening, prepared during the 2026-10-02 audit.
--
-- Applied to the live project on 2026-10-02 (with the owner's approval) as
-- audit_security_part1 + audit_rls_initplan_part1..3. Part 4 (avatars) has
-- to be run from the Supabase SQL editor: the MCP connection times out on
-- storage.objects.
-- Every statement is non-destructive: no table, column or row is removed or
-- changed, and every policy keeps exactly the same meaning ("only your own
-- rows"). Safe to run more than once.

-- 1. handle_new_user() is a SECURITY DEFINER trigger function. It only needs
--    to run from the auth.users trigger, never via /rest/v1/rpc.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 2. RLS: evaluate auth.uid() once per query instead of once per row
--    (Supabase advisor "auth_rls_initplan"). Same rule, faster at scale.
alter policy buddy_conversations_delete_own on public.buddy_conversations using ((select auth.uid()) = user_id);
alter policy buddy_conversations_insert_own on public.buddy_conversations with check ((select auth.uid()) = user_id);
alter policy buddy_conversations_select_own on public.buddy_conversations using ((select auth.uid()) = user_id);
alter policy buddy_conversations_update_own on public.buddy_conversations using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy cycle_logs_delete_own on public.cycle_logs using ((select auth.uid()) = user_id);
alter policy cycle_logs_insert_own on public.cycle_logs with check ((select auth.uid()) = user_id);
alter policy cycle_logs_select_own on public.cycle_logs using ((select auth.uid()) = user_id);
alter policy cycle_logs_update_own on public.cycle_logs using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy cycle_profiles_delete_own on public.cycle_profiles using ((select auth.uid()) = user_id);
alter policy cycle_profiles_insert_own on public.cycle_profiles with check ((select auth.uid()) = user_id);
alter policy cycle_profiles_select_own on public.cycle_profiles using ((select auth.uid()) = user_id);
alter policy cycle_profiles_update_own on public.cycle_profiles using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy daily_checkins_delete_own on public.daily_checkins using ((select auth.uid()) = user_id);
alter policy daily_checkins_insert_own on public.daily_checkins with check ((select auth.uid()) = user_id);
alter policy daily_checkins_select_own on public.daily_checkins using ((select auth.uid()) = user_id);
alter policy daily_checkins_update_own on public.daily_checkins using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy diary_entries_delete_own on public.diary_entries using ((select auth.uid()) = user_id);
alter policy diary_entries_insert_own on public.diary_entries with check ((select auth.uid()) = user_id);
alter policy diary_entries_select_own on public.diary_entries using ((select auth.uid()) = user_id);
alter policy diary_entries_update_own on public.diary_entries using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy doctor_appointments_delete_own on public.doctor_appointments using ((select auth.uid()) = user_id);
alter policy doctor_appointments_insert_own on public.doctor_appointments with check ((select auth.uid()) = user_id);
alter policy doctor_appointments_select_own on public.doctor_appointments using ((select auth.uid()) = user_id);
alter policy doctor_appointments_update_own on public.doctor_appointments using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy exercise_favorites_delete_own on public.exercise_favorites using ((select auth.uid()) = user_id);
alter policy exercise_favorites_insert_own on public.exercise_favorites with check ((select auth.uid()) = user_id);
alter policy exercise_favorites_select_own on public.exercise_favorites using ((select auth.uid()) = user_id);
alter policy favorites_delete_own on public.favorites using ((select auth.uid()) = user_id);
alter policy favorites_insert_own on public.favorites with check ((select auth.uid()) = user_id);
alter policy favorites_select_own on public.favorites using ((select auth.uid()) = user_id);
alter policy meal_plans_delete_own on public.meal_plans using ((select auth.uid()) = user_id);
alter policy meal_plans_insert_own on public.meal_plans with check ((select auth.uid()) = user_id);
alter policy meal_plans_select_own on public.meal_plans using ((select auth.uid()) = user_id);
alter policy meal_plans_update_own on public.meal_plans using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy medication_logs_delete_own on public.medication_logs using ((select auth.uid()) = user_id);
alter policy medication_logs_insert_own on public.medication_logs with check ((select auth.uid()) = user_id);
alter policy medication_logs_select_own on public.medication_logs using ((select auth.uid()) = user_id);
alter policy medication_logs_update_own on public.medication_logs using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy medications_delete_own on public.medications using ((select auth.uid()) = user_id);
alter policy medications_insert_own on public.medications with check ((select auth.uid()) = user_id);
alter policy medications_select_own on public.medications using ((select auth.uid()) = user_id);
alter policy medications_update_own on public.medications using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy peri_assessments_delete_own on public.peri_assessments using ((select auth.uid()) = user_id);
alter policy peri_assessments_insert_own on public.peri_assessments with check ((select auth.uid()) = user_id);
alter policy peri_assessments_select_own on public.peri_assessments using ((select auth.uid()) = user_id);
alter policy peri_assessments_update_own on public.peri_assessments using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy profiles_delete_own on public.profiles using ((select auth.uid()) = id);
alter policy profiles_insert_own on public.profiles with check ((select auth.uid()) = id);
alter policy profiles_select_own on public.profiles using ((select auth.uid()) = id);
alter policy profiles_update_own on public.profiles using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
alter policy push_subscriptions_delete_own on public.push_subscriptions using ((select auth.uid()) = user_id);
alter policy push_subscriptions_insert_own on public.push_subscriptions with check ((select auth.uid()) = user_id);
alter policy push_subscriptions_select_own on public.push_subscriptions using ((select auth.uid()) = user_id);
alter policy push_subscriptions_update_own on public.push_subscriptions using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy reminders_delete_own on public.reminders using ((select auth.uid()) = user_id);
alter policy reminders_insert_own on public.reminders with check ((select auth.uid()) = user_id);
alter policy reminders_select_own on public.reminders using ((select auth.uid()) = user_id);
alter policy reminders_update_own on public.reminders using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy saved_moments_delete_own on public.saved_moments using ((select auth.uid()) = user_id);
alter policy saved_moments_insert_own on public.saved_moments with check ((select auth.uid()) = user_id);
alter policy saved_moments_select_own on public.saved_moments using ((select auth.uid()) = user_id);
alter policy sleep_entries_delete_own on public.sleep_entries using ((select auth.uid()) = user_id);
alter policy sleep_entries_insert_own on public.sleep_entries with check ((select auth.uid()) = user_id);
alter policy sleep_entries_select_own on public.sleep_entries using ((select auth.uid()) = user_id);
alter policy sleep_entries_update_own on public.sleep_entries using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy workout_sessions_delete_own on public.workout_sessions using ((select auth.uid()) = user_id);
alter policy workout_sessions_insert_own on public.workout_sessions with check ((select auth.uid()) = user_id);
alter policy workout_sessions_select_own on public.workout_sessions using ((select auth.uid()) = user_id);
alter policy workout_sessions_update_own on public.workout_sessions using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
alter policy buddy_messages_select_own on public.buddy_messages using (exists (select 1 from public.buddy_conversations c where c.id = buddy_messages.conversation_id and c.user_id = (select auth.uid())));
alter policy buddy_messages_delete_own on public.buddy_messages using (exists (select 1 from public.buddy_conversations c where c.id = buddy_messages.conversation_id and c.user_id = (select auth.uid())));
alter policy buddy_messages_insert_own on public.buddy_messages with check (exists (select 1 from public.buddy_conversations c where c.id = buddy_messages.conversation_id and c.user_id = (select auth.uid())));

-- 3. Covering indexes for foreign keys (advisor "unindexed_foreign_keys").
create index if not exists favorites_recipe_id_idx on public.favorites (recipe_id);
create index if not exists exercise_favorites_exercise_id_idx on public.exercise_favorites (exercise_id);
create index if not exists meal_plans_breakfast_idx on public.meal_plans (breakfast);
create index if not exists meal_plans_lunch_idx on public.meal_plans (lunch);
create index if not exists meal_plans_dinner_idx on public.meal_plans (dinner);
create index if not exists meal_plans_snack_idx on public.meal_plans (snack);

-- 4. Avatars: the bucket is public, so photos keep loading through their
--    public URL without any SELECT policy. The old "anyone may read"
--    policy additionally let anyone LIST every file name (= user ids).
--    Replace it with "you may see your own folder", which the upload's
--    upsert still needs.
drop policy if exists avatars_public_read on storage.objects;
drop policy if exists avatars_select_own on storage.objects;
create policy avatars_select_own on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 5. Document the intentional "RLS on, no policies" table.
comment on table public.push_notification_log is
  'Written and read only by the send-reminders cron via the service role. RLS is on with no policies on purpose: no user session may read or write it.';
