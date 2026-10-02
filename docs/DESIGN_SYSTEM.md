# GoFiev designsysteem — "Ritme"

Dit is het systeem **zoals het gebouwd is**: tokens in `src/app/globals.css`,
primitives in `src/components/ui/`, helpers in `src/lib/ui/` en
`src/lib/hooks/`. Paginastromen lezen dit document en migreren hun eigen
bestanden ernaar. Achtergrond en keuzes: `ontwerpvisie.md` §5–6 en
`besluiten.md` (de besluiten winnen).

**Kort:** Ritme blijft (porselein, eucalyptus, rozenhout, fasekleuren,
Fraunces + Plus Jakarta Sans). Wat nieuw is, is de *structuur*: drie radii,
vijf koprollen, één focusring, drie duren en drie curves, en één component
per soort keuze.

## 1. Vuistregels

1. **Eén getint vlak per scherm**: de fasestatus (`<Card tone="phase">`).
   Uitleg, tips, quotes en lege staten staan plat op de pagina.
2. **Kaarten zijn voor dingen waar je iets mee doet** (recept, training,
   instellingengroep). Geen kaart-in-kaart.
3. **Eén primaire knop per regio.** Tweede actie = `tonal` of `secondary`,
   derde = tekstactie.
4. **Eén manier per soort keuze** (zie §10.3).
5. **Geen eigen focusstijl**: nooit `focus-visible:ring-*`, `outline-none`,
   `focus:outline-none` of `focus-visible:outline-none`. De globale ring doet
   het werk.
6. **Geen losse waarden**: geen `rounded-[…]`, `text-[…]`, `rounded-2xl/3xl/xl/lg`,
   eigen `strokeWidth` of `transition-all`.
7. **Kleur is nooit de enige drager** van betekenis (vinkje, vorm, tekst).

## 2. Kleur — rollen

Ritme-namen zijn canoniek. Gebruik ze als Tailwind-kleur (`bg-…`, `text-…`,
`border-…`, `ring-…`, `outline-…`).

| Rol | Token | Licht | Nacht | Gebruik |
|---|---|---|---|---|
| Grond | `cream` | #f6f1ee | #1c1719 | paginagrond, app-balk |
| Grond-subtiel | `cream-soft` | #efe7e3 | #241e21 | insets, segmented-track, pressed, `tone="subtle"` |
| Oppervlak | `surface` | #fffdfc | #262023 | kaarten, lijstgroepen, tabbalk |
| Verhoogd | `surface-elevated` | #ffffff | #2e272b | sheets, dialogen, toasts |
| Inkt | `ink` / `ink-soft` | #2e2529 / #6e6166 | #f3ecea / #b3a6aa | tekst primair / secundair |
| Lijn passief | `line` | #e7ddd9 | #3a3135 | haarlijnen van kaarten, dividers |
| **Lijn interactief** | `line-strong` | #958890 | #7d7176 | rand van input, chip, checkbox, switch-uit (≥3:1) |
| Primair | `sage-fill` / `sage-dark` / `sage-soft` / `sage` | | | gevulde CTA / link + actief + eyebrow / geselecteerd + icoontegel / grafieken |
| Accent | `peach` / `peach-soft` | | | merkdruppel, gevuld "bewaard"-hartje (decoratief) |
| Fase | `phase-*-soft` / `phase-*` / `phase-*-text` | | | het ene getinte vlak / band, punt / tekst op tint |
| **Menstruatie sterk** | `phase-menstruatie-strong` | #8f5247 | #e7b4a9 | icoon + tekst "menstruatie actief", stippelrand voorspelde dagen |
| **Op menstruatie** | `phase-menstruatie-on` | #2e2529 | #2e2529 | dagnummer óp een gevulde `bg-phase-menstruatie`-cel (≥4,5:1) |
| Status | `danger`, `warning`, `info` | | | alleen fouten en destructieve acties |
| **Scrim** | `scrim` | rgba(46,37,41,.45) | rgba(0,0,0,.6) | achter sheet en dialog (`bg-scrim`) |
| **Focus** | `focus` | = sage-dark | = sage-dark | globale focusring |

Regels:
- `danger` nooit voor menstruatie of een fase; menstruatie = `phase-menstruatie-*`.
- Validatie en fouten altijd `danger` (rand + `role="alert"`-regel), nooit een fasekleur.
- Contrast `line-strong`: licht 3,3:1 op surface en 3,0:1 op cream; Nacht 3,4:1
  op surface en 3,2:1 op surface-elevated. Op `cream-soft` haalt hij geen 3:1:
  **nooit omlijnde chips op cream-soft**.
- Kalender: "vandaag" = stip onder het nummer of vette inkt, **geen ring**
  (ring = focus/selectie).

**Verouderde aliassen** (werken nog; de sweep verwijdert ze):
`bg` → `cream`, `bg-subtle` → `cream-soft`, `text` → `ink`, `text-muted` →
`ink-soft`, `border` → `line`, `primary` → `sage`, `primary-text` →
`sage-dark`, `primary-soft` → `sage-soft`, `primary-fill(-hover)` →
`sage-fill(-darker)`, `accent(-soft)` → `peach(-soft)`, `success(-soft)` →
`sage-dark` / `sage-soft`.

## 3. Typografie

`type-*` zet font, grootte en regelhoogte (displayrollen ook gewicht 400),
**nooit een kleur**. Zet de kleur ernaast (`text-ink`, `text-sage-dark`, fase-tekst).

| Stijl | Utility | Font | Grootte/regel | Gebruik |
|---|---|---|---|---|
| display-1 | `type-page-title` | Fraunces 400 SOFT | 32/1.1 (lg 36) | h1, één per pagina |
| display-2 | `type-section-title` | Fraunces 400 | 24/1.25 | h2-sectietitel buiten kaarten |
| display-3 | `type-card-title` | Fraunces 400 | 20/1.3 | h3-kaarttitel (max. 1 per kaart), sheet- en dialogtitel, lege staat |
| numeral | `type-numeral` | Fraunces 400, tabular | 44/0.9 | cyclusdag (vervangt `text-[2.75rem]`/`text-[3.25rem]`) |
| body-lg | `text-base` (= `type-body-lg`) | Jakarta | 17/1.55 | lopende tekst, rijtitels (`font-medium`) |
| body | `text-sm` (= `type-body`) | Jakarta | 15/1.5 | secundaire tekst, beschrijvingen, subtitels |
| caption | `text-xs` (= `type-caption`) | Jakarta | 13/1.45 | meta |
| eyebrow | `type-eyebrow` | Jakarta 500 | 13/1.45 | label boven een titel + `text-sage-dark` of fase-tekst |
| groepslabel | `type-group-label` | Jakarta 500 | 13/1.45 | label boven een lijstgroep + `text-ink-soft` |

Regels: 13px is de ondergrens (geen `text-[10px]`/`[11px]`). Geen `text-[…]`.
Gewichten 400/500/600, geen bold. Een titel houdt dezelfde stijl ingeklapt en
uitgeklapt. Koppen: één h1, h2 voor secties, h3 voor kaarten — kaarttitels
nooit als `<p>`. `type-body*` bestaan voor symmetrie (reset het font binnen
een displaycontext); gebruik verder gewoon `text-base/sm/xs`.

`cn()` (besluit 14): een latere `type-*` vervangt een eerdere `text-<maat>`,
`leading-*` en `font-sans/display`; een *latere* maat overschrijft alleen de
grootte (`cn("type-card-title", "text-sm")` houdt beide). Ook `rounded-card`,
`shadow-control`, `text-numeral`, `ease-enter`, `duration-fast` en de
`animate-*`-tokens mergen correct.

## 4. Vorm (radius)

| Token | Waarde | Utility | Gebruik |
|---|---|---|---|
| `--radius-xs` | 6px | `rounded-xs` | alleen checkbox |
| `--radius-inset` | 12px | `rounded-inset` | inputs, insets in kaarten, icoontegels, thumbnails, skeletons |
| `--radius-card` | 20px | `rounded-card` | **elke** kaart, lijstgroep, getint vlak, hero-beeld, toast |
| `--radius-sheet` | 28px | `rounded-sheet` / `rounded-t-sheet` | bottom sheet, dialog |
| — | pill | `rounded-full` | knoppen, chips, badges, avatars, segmented |

## 5. Ruimte en ritme (4-pt raster)

| Afstand | px | Tailwind | Waar |
|---|---|---|---|
| paginagoot | 20 (lg 32) | `px-5 lg:px-8` | alle pagina's (`--page-gutter`) |
| onder app-balk | 16 (lg 40) | `pt-4 lg:pt-10` | via `<Page>` |
| kop → eerste sectie | 24 | `mb-6` | in `<PageHeader>` |
| tussen secties | 32 | `gap-8` | sectiestapel |
| sectietitel → inhoud | 12 | `mb-3` | ingebouwd in `<SectionHeader>` |
| broertjes-kaarten | 12 | `gap-3` | kaartenlijst, raster |
| in kaart: label → inhoud | 8 | `gap-2` | |
| in kaart: groepen | 16 | `gap-4` | |
| kaart-inset | 20 / 16 | `p-5` / `p-4` | `padding="md"` / `"sm"` (rastertegel ≤200px) |
| lijstrij | 16 h · 12 v · min 56 | `px-4 py-3 min-h-14` | `ListRow`, planrijen |

Halve stappen (`1.5`, `2.5`, `3.5`) alleen binnen controls (chip, badge, knop).
Breedtes: `content` = `max-w-2xl` (één kolom), `wide` = `max-w-6xl`
(Voeding-raster, receptdetail, Vandaag/Cyclus op xl).

**Kleine cellen (besluit 27):** kalender- en DayStrip-cellen van ~35px breed
op een 320px-scherm zijn acceptabel: WCAG 2.2 AA vraagt 24×24px (2.5.8).
Alle andere doelen blijven ≥44px.

**Horizontale chiprijen:** `scroller-bleed` (loopt door tot de schermrand,
houdt 4px boven/onder vrij voor de focusring):
`<div className="scroller-bleed flex gap-2">…chips…</div>`.

## 6. Elevatie

| Niveau | Uiterlijk | Gebruik |
|---|---|---|
| 0 Plat | geen vlak | tips, quote, uitleg, lege staten, steunpunten |
| 1 Oppervlak | `<Card>` = `bg-surface border border-line rounded-card` | kaarten, lijstgroepen, plan |
| 2 Tint | `<Card tone="phase" phase=…>` (geen rand) | **max. 1 per scherm**: de fasestatus |
| 3 Overlay | `bg-surface-elevated shadow-elevated rounded-sheet` + `bg-scrim` | sheet, dialog, toast (`rounded-card`) |
| Chrome | cream (app-balk) / surface (tabbalk) + haarlijn | navigatie |

Schaduwen: `shadow-elevated` (overlays), `shadow-control` (segmented-duim,
switch-knop). Nooit `shadow-[rgba(…)]` of `shadow-lg`.

## 7. Iconen

`src/lib/ui/icon.ts` — één schaal, lijndikte volgt de maat:

```tsx
import { ICON, iconProps, CHECK_ICON } from "@/lib/ui/icon"
<ChevronRight {...ICON.sm} aria-hidden />            // 16 @1.75 — inline, chevrons, rij-icoon
<Bell {...ICON.md} aria-hidden />                     // 20 @1.75 — acties, app-balk, tabs
<Salad {...ICON.lg} aria-hidden />                    // 24 @1.5  — tegels, lege staat
<Heart {...iconProps("sm", "text-peach")} aria-hidden />  // extra classes
<Check {...CHECK_ICON} aria-hidden />                 // vinkje 14 @2.5 (CHECK_STROKE)
```

Eén icoon per concept (ontwerpvisie §4.4). Besluit 22: Cyclusinstellingen =
`Settings2`, filters = `SlidersHorizontal`, plan-item aanpassen = `Pencil`,
Even afronden = `NotebookPen`.

## 8. Focus en toegankelijkheid

- Globaal: `:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px }`.
- Rijen in een afgeronde lijst: `-outline-offset-2` (zit al in `ListRow`/`OptionList`).
- Inputs: `focus-visible:outline-offset-0` (zit al in `Input`).
- Programmatische focusdoelen (h1 met `tabIndex={-1}`, overlaypaneel/-titel):
  `data-focus-target` → geen ring. Niet voor knoppen of links.
- Doelen ≥44px, ook tekstlinks (`textActionClass` heeft `min-h-11`).
- Live statussen: "Bewaard" `role="status"` (debounced, niet elke "Opslaan…"),
  fouten `role="alert"` (`FieldError`).
- Grafiekjes: `role="img"` + `aria-label` met de samenvatting.

## 9. Beweging

| Token | Waarde | Utility | Gebruik |
|---|---|---|---|
| press | 100ms | `duration-press` | indrukken |
| fast | 160ms | `duration-fast` | kleur, hover, page-push, titel in app-balk, scrim in |
| base | 240ms | `duration-base` | sheet/dialog in, disclosure, toast in, crossfades |
| exit | 180ms | `duration-exit` | alles wat weggaat |
| slow | 480ms | `duration-slow` | voortgangsbalken (`transition-[width]`), Ritmeband |
| enter | cubic-bezier(.32,.72,0,1) | `ease-enter` | binnenkomen (merkcurve) |
| standard | cubic-bezier(.4,0,.2,1) | `ease-standard` | kleur, hoogte, rust |
| exit | cubic-bezier(.4,0,1,1) | `ease-exit` | weggaan |

Animaties: `animate-sheet-in/-out`, `animate-dialog-in/-out`,
`animate-fade-in/-out`, `animate-rise-in` (toast), `animate-page-push`
(alleen opacity .92→1, geen blijvende fill — besluit 10). Indrukken:
`motion-safe:active:scale-[0.97]` (controls, tabs) of `scale-[0.985]` (kaarten).
Geen overshoot, geen `transition-all`.

**Verminderde beweging** is in de tokens geregeld: `animate-*` verplaatsen en
schalen dan niet (dialog/toast worden een korte fade), overlays verdwijnen
direct, `Collapse` opent direct (`motion-reduce:transition-none`). Eigen
transform-animaties altijd achter `motion-safe:`.

## 10. Componenten

Alle imports uit `@/components/ui/<bestand>`. Bestaande props blijven werken;
nieuw is steeds optioneel.

### 10.1 Oppervlak en koppen

```tsx
<Card>…</Card>                                     // div, p-5, surface
<Card as="li" padding="none" interactive>…</Card>  // rij in een lijst, tikbaar
<Card padding="sm" interactive>…</Card>            // rastertegel ≤200px
<Card tone="phase" phase="ovulatie">…</Card>       // het ene getinte vlak
<Card tone="subtle">…</Card>                       // persoonlijke noot (De overgang)
<CardTitle>Ingrediënten</CardTitle>                // h3 type-card-title; as="h2" als de kaart de sectie is

<SectionHeader title="Voor jou vandaag" action={<SectionAction href="/deze-week">Hele week</SectionAction>} />
<SectionHeader as="h3" id="jouw-verhaal" title="Jouw patronen" description="Uit je laatste 3 cycli" />
```

`SectionHeader` zet zelf `mb-3` en `scroll-mt-4` op de kop.

### 10.2 Knoppen

```tsx
<Button>Opslaan</Button>                            // primary, md 48px, pill, 17/600
<Button variant="tonal" size="sm">Meer toevoegen</Button>
<Button variant="secondary">Herinnering toevoegen</Button>
<Button variant="danger">Account verwijderen</Button>
<Link href="/x" className={buttonVariants({ variant: "tonal" })}>…</Link>
<Link href="/dagboek" className={textActionClass()}>Dagboek</Link>

<IconButton label="Sluiten" icon={X} onClick={close} />                 // 44px, icoon 20
<IconButton label="Voorkeuren" icon={SlidersHorizontal} size="sm" />    // schijf 36, raakvlak 44
<IconButton label="Bewaar in favorieten" pressed={saved} onClick={toggle}
  icon={<Heart {...ICON.md} fill={saved ? "currentColor" : "none"} aria-hidden />} />
<IconButton label="Instellingen" icon={Settings2} href="/profiel/cyclus" tone="soft" />
<Badge>staat uit</Badge>  <Badge tone="sage">Nieuw</Badge>  <Badge tone="phase" phase="luteaal">Luteaal</Badge>
```

Varianten: `primary` · `secondary` (line-strong rand) · `tonal` (sage-soft) ·
`ghost` · `danger`. Maten `sm` 44 · `md` 48 · `lg` 52. Badge is nooit
interactief; een verwijderbaar filter is `<Chip removable>`.

### 10.3 Selectie: één manier per soort keuze

| Keuze | Component | Voorbeelden |
|---|---|---|
| exclusief, 2–4 "modi" | `SegmentedControl` (`fullWidth`) | Week/Dag, 4/8/12 wk/6 mnd, Favorieten-filter, Luisteren/Lezen |
| exclusief, korte labels in een raster | `ChipRadioGroup` (`columns`) | flow, klachtenlast (4 niveaus) |
| exclusief, met uitleg per optie | `OptionList` | levensfase, medicatiestatus, regelmaat, voedingsstijl, buddyfrequentie, Weergave |
| filters en meerkeuze | `Chip` | maaltijdmoment, wensen, dagen |
| actief filter weghalen | `Chip removable` | "Vegetarisch ×" |
| aan/uit | `Switch` in `ListRow toggle` | modules, meldingen — nooit Aan/Uit-chipparen |
| schaal 1–5 | `RatingScale` | energie, stemming |
| ja/akkoord in een formulier | `Checkbox` | voorwaarden bij registreren |
| positie in een reeks | `DayStrip` (komt uit de today-stroom) | Deze week, Boodschappen |

```tsx
<SegmentedControl aria-label="Periode" fullWidth value={weeks} onChange={setWeeks}
  options={[{ value: "4", label: "4 wk" }, { value: "8", label: "8 wk" }, { value: "12", label: "12 wk" }]} />

<ChipRadioGroup aria-labelledby={qId} aria-describedby={helpId} columns={4} value={score} onChange={setScore}
  options={[{ value: 0, label: "Niet" }, { value: 1, label: "Mild" }, { value: 2, label: "Matig" }, { value: 3, label: "Ernstig" }]} />

<OptionList aria-labelledby="levensfase-label" value={stage} onChange={setStage}
  options={[{ value: "regelmatig", label: "Regelmatige cyclus", description: "Je menstruatie komt ongeveer op tijd." }]} />
<OptionList framed={false} … />   // binnen een Card of sheet: geen kaart-in-kaart

<Chip selected={on} onClick={toggle}>Vegetarisch</Chip>    // aria-pressed
<Chip removable onClick={() => remove("vega")}>Vegetarisch</Chip>  // naam: "Vegetarisch verwijderen"
<RatingScale label="Energie" value={energy} onChange={setEnergy} lowLabel="Laag" highLabel="Hoog" />
<Checkbox name="terms" required>Ik ga akkoord met de <Link href="/voorwaarden">voorwaarden</Link></Checkbox>
<Checkbox checked={x} onCheckedChange={setX} description="Je kunt dit altijd aanpassen">Herinner mij</Checkbox>
```

Gedrag: alle radiogroepen gebruiken `useRovingRadio` — **één tabstop per
groep**, pijltjes verplaatsen én kiezen, Home/End springen, Spatie/Enter kiezen.
`ChipRadioGroup columns={4}` valt onder 360px terug op 2 kolommen; chips in een
raster (`fill`) houden hun breedte (vinkje als hoekje). Testen op 320 en 390px.
Chip zonder `role="radio"` = toggle (`aria-pressed`).

### 10.4 Lijsten

```tsx
<ListGroup label="Van mij">
  <ListRow href="/dagboek" icon={NotebookPen} title="Dagboek" description="Je notities, alleen voor jou" />
  <ListRow onClick={openThemeSheet} icon={Palette} title="Weergave" value="Automatisch" />
  <ListRow icon={Salad} title="Voeding" description="Recepten en plan" toggle={{ checked, onChange }} />
  <ListRow href="/mentale-rust" icon={Brain} title="Mentale rust" badge={<Badge>staat uit</Badge>} muted />
</ListGroup>
```

Rij: icoontegel 36px (`rounded-inset bg-sage-soft text-sage-dark`, `ICON.sm`),
titel 17/500, beschrijving 15 ink-soft (max. 2 regels), rechts één van
chevron / waarde / Switch / Badge. Met `toggle` is de hele rij tikbaar en heet
de switch zoals de titel. Groepslabel is standaard een h2 (`labelAs`).

### 10.5 Uitklappen

```tsx
<Disclosure label="Meer weten over deze fase">…</Disclosure>
<Disclosure label="Voorkeuren · 3 gekozen" open={open} onOpenChange={setOpen}>…</Disclosure>
<Collapse open={editing} id="checkin-editor"><div className="pt-4">…</div></Collapse>
```

Eén triggerstijl (15/500 sage-dark, chevron 16 die draait, 44px). De inhoud
blijft gemount en is `inert` als hij dicht is; padding hoort *binnen* `Collapse`.
`Expandable` (oud) werkt nog en rendert nu `Disclosure`.

### 10.6 Velden

```tsx
<Label htmlFor="naam">Naam</Label>
<Input id="naam" aria-invalid={!!error} aria-describedby={error ? "naam-fout" : undefined} />
<FieldError id="naam-fout">{error}</FieldError>
<Textarea rows={3} />
<TagListInput value={tags} onChange={setTags} inputId="allergie" placeholder="Bijv. noten" />
```

`rounded-inset`, `border-line-strong`, `min-h-12`; bij focus `border-sage-dark`
+ de globale ring op de rand; bij `aria-invalid` alles in `danger`.

### 10.7 Overlays: BottomSheet en Dialog

```tsx
<BottomSheet open={open} onClose={close} title="Hoe heb je geslapen?"
  footer={<Button className="w-full" onClick={save}>Opslaan</Button>}>…</BottomSheet>
<Dialog open={confirming} onClose={cancel} title="Account verwijderen?"
  footer={<><Button variant="danger" onClick={del}>Verwijderen</Button><Button variant="ghost" onClick={cancel}>Annuleren</Button></>}>
  <p className="text-sm text-ink-soft">Dit kan niet ongedaan gemaakt worden.</p>
</Dialog>
```

Regels (besluit 19), allemaal ingebouwd via `useOverlay`
(`@/lib/hooks/use-overlay-behavior`) en de overlay-stack (`@/lib/ui/overlay-stack`):
- Focus gaat naar de h2-titel (of het paneel), **nooit naar een tekstveld**
  (dat opent het toetsenbord). Afwijken kan met `initialFocus={ref}`.
- Tab en Shift+Tab blijven binnen; Escape en de scrim sluiten; focus gaat
  terug naar de knop die opende.
- `inert` op `#app-root` en de scroll-lock zijn ref-counted over alle open
  overlays; alleen de bovenste reageert op Tab/Escape. Zonder `#app-root`
  worden de andere kinderen van `body` inert. Opruimen gebeurt synchroon.
- In: sheet schuift omhoog (240ms enter), dialog fade + schaal .96→1;
  uit: 180ms exit; scrim fade. De inhoud blijft tijdens het weggaan staan en
  begint bij elke opening opnieuw.
- Titel is een h2 met `aria-labelledby`; zonder titel geef `aria-label`.
- Het overlay-root heeft `data-no-pull-refresh`.

Overlay alleen voor een korte taak of keuze. Bevestig verwijderen met
`Dialog`, niet met een losse `confirm()`.

### 10.8 Leeg, laden en bevestigen

```tsx
<EmptyState icon={Heart} title="Nog geen favorieten" description="Tik op het hartje bij een recept."
  action={<Link href="/voeding" className={buttonVariants({ variant: "tonal", size: "sm" })}>Bekijk recepten</Link>} />

<SkeletonPage />                                  // = cards, 3 stuks, content-breedte
<SkeletonPage back width="wide" hero />           // receptdetail
<SkeletonPage variant="list" count={6} />         // Profiel-achtige lijsten
<SkeletonPage variant="grid" count={4} />         // Ontdek
<SkeletonPage cards={4} />                        // oude prop, blijft werken
```

EmptyState: altijd plat (nooit in een Card), icoon 24 in een sage-soft cirkel
van 56, titel `type-card-title` (h2; `titleAs`), **altijd een actie**. Geef het
icoon als component (`icon={Heart}`); een element werkt nog maar krijgt geen
cirkel. In een Server Component mag dat gewoon; vanuit een Client Component
naar een Server Component geef je geen componenten door.

SkeletonPage spiegelt `<Page>` + `<PageHeader>` (zelfde container, titelhoogte
en `mb-6`), zodat de kop niet springt. `ActionToast` alleen voor een korte
bevestiging op dezelfde plek; meldingen voor de hele app gaan via de toast-host
(shell-stroom).

### 10.9 Hooks

- `useOverlay(open, onClose, { initialFocus })` → `{ mounted, phase, rootRef, panelRef, titleRef, titleId, contentKey }`
  voor een eigen overlay. `useOverlayBehavior` is verouderd.
- `useRovingRadio({ count, selectedIndex, onSelect, orientation, isDisabled })`
  → `getItemProps(i)` op elk `role="radio"`-element binnen een `role="radiogroup"`.

## 11. Migratietabel (oud → nieuw)

| Oud | Nieuw |
|---|---|
| `rounded-[1.25rem]`, `rounded-2xl`, `rounded-3xl` op kaarten/vlakken | `rounded-card` (of gewoon `<Card>`) |
| `rounded-[1.75rem]`, `rounded-t-[1.75rem]` | `rounded-sheet`, `rounded-t-sheet` |
| `rounded-[0.875rem]`, `rounded-xl`, `rounded-lg` (inputs, insets, tegels) | `rounded-inset` |
| `rounded-[1.25rem] bg-surface border border-line p-5` | `<Card>` |
| getinte uitlegblokken (`bg-phase-*-soft rounded-2xl p-3.5`) | plat op de pagina; alleen de fasestatus is `<Card tone="phase">` |
| `font-display text-3xl` (h1) | `type-page-title` (of `<PageHeader>`) |
| `font-display text-xl/text-2xl` (h2) | `type-section-title` / `<SectionHeader>` |
| `font-display text-lg`, `<p className="text-sm font-medium">` als kaarttitel | `<CardTitle>` / `type-card-title` als h2/h3 |
| `text-[2.75rem]`, `text-[3.25rem]` | `type-numeral` |
| `text-[15px]` | `text-sm` |
| `text-[10px]`, `text-[11px]` | `text-xs` (13px is de ondergrens) |
| `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 …` | niets (globale ring) |
| `focus:outline-none focus:ring-2` op velden | `<Input>` / `<Textarea>` |
| `bg-ink/45` scrim | `bg-scrim` (of gewoon `BottomSheet`/`Dialog`) |
| `shadow-[0_1px_3px_rgba(46,37,41,0.12)]` | `shadow-control` |
| `shadow-lg` op toasts/pills | `shadow-elevated` |
| `text-danger`/`bg-danger` voor menstruatie | `text-phase-menstruatie-strong` / `bg-phase-menstruatie` |
| dagnummer op menstruatiedag `text-phase-menstruatie-text` | `text-phase-menstruatie-on` |
| `animate-pop-in`, `animate-page-in` | `animate-dialog-in` / `animate-rise-in`; pagina: `animate-page-push` |
| `transition-all duration-300` (voortgang) | `transition-[width] duration-slow ease-standard` |
| `duration-150/200`, `ease-out`, eigen cubic-beziers | `duration-fast/base/exit`, `ease-enter/standard/exit` |
| `active:scale-[0.92…0.99]` | `motion-safe:active:scale-[0.97]` (controls) / `[0.985]` (kaarten) |
| `className="h-4 w-4" strokeWidth={2}` op iconen | `{...ICON.sm}` (of `iconProps`) |
| `h-11 w-11 rounded-full flex items-center justify-center …` icoonknop | `<IconButton label icon>` |
| losse `<button>` met pill-classes | `<Button>` / `buttonVariants()` |
| statische pills/labels | `<Badge>` |
| eigen "Aanpassen ▾" / "Meer weten" | `<Disclosure>` of `<Collapse>` |
| `<Chip>Aan</Chip><Chip>Uit</Chip>` | `<ListRow toggle>` / `<Switch>` |
| tegels met beschrijving als keuze (levensfase …) | `<OptionList>` |
| rij `Chip`'s met `aria-pressed` voor één keuze | `<ChipRadioGroup>` of `<SegmentedControl>` |
| native `<input type="checkbox" className="h-4 w-4">` | `<Checkbox>` |
| `ProfileHubGroup` / handgemaakte linklijsten | `<ListGroup>` + `<ListRow>` |
| EmptyState in een `<Card>` / zonder actie | plat `<EmptyState icon={X} … action>` |
| `<SkeletonPage cards={n} />` | `<SkeletonPage count={n} back width hero variant>` passend bij de pagina |
| `scroll-mt-24` | `scroll-mt-4` (de app-balk zit in `scroll-padding-top`) |
| `overflow-x-auto -mx-5 px-5` chiprij | `scroller-bleed` |

## 12. Navigatie: tab van herkomst

_Deze sectie vult de shell-stroom (foundation-shell) aan met de navigatiestore,
`<Page>`, `<PageHeader>`, `useAppBarTitle`, `<AppBarConfig>`, de toast-host en
`StickyActionBar`._

Afgesproken regel (ontwerpvisie §4.3, besluit 13): een scherm dat je met een
push opent, erft de tab van het scherm waar je vandaan kwam; alleen een tik op
de tabbalk wisselt van tab. Bij een deep link, pushmelding of herladen zonder
geschiedenis geldt de canonieke eigenaar van de route. Een keten zoals Profiel →
Wat ik gebruik → bibliotheek blijft dus onder Profiel — zo bedoeld.
