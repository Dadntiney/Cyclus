-- getMedicationLogsForDate filters by (user_id, date) on every Vandaag and
-- Cyclusdag load, but medication_logs only had a single-column user_id
-- index — every other date-ranged table (cycle_logs, daily_checkins,
-- workout_sessions, meal_plans) already got a composite index in the
-- initial schema. Bringing this one in line.
create index if not exists medication_logs_user_id_date_idx
  on public.medication_logs (user_id, date);
