# Databasemigraties — stand van zaken en veilige werkwijze

_Opgesteld tijdens de audit van 2 oktober 2026._

## Probleem

De bestanden in `supabase/migrations` en de migratiegeschiedenis in het live
Supabase-project (`cyclus`) lopen uiteen:

- In de repo staan andere versienummers en namen dan in de live geschiedenis
  (live: o.a. `20260925070339_initial_schema`, repo: `20260925000001_initial_schema`).
- Een deel is handmatig toegepast (via `SAFE_LIVE_MIGRATE.sql` of de SQL-editor),
  bijvoorbeeld `wave2_wave3_features`, `life_stage_peri_features` en
  `food_allergies`. De tabellen en kolommen bestaan live, maar staan niet in de
  geschiedenis.
- Twee versienummers kwamen dubbel voor. Die zijn hernoemd naar `…000008` en
  `…000009`; dat raakt de database niet.

Daardoor is `supabase db push` **niet veilig**: de CLI zou migraties opnieuw
proberen te draaien die live al zijn toegepast.

## Zo pas je een nieuwe migratie veilig toe (tot de baseline er is)

1. Schrijf de migratie idempotent (`if not exists`, `create or replace`,
   `drop policy if exists` …), zodat dubbel draaien geen kwaad kan.
2. Laat hem nakijken en geef akkoord.
3. Pas alleen dát bestand toe, via de Supabase SQL-editor of de MCP-tool
   `apply_migration`. Gebruik **niet** `supabase db push`.

## Openstaande migratie

- `20261002000001_audit_security_performance.sql`: `REVOKE` op
  `handle_new_user`, sneller uitgevoerde RLS-policies (zelfde betekenis),
  6 FK-indexen, avatars niet meer opvraagbaar als lijst, en documentatie bij
  `push_notification_log`. De migratie is lokaal gevalideerd tegen een
  nagebouwd schema (PGlite), twee keer achter elkaar zonder fouten.
  **Nog niet toegepast op live.**

## Aanbevolen herstel (vraagt een schrijfactie op de migratietabel)

1. Het live schema alleen-lezen exporteren (`supabase db dump --schema public`)
   als één nieuwe baseline-migratie.
2. De oude migratiebestanden archiveren in `supabase/migrations/_archive`.
3. Met `supabase migration repair` de live geschiedenis laten aansluiten op de
   baseline. Dit verandert alleen de geschiedenistabel en raakt geen
   gebruikersgegevens.
4. Daarna is `supabase db push` weer betrouwbaar.
