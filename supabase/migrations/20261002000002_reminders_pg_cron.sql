-- Push reminders at her chosen time: call the send-reminders route every
-- 15 minutes from Supabase (Vercel's Hobby plan only allows a daily cron).
--
-- Apply only AFTER the time-aware route is live on gofiev.vercel.app: the
-- older route sends everything due "today" on every call.
--
-- The route checks `Authorization: Bearer <CRON_SECRET>`. The secret lives
-- in Supabase Vault under the name `gofiev_cron_secret`, never in this file;
-- store it once from the SQL editor:
--   select vault.create_secret('<same value as CRON_SECRET in Vercel>', 'gofiev_cron_secret');
-- Until that secret exists the job does nothing.
--
-- Safe to run more than once.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule(jobid) from cron.job where jobname = 'gofiev-send-reminders';

select cron.schedule(
  'gofiev-send-reminders',
  '*/15 * * * *',
  $job$
    select net.http_get(
      url := 'https://gofiev.vercel.app/api/cron/send-reminders',
      headers := jsonb_build_object('Authorization', 'Bearer ' || s.decrypted_secret),
      timeout_milliseconds := 55000
    )
    from vault.decrypted_secrets s
    where s.name = 'gofiev_cron_secret'
  $job$
);
