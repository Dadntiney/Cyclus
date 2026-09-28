# Concurrentieanalyse: Cyclus vs Flo, Clue, Apple Gezondheid, PERIOD.

**Doel:** bepalen welke nuttige, onderscheidende functies concurrenten hebben die Cyclus nog mist, en welke daarvan slim, waardevol en haalbaar zijn om toe te voegen — met focus op menstruatie → veranderende cyclus → perimenopauze → menopauze. Zwangerschapsplanning blijft buiten scope.

**Methode:**
- Cyclus: volledige codebase-audit (`src/`, `supabase/migrations/`, Capacitor-config).
- Concurrenten: officiële product-/supportpagina’s, App Store-beschrijvingen, Apple Support-documentatie en betrouwbare secundaire bronnen (mei–sept 2026 waar beschikbaar). Marketingclaims zijn niet 1-op-1 als feit overgenomen; betaalmuur, land/apparaat-afhankelijkheid en “aangekondigd vs beschikbaar” zijn waar mogelijk gemarkeerd.

**Bronnen (kern):**
- Flo Premium-vergelijking: [flo.health/flo-premium](https://flo.health/flo-premium); Flo for Perimenopause (med): [med.flo.health/perimenopause-support](https://med.flo.health/perimenopause-support); Flo newsroom perimenopause-suite (mei 2026, Premium); Anonymous Mode: [flo.health/anonymous-mode](https://flo.health/anonymous-mode); NL App Store IAP o.a. ~€39,99/jaar.
- Clue modes & Perimenopause: [support.helloclue.com](https://support.helloclue.com/hc/en-us/articles/16701057975581-What-are-modes), [Introducing Clue Perimenopause](https://helloclue.com/articles/menopause/introducing-clue-perimenopause); Apple Health sync (period/flow, geen import): Clue Support; data-export JSON: Clue Support; Oura-integratie: Clue Support; CE Class I medical device claim: Clue marketing.
- Apple Cycle Tracking: [support.apple.com](https://support.apple.com/en-is/120356) (o.a. predictions, deviation detection, menopause stages, PDF export, Watch temperature/HR); iOS/watchOS 27 menopause notifications (40+, region-afhankelijk).
- PERIOD.: [myperiod.app](https://myperiod.app/), [Plus](https://myperiod.app/plus-en) (€3,49/m of €34,99/j), App Store listing, blog Apple vs PERIOD.; overgang op roadmap (HowAboutMom-interview), nog geen volledige perimenopauze-modus.

---

## A. Huidige functionaliteiten van Cyclus

Cyclus is een Nederlands, volledig gratis (geen paywall in code) wellness-/coachingsproduct op Next.js + Supabase + Capacitor-shell. Sterkte zit in **lifestyle-loop** (check-in → aanbevelingen → voeding/training/mentaal → buddy), niet in klassieke period-tracker-diepte.

### A1. Feature-matrix (codebase)

| Functionaliteit | Hebben wij dit? | Waar in de app/code? | Hoe uitgebreid? |
|---|---|---|---|
| Menstruatie start/stop | Ja | `lib/actions/cycle.ts`, `menstruation-quick-action.tsx`, Vandaag | Actieve menstruatie + dag-telling |
| Kalender dagen aan/uit | Ja | `components/cycle/calendar.tsx`, `/cyclus` | Maandnavigatie, mid-period unmark |
| Flow-intensiteit | Ja (opt-in) | `FLOW_OPTIONS`, `cycle_logs.flow`, profiel `track_flow_intensity` | geen/licht/gemiddeld/hevig |
| Cycluslengte (gebruiker) | Ja | `cycle_profiles.average_cycle_length` | 15–60 dagen |
| Regulariteit | Ja | `REGULARITY_OPTIONS` | regelmatig/onregelmatig/onbekend + disclaimer |
| Fase-schatting | Ja | `lib/cycle/estimate.ts` | menstruatie/folliculair/ovulatie/luteaal — **geen** “volgende menstruatie”-voorspelling-UI |
| Cyclusgeschiedenis | Ja | `lib/cycle/history.ts` | Periodes, lengte tussen starts, dominant flow |
| Lengtetrend / onregelmatiger | Ja | `patterns.ts` `computeCycleLengthTrend` | Tekstinzicht bij ≥4 voltooide cycli |
| Symptomen (dagelijks) | Ja | `SYMPTOM_OPTIONS` + optioneel `MENTAL_SYMPTOM_OPTIONS` | ~19 fysiek/algemeen + 7 mentaal; zie gaps hieronder |
| Energie / stemming / slaap / stress (1–5) | Ja | `daily_checkins`, check-in-form | Progressive disclosure |
| Need-of-the-day | Ja | `NEED_OPTIONS` | rust/beweging/voeding/energie/mezelf |
| Notities | Ja | check-in notes ≤1000; dagboek apart | |
| Libido | **Nee** (niet in constants/check-in) | — | Niet vastgesteld als trackingveld |
| Gewicht (dagelijks) | Deels | Onboarding `weightKg`/`goalWeightKg` | Geen dagelijkse gewichtslog |
| Afscheiding / cervical mucus | **Nee** | — | Niet vastgesteld |
| Pijn als intensiteitsschaal | Deels | Buik-/rug-/nekpijn als checkbox | Geen 0–10 pijnschaal per locatie |
| Opvliegers / nachtzweten | Ja | In `SYMPTOM_OPTIONS` | Aanwezig; geen severity/frequentie per episode |
| Brain fog | Ja | Als “Brain fog” → UI “Concentratieproblemen” | Checkbox, geen severity |
| Vaginale klachten | **Nee** | — | Niet in symptomenlijst |
| Urinewegklachten | **Nee** | — | Niet vastgesteld |
| Huid / haar | **Nee** | — | Niet vastgesteld |
| Slaapmodule | Ja | `/slaap`, `sleep_entries`, insights | Bedtijd, kwaliteit, wake feeling, correlaties |
| Trends / inzichten (tekst) | Ja | `insights.ts`, `PersonalInsights` | Bij ≥10 check-ins; fase×symptoom |
| Grafieken / charts | **Nee** | Geen chart-dependency | Alleen tekst/lijsten |
| Arts-samenvatting | Ja | `/cyclus/samenvatting`, `doctor-summary.ts` | 4/8/12 weken; print via `window.print()` — geen PDF-lib |
| Herinneringen | Ja | `reminders`, RemindersSection | Types + dagen/tijden |
| Push | Deels | Web Push VAPID; cron | **Geen** native APNs/FCM (`docs/CAPACITOR.md`) |
| Buddy / AI | Ja | `/buddy`, Anthropic of rule-based | Context uit cyclus/check-in |
| Overgang-educatie | Ja | `/cyclus/overgang`, `life-stage-knowledge.ts`, kennisartikelen | Soft age-CTA; **geen** aparte life-stage modus |
| Medicatie / HT / AC | Ja | `/medicatie`, migratie HT | CRUD, logs, reminders |
| Voeding / recepten / weekplan | Ja | `/voeding`, `/deze-week` | Fase-bewust, dislikes |
| Training | Ja | `/training` | Favorieten, sessies |
| Mentale rust | Ja | `/mentale-rust` | Opt-in module |
| Kenniscentrum | Ja | `/kennis` | ~10 artikelen o.a. overgang/HT |
| Dagboek | Ja | `/dagboek` | Privé tekst |
| Onboarding / personalisatie | Ja | `/onboarding`, profiel | Rijk; modules aan/uit |
| Privacy / account verwijderen | Ja | PrivacySection | Cascade delete |
| Data-export JSON/CSV | **Nee** | — | Niet vastgesteld |
| Apple Health / Health Connect | **Nee** | Geen HealthKit in package | |
| Wearables / Watch / widgets | **Nee** | Capacitor: App/Haptics/Keyboard/Splash/StatusBar | |
| Monetisatie | **Nee** | — | Alles gratis in product |

### A2. Symptomenlijst (actueel)

**Fysiek/algemeen:** Opvliegers, Nachtelijk zweten, Hoofdpijn, Nekpijn, Rugpijn, Buikpijn, Krampen, Gevoelige borsten, Misselijkheid, Vermoeidheid, Bloating, Slecht slapen, Stemmingswisselingen, Emotioneel, Onrustig gevoel, Brain fog, Cravings, Anders, Geen klachten.

**Mentaal (opt-in):** Gespannen, Angstig, Overprikkeld, Prikkelbaar, Somber, Eenzaam, Piekerig.

**Ontbrekend t.o.v. typische overgangslijsten:** libido, vaginale droogte/irritatie, gewrichtspijn (als dagelijks symptoom; wel als gezondheidsconditie), eetlust, huid, haar, urineweg, episode-severity voor opvliegers.

### A3. Wat Cyclus al beter of slimmer doet dan klassieke trackers

1. **Ownership van de “wat doe ik ermee?”-loop** — concurrenten tracken; Cyclus koppelt check-in aan voeding, beweging, mentale oefening en weekplan.
2. **HT/medicatie als first-class module** — zeldzaam bij Flo/Clue/PERIOD. in dezelfde diepte.
3. **Nederlandse, kalme tone + Buddy** zonder community/ads-druk.
4. **Arts-samenvatting bestaat al** (printbaar) — concurrenten verkopen dit vaak als Premium/Plus.
5. **Geen paywall** op inzichten die bij Flo/Clue achter abonnement zitten.
6. **Module-gating** (slaap, mentaal, voeding, beweging) vermindert overwhelm — past bij overgangsgebruikers.

---

## B. Flo vs Clue vs Apple Gezondheid vs PERIOD.

### B1. Flo (Flo Health)

**Positionering:** grootste women’s-health platform; van menstruatie tot menopauze; zwaar content + community + AI.

| Domein | Wat biedt Flo? | Gratis / Premium | Beperkingen |
|---|---|---|---|
| Cyclus | Period/ovulatie-voorspellingen, kalender, geschiedenis | Basis gratis | Diepere trends Premium |
| Symptomen | Uitgebreide logging; patterns & predictions | Tracking gratis; patterns Premium | |
| Perimenopauze | Flo for Perimenopause: Symptom Checker, Perimenopause Score (16 items, 0–100), Menopause Timeline (STRAW+10-achtig), Relief Options | **Premium** (suite vanaf mei 2026) | Educatief, geen diagnose |
| AI | Health Assistant (chat) | Premium | |
| Artsrapport | Personalized doctor’s report | Premium | |
| Apple Health | HealthKit read/write cyclusdata (App Store) | — | iOS |
| Privacy | Anonymous Mode (gratis; OHTTP); historie van FTC/class-action | — | Anon-modus beperkt o.a. export/support |
| Ads | Ja op free tier (gebruikersklachten) | Premium ad-free | |
| Prijs (NL App Store) | Meerdere IAP’s; jaarlijks vaak ~€39,99 | Regio/promotie variabel | Exacte actuele SKU in Store checken |
| Wetenschap | Medische board; publicaties; Score met advisory board | Marketing + deels peer-reviewed claims | Symptom Checker **niet in UK/EU** |

**Leerpunt voor Cyclus:** gestructureerde *periodieke vragenlijst + score over tijd* en *life-stage timeline* zijn sterker dan losse educatiepagina’s. Community (Secret Chats) is marketingrijk maar privacy-/moderatiezwaar — waarschijnlijk niet nodig voor Cyclus.

### B2. Clue (Biowink)

**Positionering:** science-first, EU/Duits privacyverhaal, CE Class I medical device; **modes** die UI/algoritme aanpassen.

| Domein | Wat biedt Clue? | Gratis / Plus | Beperkingen |
|---|---|---|---|
| Modes | Period Tracking; Tracking (geen bloeding); Perimenopause; (+ Conceive/Pregnancy buiten scope) | Perimenopause = **Plus**; Tracking free+Plus | Mode-switch bewaart geschiedenis |
| Perimenopauze | Aangepaste Cycle View bij veranderende lengte; 14+ peri-categorieën (hot flashes, night sweats, gut fog, HRT, vaginal dryness, …); custom tags | Plus | |
| Post-menstruatie | Clue Tracking: cycli starten op momenten die voor jou tellen (bijv. HT-dosis) | Free basis | |
| Analyse | Analysis tab, cycle comparison, feelings/pain/sleep analysis | Plus dieper | |
| Wearables | Apple Health (period/flow sync **uit** Clue; geen AH→Clue import); Oura temperatuur | iOS / Oura | |
| Export | JSON data download (GDPR); CSV elders vermeld | Beschikbaar in app | |
| Privacy | Geen ad-network sharing claim; GDPR DE/EU | — | Sterker vertrouwensmerk dan Flo |
| Prijs | Clue Plus ~$9,99/m of ~$39,99/j (US); UK ~£24,99/j elders gerapporteerd | Regio-afhankelijk | |

**Leerpunt voor Cyclus:** **life-stage modes** (zeker “geen menstruatie meer / HT”) zijn strategisch belangrijker dan nóg meer symptoomchips. Cycle View die *verandering* uitlegt i.p.v. “je bent X dagen te laat” is exact het peri-probleem.

### B3. Apple Gezondheid — twee lagen

#### Als zelfstandige Cycle Tracking-app

- Loggen: menstruatie, spotting, symptomen, BBT, factoren (zwangerschap/lactatie/anticonceptie).
- Voorspellingen & notificaties: periode, (optioneel) vruchtbaar window.
- **Cycle deviation detection** (6 maanden historie): onregelmatig, infrequent, verlengd, persistent spotting → educatie + **PDF 12 maanden** voor arts.
- **Menopause Stages** + symptom logging; gebruikers **40+** kunnen peri-suggestieve deviation-notificaties krijgen (iOS/watchOS 27; **niet alle regio’s**).
- Watch Series 8+/Ultra: overnight **wrist temperature** → retrospectieve ovulatieschatting; HR kan voorspellingen verbeteren (regio-afhankelijk).
- Privacy: met 2FA + passcode end-to-end encrypted iCloud health data — Apple kan data niet lezen.
- Geen AI-coach, geen lifestyle-aanbevelingen, geen voeding/training, geen community.

#### Als centraal gezondheidsplatform

- Derde partijen (Flo, Clue, …) schrijven/lezen subsets (vaak period/flow).
- Aggregeert vitals: slaap, HR, HRV, temperatuur, activiteit van Watch en apps.
- Export: volledige Health-export (XML) + cycle PDF.
- **Gap die niemand goed dicht:** cyclusapp + Apple vitals + lifestyle in één *geïnterpreteerd* verhaal. Apple aggregeert; Flo/Clue/PERIOD. interpreteren beperkt of betaald; Cyclus heeft lifestyle maar **nul** HealthKit.

### B4. PERIOD. (Nederland / Amsterdam)

| Domein | Bevinding | Bron |
|---|---|---|
| Markt | Privacy-first NL-app; EU-servers; geen ads/trackers als USP | myperiod.app, App Store |
| Free | Tracking, voorspellingen, daily insights, AI (beperkt) | Site / Store |
| Plus | €3,49/m of €34,99/j: unlimited AI, PDF artsrapport, heatmaps, anomalies, custom symptoms, weight, partner, calendar sync, app lock | myperiod.app/plus-en |
| Apple Health | **Geen** sync (eigen blog vs Apple) | myperiod.app blog |
| Overgang | **Op roadmap**, bewust nog niet als medische peri-modus | HowAboutMom-interview |
| Onderscheid | Kalme UX, geen dark patterns, “basics altijd gratis”, B2B “at work” | Site |

**Leerpunt:** PERIOD. concurreert met Cyclus op **NL + privacy + AI-buddy**. Cyclus wint op lifestyle-integratie en overgangscontent; PERIOD. wint op klassieke tracker-diepte (voorspellingen, heatmaps, custom symptoms, PDF, calendar). Overgang is voor *beide* nog een open race.

### B5. Flo vs Clue (uitgebreid, zonder TTC)

| Onderwerp | Flo | Clue | Relevantie voor Cyclus |
|---|---|---|---|
| Tracking-breedte | Zeer breed, content-rijk | Breed + custom tags; mode-specifieke categorieën | Cyclus smaller maar gerichter |
| Cyclusanalyse | Trends/reports Premium | Analysis tab Plus; cycle comparison | Cyclus: tekstinzichten, geen visuals |
| Voorspellingen | Sterk in free | Free beperkt verder; Plus langer vooruit | Cyclus bewust “schatting”, geen next-period UI |
| Perimenopauze | Score + Timeline + Relief (Premium, 2026) | Dedicated mode + Cycle View adaptatie (Plus) | Cyclus: educatie, geen mode/score |
| Menopauze / geen bloeding | Content/tools in peri-suite | **Clue Tracking** mode | Cyclus: `has_cycle=false` beperkt; geen HT-cyclusmodus |
| Opvliegers/nachtzweten | Ja + score-impact | Dedicated peri tags | Cyclus: checkbox only |
| Slaap/stemming/energie | Ja | Ja + Plus analysis | Cyclus: check-in + slaapmodule sterker lifestyle |
| AI | Health Assistant Premium | Meer content/analyse dan conversational AI | Cyclus Buddy ≈ midden |
| Apple Health | Ja | Period/flow out; geen import | Cyclus: geen |
| Wearables | Beperkt vs Watch-ecosysteem | Oura | Cyclus: geen |
| Privacy | Verbeterd na schandalen; Anonymous Mode | Sterker EU-merk, CE device | Cyclus: simpel + delete; geen export |
| Ads | Free | Beperkter | Cyclus: geen |
| Export | Doctor report Premium; anon beperkt | JSON download | Cyclus: print-only |
| Wetenschap | Med board + studies | CE medical device, science team | Cyclus: lifestyle, geen medical device |

---

## C. Feature gap-analyse (concurrent → Cyclus)

Aanbevelingen uitsluitend: **Nu onderzoeken** | **Interessant** | **Later overwegen** | **Waarschijnlijk niet nodig**.

| Functie | App | Hebben wij dit? | Wat doet het precies? | Waarde gebruiker | Moeilijkheid | Aanbeveling |
|---|---|---|---|---|---|---|
| Life-stage / peri-modus | Clue, Flo, Apple | Nee (alleen soft CTA + overgangpagina) | UI/algoritme/content verschuift mee met levensfase | Hoog — kernstrategie | Medium | **Nu onderzoeken** |
| Mode “geen menstruatie / post-meno / HT-cyclus” | Clue Tracking | Deels (`has_cycle`) | Tracking zonder period-centrisme | Hoog voor fase 4 | Medium | **Nu onderzoeken** |
| Perimenopause symptom score (periodieke vragenlijst) | Flo Score | Nee | Maandelijkse burden-score 0–100 | Hoog voor artsgesprek + voortgang | Laag–medium | **Nu onderzoeken** |
| Menopause / reproductive timeline (STRAW+10-achtig) | Flo Timeline | Nee | Educatieve self-assessment fase | Medium–hoog | Laag | **Interessant** |
| Cycle deviation alerts | Apple, Clue peri view | Deels (lengtetrend-tekst) | Proactieve melding bij patroonafwijking | Hoog | Medium | **Nu onderzoeken** |
| Next-period prediction UI | Flo, Clue, Apple, PERIOD. | Nee (bewust schatting) | “Verwachte start rond …” | Medium (lager bij irregulier) | Laag | **Interessant** (met onzekerheid) |
| Visuele grafieken / heatmaps | PERIOD. Plus, Clue Analysis, Flo trends | Nee | Zien i.p.v. lezen | Hoog | Medium | **Nu onderzoeken** |
| Cycle-to-cycle vergelijking | Clue Plus | Nee | Side-by-side cycli | Hoog peri | Medium | **Interessant** |
| Custom symptomen / tags | Clue Plus, PERIOD. Plus | Nee (“Anders” only) | Persoonlijke klachten | Medium–hoog | Laag | **Nu onderzoeken** |
| Severity / frequentie symptomen | Flo Score, Apple logging depth | Nee (binary chips) | Onderscheid milde vs invaliderende dagen | Hoog overgang | Laag–medium | **Nu onderzoeken** |
| Libido tracking | Flo, Clue, PERIOD. | Nee | Intimiteit/libido-patronen | Medium | Laag | **Interessant** |
| Vaginale klachten | Clue peri | Nee | Droogte/irritatie | Hoog peri | Laag | **Nu onderzoeken** |
| Gewichtslog over tijd | PERIOD. Plus | Alleen onboarding | Trend met HT/cyclus | Medium | Laag | **Interessant** |
| Afscheiding / BBT | PERIOD. Plus, Apple, Clue | Nee | Vaak TTC-gericht | Laag voor onze strategie | Medium | **Waarschijnlijk niet nodig** |
| PDF artsrapport (echte PDF) | Flo Premium, PERIOD. Plus, Apple | Print-only | Deelbaar bestand | Hoog | Laag–medium | **Nu onderzoeken** |
| GDPR data-export JSON/CSV | Clue, PERIOD., Apple XML | Nee | Vertrouwen + portabiliteit | Hoog (NL/EU) | Laag | **Nu onderzoeken** |
| Apple Health sync | Flo, Clue | Nee | Minder dubbel loggen | Hoog iOS | Hoog (native) | **Interessant** |
| Watch / widgets | Apple, Flo Watch | Nee | Frictieloos loggen | Medium | Hoog | **Later overwegen** |
| Oura / wearables | Clue | Nee | Temp/slaap objectief | Medium | Hoog | **Later overwegen** |
| Anonymous Mode / app lock | Flo, PERIOD. Plus | Nee | Extra privacy UX | Medium | Medium | **Interessant** |
| Partner sharing | Flo, Clue Connect, PERIOD. | Nee | Relatie-context | Laag voor kern | Medium | **Waarschijnlijk niet nodig** |
| Community / Secret Chats | Flo | Nee | Lotgenoten | Medium; risico’s | Hoog | **Waarschijnlijk niet nodig** |
| Relief options guide (HT vs non-HT educatie) | Flo | Deels (kennisartikelen) | Eenduidige behandelopties-exploratie | Hoog | Medium (content+medische review) | **Interessant** |
| Calendar sync (Apple/Google) | PERIOD. Plus | Nee | Menstruatie in agenda | Laag–medium | Laag | **Later overwegen** |
| Ads-free als differentiator | vs Flo free | Al ads-free | — | — | — | Behouden |
| Conversational AI met 30d context | PERIOD., Flo | Buddy (beperkter context) | Vragen stellen | Medium–hoog | Medium | **Interessant** (verbeter Buddy) |
| Combined vitals×cycle insights | Niemand goed | Nee | “Slechte slaap + meer opvliegers deze week” | Zeer hoog | Hoog | **Nu onderzoeken** als productkans |
| Symptom Checker PCOS/endo | Flo Premium | Nee | Screening | Medium; **niet in EU** bij Flo | Hoog (regulatory) | **Waarschijnlijk niet nodig** (regulatory) |

---

## D. Overgang / perimenopauze — lifecycle

### Fase 1 — Regelmatige cyclus
**Nodig:** snelle menstruatie-log, fase-uitleg, check-in, lichte voorspelling met onzekerheid, lifestyle-tips.  
**Cyclus nu:** sterk.  
**Gap:** visuele geschiedenis; optionele next-period estimate.

### Fase 2 — Veranderende cyclus
**Nodig:** “je cyclus verschuift” i.p.v. “te laat”; lengte-/flowvariatie; alerts bij nieuwe patronen; geen shaming.  
**Cyclus nu:** `computeCycleLengthTrend` + irregular disclaimer.  
**Gap:** proactieve deviation alerts; cycle comparison; prediction confidence.

### Fase 3 — Perimenopauze
**Nodig:** uitgebreide symptomen + severity; maandelijkse burden-score; hot flush episode logging; slaap↔nachtzweten; HT-tracking; artsrapport; educatie/relief; dashboard dat **symptomen** centraal zet, niet alleen menstruatie.  
**Cyclus nu:** symptomen + overgangpagina + HT + arts-samenvatting + slaap — goede basis.  
**Gap:** mode, score, severity, vaginale/libido, grafieken, langetermijn dashboard.

### Fase 4 — Menopauze (12+ maanden geen menstruatie)
**Nodig:** app blijft nuttig zonder period-kalender; focus op symptomen, slaap, bot/spier/energie, HT, mentale rust, jaaroverzichten.  
**Cyclus nu:** modules kunnen aanblijven; cyclus-UI wordt minder relevant.  
**Gap:** expliciete “post-menstruatie”-ervaring zoals Clue Tracking; yearly health review.

**Strategische eis:** voorkom dat productwaarde daalt zodra voorspelbare menstruatie verdwijnt. Life-stage mode + symptoom-eerste home is P0-onderzoek.

---

## E. Quick wins (10–15)

Relatief eenvoudig, lage privacy-risico’s, duidelijke UX-winst:

1. **Custom symptomen** (user-defined tags) — uitbreiden check-in + constants/DB array.
2. **Severity 1–3** op bestaande symptomen (zeker opvliegers, pijn, brain fog).
3. **Vaginale klachten + libido** toevoegen aan `SYMPTOM_OPTIONS` (met privacy-copy).
4. **Next-period estimate met onzekerheidsband** op `/cyclus` (hergebruik history/estimate).
5. **Echte PDF** voor arts-samenvatting (client PDF of print CSS + download).
6. **JSON/CSV export** in PrivacySection (GDPR portability).
7. **Maandelijkse “klachtenlast”-vragenlijst** (lichtgewicht Flo Score-achtig, niet gevalideerd claimen).
8. **Simpele sparkline/bar charts** (cycluslengte, top-symptomen, energie) — lichte chart lib.
9. **Favoriete symptomen pin-nen** (snellere check-in).
10. **“Wat veranderde deze maand?”** kaart — diff t.o.v. vorige 28 dagen uit bestaande insights.
11. **Life-stage toggle** in profiel: regelmatig / veranderend / peri / post — stuurt copy + defaults (nog zonder zwaar algoritme).
12. **Episode-log opvliegers** (aantal vandaag) naast checkbox.
13. **Reminders: “peri check-in”** type voor wekelijkse diepere check.
14. **Onboarding-vraag life-stage** koppelen aan `/cyclus/overgang` en symptoomdefaults.
15. **Doctor summary: 6/12 maanden window** + “neem mee naar huisarts”-checklist.

---

## F. Strategische features (groter)

| Feature | Gebruikerswaarde | Complexiteit | Privacy-impact | Notitie |
|---|---|---|---|---|
| Overgangsdashboard (symptoom-eerste home) | Zeer hoog | Medium–hoog | Laag | Kernpositionering |
| Life-stage modes (Clue-achtig) | Zeer hoog | Hoog | Laag | Inclusief post-meno/HT |
| Gevalideerde of medisch gereviewde peri-score | Hoog | Hoog (content/clinical) | Medium | Niet “diagnose” claimen |
| Visuele langetermijntrends (1–5 jaar) | Hoog | Medium | Laag | |
| Apple Health / Health Connect bidirectioneel | Hoog | Hoog (Capacitor native) | Medium–hoog | iOS eerst |
| Vitals×cyclus×symptoom correlaties | Zeer hoog | Hoog | Hoog | Unieke kans |
| Geavanceerde patroonherkenning + Buddy-proactief | Hoog | Hoog | Medium | |
| Apple Watch logging / complications | Medium | Zeer hoog | Medium | Later |
| Wearables (Oura e.d.) | Medium | Hoog | Hoog | Later |
| Relief-options decision aid (educatief) | Hoog | Medium (medische review) | Laag | Geen voorschriften |

---

## G. Productkansen (voorbij kopiëren)

Problemen die Flo/Clue/Apple/PERIOD. **niet goed** oplossen — en waar Cyclus kan winnen:

1. **Fragmentatie:** Apple = vitals, Flo/Clue = cyclus, aparte apps = slaap/fitness. Cyclus kan de **enige NL coach** worden die check-in + HT + slaap + voeding + beweging + artsrapport samenhangend uitlegt — *mits* later Health-data bijkomt.
2. **“Te laat”-trauma bij peri:** voorspellingen die falen bij onregelmatige cycli ondermijnen vertrouwen. Cyclus’ schattingsframing is een voordeel — productiseer **onzekerheid en verandering** als feature, niet als bug.
3. **Na de menstruatie houdt de app op:** Clue Tracking is zeldzaam; Flo blijft content-zwaar. Cyclus kan **HT- en symptoomritmes** centraal zetten zonder period-kalender.
4. **Lifestyle zonder dark patterns:** PERIOD. en Cyclus delen privacy-ethiek; Cyclus heeft diepere dagelijkse hulpacties. Combinatie **privacy + coach + overgang** is weinig bezet in NL.
5. **Artsgesprek in 3 minuten:** niet alleen PDF, maar “5 zinnen + top-3 klachten + wat erger/beter werd + medicatie” — actionable clinical brief.
6. **Werkgever/NL zorgpad (voorzichtig):** PERIOD. at work bestaat; Cyclus zou later B2B kunnen, maar eerst consumer-kwaliteit.
7. **Marketing vs waarde:** Flo community & Symptom Checker (niet EU) zijn deels theater. Clue CE-mark en Apple deviation alerts zijn reëler. Kopieer geen theater; wel **mode + score + deviation + export**.

---

## H. Concrete codebase-aanbevelingen

| Functie | Logische plek |
|---|---|
| Life-stage enum + onboarding | `cycle_profiles` migratie; `onboarding-wizard.tsx`; `REGULARITY_OPTIONS` uitbreiden of nieuwe `LIFE_STAGE_OPTIONS` in `constants.ts` |
| Symptomen uitbreiden / custom / severity | `constants.ts` `SYMPTOM_OPTIONS`; `daily_checkins.symptoms` → JSON met `{id, severity?}` (migratie); `checkin-form.tsx`; `insights.ts` / `patterns.ts` |
| Peri-score vragenlijst | Nieuw `src/lib/cycle/peri-score.ts` + tabel `peri_assessments`; UI onder `/cyclus/overgang` of `/cyclus/score` |
| Deviation alerts | Uitbreiden `patterns.ts`; surface op `/cyclus` + optionele reminder/push in `send-reminders` |
| Next-period estimate | `estimate.ts` + UI-kaart op `cyclus/page.tsx` met confidence |
| Charts | Nieuw `components/cycle/charts/*`; data uit `history.ts` / check-ins; lichte lib (bijv. recharts) |
| PDF artsrapport | `doctor-summary-view.tsx` + `@react-pdf/renderer` of server route `api/doctor-summary/pdf` |
| Data-export | `privacy-section.tsx` + server action die cycle_logs, checkins, sleep, meds als JSON/CSV bundled |
| Overgangsdashboard | Nieuwe route of mode op `/cyclus` wanneer life-stage ∈ {peri, meno}; hergebruik `PersonalInsights`, sleep insights, medicatie |
| Post-cycle mode | Wanneer `has_cycle=false` of life-stage=meno: verberg fase-kalender; toon symptoom/HT-home (nav `nav-items.ts`) |
| Apple Health | Capacitor plugin + `docs/CAPACITOR.md`; write period/flow; later read sleep/HR; feature-flag iOS |
| Buddy verbetering | `lib/buddy/context.ts` uitbreiden met peri-score, deviations, life-stage |
| Favoriete symptomen | `profiles.preferred_symptoms` + check-in reorder |

**Architectuurprincipes:**
- Blijf **niet-diagnostisch** in copy (zoals Apple/Flo expliciet doen).
- Geen medical-device claims zonder traject.
- Privacy: export + delete eerst; HealthKit pas met minimale scopes.
- Hergebruik bestaande insight-pipeline i.p.v. parallel AI-black-box.

---

## Prioritering nieuwe features

| Nieuwe functie | Geïnspireerd door | Probleem | Gebruikerswaarde | Tech complexiteit | Privacy-impact | Prioriteit |
|---|---|---|---|---|---|---|
| Life-stage model + UI-switch | Clue modes | App voelt als period-only | Zeer hoog | Medium | Laag | **P0** |
| Severity + peri-symptomen (vaginaal, libido, flush count) | Clue peri / Flo | Onduidelijke last | Hoog | Laag | Laag–medium | **P0** |
| Maandelijkse klachtenlast-score | Flo Peri Score | Geen voortgangsmaat | Hoog | Laag–medium | Laag | **P0** |
| Cycle deviation / “je cyclus verandert” alerts | Apple / Clue | Verandering onzichtbaar | Hoog | Medium | Laag | **P0** |
| GDPR export JSON/CSV | Clue / PERIOD. | Geen portabiliteit | Hoog | Laag | Positief | **P0** |
| PDF artsrapport | Flo / PERIOD. / Apple | Print is zwak | Hoog | Laag–medium | Laag | **P1** |
| Visuele trends + heatmap | PERIOD. / Clue | Inzichten te tekstueel | Hoog | Medium | Laag | **P1** |
| Custom symptomen | Clue / PERIOD. | “Anders” is te mager | Medium–hoog | Laag | Laag | **P1** |
| Next-period estimate + confidence | Allen | Ontbrekende verwachting | Medium | Laag | Laag | **P1** |
| Post-meno / HT tracking mode | Clue Tracking | App stopt na laatste menstruatie | Hoog | Medium | Laag | **P1** |
| Overgangsdashboard | — (kans) | Geen single pane of glass | Zeer hoog | Medium–hoog | Laag | **P1** |
| Relief-options educatie | Flo | Versnipperde kennis | Hoog | Medium (content) | Laag | **P2** |
| Apple Health sync | Flo / Clue / Apple | Dubbel werk | Hoog | Hoog | Medium | **P2** |
| Buddy proactieve peri-inzichten | Flo / PERIOD. | AI te reactief | Medium–hoog | Medium | Medium | **P2** |
| Combined Health vitals insights | Niemand | Fragmentatie | Zeer hoog | Zeer hoog | Hoog | **P2** |
| App lock / anoniemer account | Flo / PERIOD. | Shared device angst | Medium | Medium | Positief | **P2** |
| Watch / widgets | Apple / Flo | Frictie | Medium | Zeer hoog | Medium | **P3** |
| Oura e.d. | Clue | Niche | Medium | Hoog | Hoog | **P3** |
| Partner sharing / community | Flo / Clue | Niet kern | Laag–medium | Hoog | Hoog | **P3** |
| BBT / mucus (non-TTC) | PERIOD. / Apple | Weinig waarde voor strategie | Laag | Medium | Medium | **P3** |

---

## Kritische samenvatting voor de roadmap

**Niet najagen:** Flo-community, partner-mode, EU-verboden symptom checkers, TTC-sensors, ad-supported free tiers.

**Wél najagen (volgorde):**
1. Life-stage + post-cycle bruikbaarheid  
2. Symptomen dieper (severity, peri-specifiek, custom) + maandscore  
3. Veranderingsinzichten + visuals + export/PDF  
4. Daarna HealthKit en vitals-correlaties als strategische moat  

**Cyclus’ eerlijke positie vandaag:** sterker dan concurrenten op **coachende lifestyle-integratie, HT en Nederlandse toon**; zwakker op **klassieke tracker-diepte, life-stage modes, visuals, portabiliteit en device-ecosysteem**. De overgang is precies het moment om die zwaktes te dichten zonder de coach-identiteit op te geven.

---

*Document gegenereerd als productonderzoek naast `docs/PRODUCT_VISION.md`. Bij implementatie: features toetsen aan de checklist in PRODUCT_VISION.*
