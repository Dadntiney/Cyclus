# Cyclus — centraal doel en positionering

Dit document is het uitgangspunt voor alle ontwikkeling aan Cyclus: nieuwe
functionaliteiten, schermen, teksten en UX-keuzes worden hieraan getoetst
(zie de checklist onderaan). Het is bewust geschreven als brondocument, niet
als changelog — pas het aan wanneer de positionering zelf verandert, niet
per feature.

## Voor wie

Vrouwen van ongeveer 30 jaar en ouder, met extra aandacht voor beginnende
hormonale veranderingen en overgangsklachten. Niet iedere gebruiker zit al
daadwerkelijk in de overgang — het gaat ook om vrouwen die merken:

- "Mijn lichaam voelt anders dan vroeger."
- "Ik begrijp mijn cyclus niet meer zo goed."
- "Waarom ben ik de ene periode zo energiek en de andere periode totaal niet?"
- "Waarom slaap ik slechter?"
- "Waarom ben ik sneller geïrriteerd of emotioneel?"
- "Waarom verandert mijn energie, eetlust of lichaam?"
- "Zijn deze veranderingen normaal?"
- "Wat kan ik zelf doen om mij beter te voelen?"

De app is dus niet in de eerste plaats een menstruatie-tracker. Het
zwaartepunt ligt op **begrijpen, herkennen en ondersteunen**.

## Kernmissie

> Vrouwen helpen hun cyclus en veranderende lichaam beter te begrijpen,
> zodat ze beter kunnen herkennen wat er gebeurt, waarom ze zich op bepaalde
> momenten anders kunnen voelen, en welke keuzes kunnen helpen om zich zo
> goed mogelijk te voelen.

Niet alleen: *"Vandaag is cyclusdag 14."*
Maar vooral: *"Dit gebeurt er waarschijnlijk in je lichaam. Dit zou kunnen
verklaren waarom je je vandaag anders voelt. En dit kun je vandaag eventueel
doen om jezelf te ondersteunen."*

De app is een **cycluscoach + kennisplatform + persoonlijke tracker +
vriendelijke buddy** — zonder ooit belerend te worden.

## De vier pijlers

### 1. Begrijpen
Op een eenvoudige, menselijke manier uitleggen: wat er per cyclusfase
gebeurt, welke hormonale veranderingen een rol kunnen spelen, welke
lichamelijke en mentale/emotionele veranderingen mogelijk zijn, waarom
bepaalde klachten kunnen ontstaan, en hoe de cyclus kan veranderen naarmate
iemand ouder wordt. Doel: kennis en herkenning — niet medicaliseren.

### 2. Herkennen
Persoonlijke patronen inzichtelijk maken over o.a. energie, stemming,
slaap, concentratie, stress, eetlust, lichamelijke klachten, bloedverlies,
beweging, cyclusduur en andere symptomen — zonder te doen alsof de app
diagnoses stelt. Concreet en op de persoon toegespitst is waardevoller dan
generiek: *"Je hebt de afgelopen drie cycli rond deze periode vaker
vermoeidheid geregistreerd"* zegt meer dan een generieke voorspelling.

### 3. Ondersteunen
Praktische ondersteuning, altijd optioneel en nooit als verplichte lijst:
- **Bewegen** — passende vormen, oefeningen, uitleg waarom, instructievideo's.
- **Voeding** — praktisch, recepten, rekening houdend met voorkeuren; expliciet optioneel.
- **Rust & herstel** — slaap, ontspanning, stress, rustmomenten.
- **Dagelijkse tips** — kleine suggesties, fase-passend, positieve buddy-boodschappen.

De gebruiker mag nooit het gevoel krijgen dat ze iets "moet" afwerken. De
app ondersteunt; de gebruiker bepaalt.

### 4. Balans
Geen "perfecte cyclus" nastreven, maar inzicht, balans en grip. De app
helpt ontdekken: wat goed werkt, wanneer het lichaam meer rust vraagt,
wanneer bewegen prettig kan zijn, welke patronen terugkomen, welke
gewoontes mogelijk helpen, en wanneer iets verandert ten opzichte van
eerdere cycli. Iedere vrouw is anders — de app wordt persoonlijker naarmate
er meer gegevens zijn.

## Toon

Warm, deskundig, positief, geruststellend, menselijk, duidelijk, modern.
Niet zweverig, niet betuttelend. Mag af en toe luchtig: *"Wist je dat...?"*,
*"Kleine tip voor vandaag"*, *"Even onthouden 💛"*, *"Dit kan verklaren
waarom..."*

## Contentregels — geen medische claims

De app is bedoeld voor ondersteuning en educatie, niet als vervanging van
een arts, en stelt geen diagnoses. Gebruik hedgende taal: *"kan"*,
*"sommige vrouwen ervaren"*, *"dit kan samenhangen met"*, *"mogelijk"*,
*"veel vrouwen merken"*. Vermijd stellige uitspraken alsof iedere vrouw
dezelfde symptomen of hormonale veranderingen ervaart. Bij klachten die
ernstig, nieuw of zorgwekkend zijn: passend aangeven dat contact met een
arts of andere zorgprofessional verstandig kan zijn.

## De ervaring die we willen creëren

Een vrouw opent de app en denkt uiteindelijk:

- "Ik begrijp mijn lichaam beter."
- "Ik snap beter waarom ik me soms zo voel."
- "Ik zie patronen die ik eerder niet zag."
- "Ik weet beter wat ik zelf kan doen."
- "Ik hoef niet iedere dag hetzelfde te kunnen of te voelen."

En vooral: **"Mijn lichaam werkt niet tegen mij. Ik begin het beter te
begrijpen."**

## Toetsingsvragen voor iedere nieuwe feature

Bij elke nieuwe functionaliteit, elk scherm, elke tekst of flow:

1. Helpt dit de vrouw haar lichaam beter te begrijpen?
2. Helpt dit haar patronen herkennen?
3. Geeft dit haar praktische ondersteuning?
4. Kan dit bijdragen aan meer balans en welzijn?
5. Geeft dit haar meer regie zonder haar het gevoel te geven dat ze iets moet?
6. Past dit bij vrouwen van 30+ en de lichamelijke veranderingen die in deze levensfase kunnen spelen?
7. Is de informatie begrijpelijk, betrouwbaar en niet onnodig medisch?
8. Voelt de app persoonlijk, warm en ondersteunend?

Grotendeels "ja" op deze vragen → de functionaliteit past bij de kern van
de app.

## Kerngedachte

> Niet alleen bijhouden wat er gebeurt, maar begrijpen waarom het gebeurt
> en ontdekken wat jou kan helpen om je zo goed mogelijk te voelen.

## Waar dit vandaag al terugkomt in de codebase

Ter oriëntatie — niet uitputtend, en dit moet meegroeien met de app:

- **Begrijpen**: `src/lib/cycle/phase-knowledge.ts` (hormonale/lichamelijke
  uitleg per fase) + `src/lib/cycle/cyclusdag.ts` (compositie tot de
  Cyclusdag-pagina, `/cyclus/vandaag`).
- **Herkennen**: `src/lib/cycle/history.ts` (`computeSymptomFrequency`,
  cyclusgeschiedenis) en `src/lib/cycle/patterns.ts`
  (`computePhaseSymptomInsights` — vergelijkt symptomen per cyclusfase over
  meerdere afgeronde cycli, bijv. "vaker vermoeid tijdens de luteale fase,
  je laatste 3 cycli") op de Cyclus-pagina en in de personalisatie op
  `/cyclus/vandaag`.
- **Ondersteunen**: `src/lib/cycle/phase-content.ts` (voeding/beweging per
  fase), `src/lib/recommendations/*` (dag- en weekplanning), optioneel te
  maken via `profiles.movement_enabled` / `nutrition_enabled`, en de
  Buddy-chat (`src/lib/buddy/*`).
- **Balans / toon**: `src/lib/data/buddy-quotes.ts` (dagelijkse
  buddy-boodschappen), hedgende formuleringen door alle content-modules
  heen, en de expliciete "geen medisch advies"-notes op cyclus-gerelateerde
  pagina's.
- **Levensfase (30+/overgang)**: `src/lib/cycle/life-stage-knowledge.ts` +
  `/cyclus/overgang` — hoe de cyclus kan veranderen met leeftijd, wat
  perimenopauze inhoudt, veelvoorkomende signalen (waaronder opvliegers en
  nachtelijk zweten, die als check-in-symptoom al bestonden maar nergens
  werden uitgelegd), en wanneer contact met een zorgverlener zinvol kan
  zijn. `cycle_profiles.perimenopause_information` is nu ook zichtbaar en
  bewerkbaar in Profiel, niet meer alleen write-only voor de Buddy.

De Buddy-chat (`src/lib/buddy/context.ts`) krijgt het sterkste patroon voor
de huidige fase ook mee in haar context, met de instructie dit alleen
subtiel te noemen als het gesprek daar natuurlijk toe leidt.

Bekende gaps ten opzichte van deze visie (voor vervolgwerk, niet nu
opgepakt): de patroonherkenning kijkt per klacht per fase, maar nog niet
naar samenhang tussen klachten (bijv. "als X, dan vaak ook Y") of naar
cyclusduur-trends zelf (wordt je cyclus over meerdere maanden onregelmatiger
of stabieler?).
