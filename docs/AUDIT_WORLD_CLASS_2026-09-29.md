# Cyclus world-class audit — 29 Sep 2026

Screenshots: `/opt/cursor/artifacts/screenshots/audit/`.
Basis: production tip `tonight-full-promote` (live).

## Wat al sterk is (niet aanraken zonder reden)

- Fraunces + Plus Jakarta Sans: warm, premium, leesbaar — behouden.
- Sage/peach/cream tokens + fasekleuren: kloppende identiteit — behouden, info-plum bijstellen.
- Vandaag-compositie (plan → check-in → optioneel → afsluiten): juiste hiërarchie.
- Dark mode tokens: warm, niet klinisch invert.
- Herkenning + Vooruitkijken: differentiators — laten staan.

## P0 — deze ronde

1. Vandaag laadt hele workouts/recipes-tabellen → beperken/filteren.
2. Mentale rust: affirmations krijgen `[]` i.p.v. haar categorieën.
3. Dag-afsluiten CTA te laag contrast.
4. Main `pb-24` negeert gemeten nav-hoogte → content onder nav.
5. Kalenderdag-knoppen zonder aria-label.

## P1 — deze ronde

6. Dubbele kalender-instructie op Cyclus.
7. Info-kleur (#5b4a80 plum) → on-brand sage/ink.
8. Inzichtsteksten te lang/herhalend op Cyclus → korter + max 2.
9. Orphan DailyTipCard / dode tip-loader opruimen of niet aanraken als riskant — verwijder ongebruikte dead exports waar veilig.
10. Recipe library: eerste paint beperken (server slice / lazy “meer”).
11. Profile-form dynamic import.
12. Touch targets op tekstlinks (dag-afsluiten, favorieten).

## Bewust niet deze ronde (te groot / eigen PR)

- 6→5 tab navigatie (IA-breuk; open PR #12).
- Profiel opsplitsen in subroutes.
- Volledige voeding-virtualisatie.
- Cron N+1 batch rewrite (backend; apart).

## Typografie-conclusie

Huidige stack is de juiste keuze. Geen font-swap. Wel: consistente heading-schaal respecteren, geen nieuwe families.
