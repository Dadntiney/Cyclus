# Pushherinneringen — hoe ze verstuurd worden

## Route

`/api/cron/send-reminders` verstuurt bij elke aanroep wat **nu** aan de beurt is:
de gekozen tijd is voorbij, maar niet meer dan 3 uur geleden
(`src/lib/reminders/push-timing.ts`). `push_notification_log` zorgt dat elk
onderdeel maximaal één keer per dag gaat. Een gemiste aanroep wordt dus door de
volgende ingehaald, en dubbele aanroepen kunnen geen kwaad.

De route vraagt `Authorization: Bearer <CRON_SECRET>`.

## Wie roept de route aan

1. **Supabase pg_cron, elke 15 minuten**: migratie
   `20261002000002_reminders_pg_cron.sql`. Dit is wat de gekozen tijd mogelijk
   maakt.
2. **Vercel Cron, dagelijks om 07:00 UTC** (`vercel.json`): vangnet. Daarmee komen
   zonder pg_cron alleen herinneringen tussen ongeveer 06:00 en 09:00 aan.

## Eenmalig instellen

1. Zet `CRON_SECRET` in Vercel (Production en Preview).
2. Zet dezelfde waarde in Supabase Vault via de SQL-editor:
   `select vault.create_secret('<waarde>', 'gofiev_cron_secret');`
3. Pas de migratie toe, **pas nadat** de tijdsbewuste route live staat.
   Een oudere route verstuurt bij elke aanroep alles van vandaag.

Controleren: `select * from cron.job_run_details order by start_time desc limit 5;`
en `select status_code, created from net._http_response order by created desc limit 5;`
(200 = goed, 401 = secret klopt niet).
