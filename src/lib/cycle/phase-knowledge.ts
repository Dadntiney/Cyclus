import type { CyclePhase } from "@/lib/cycle/estimate"

/**
 * "What's happening in my body" educational content per cycle phase — shown
 * on the Cyclusdag detail page (see cyclusdag.ts, which composes this with
 * phase-content.ts's practical nutrition/movement tips and the buddy quotes
 * into what the page actually renders).
 *
 * Content rules: hedged phrasing, medical terms explained inline, never a
 * diagnosis. Written for soft self-understanding — not a checklist.
 */

export interface BodyChangeItem {
  /** e.g. "Energie", "Stemming", "Buikgevoel" — one of the categories from the brief. */
  label: string
  /** Always hedged phrasing — never presented as a certainty. */
  text: string
  /**
   * Shown inline under "Hoe kun je je voelen?" by default (kept to a
   * scannable handful); the rest only appear once "Meer weten" is opened.
   */
  highlight?: boolean
}

export interface PhaseKnowledge {
  phase: CyclePhase
  /** "Wat gebeurt er hormonaal?" — plain language, a bit more room to breathe. */
  hormonalSummary: string
  /** "Wat gebeurt er in je lichaam?" */
  bodySummary: string
  /** "Waarom voel ik me zo?" — ties feelings back to the physiology above. */
  whyExplainer: string
  /** Physical + mental/emotional changes, mixed — see BodyChangeItem.highlight. */
  changes: BodyChangeItem[]
  /** Reassurance that variation is normal — goes in the "Meer weten" panel. */
  normalNote: string
  /** Gentle self-care angle for this phase (not nutrition/movement — those live in phase-content.ts). */
  attentionNote: string
  /** Pool of short "Wist je dat...?" facts; one is picked per day (see cyclusdag.ts). */
  funFacts: string[]
}

export const PHASE_KNOWLEDGE: Record<CyclePhase, PhaseKnowledge> = {
  menstruatie: {
    phase: "menstruatie",
    hormonalSummary:
      "Aan het begin van je cyclus staan oestrogeen en progesteron allebei laag. Die daling is het signaal voor je lichaam om het opgebouwde baarmoederslijmvlies los te laten. Dat is geen ‘tekort’ of iets wat je moet ‘oplossen’ — het is gewoon hoe deze fase hormonale werkt.",
    bodySummary:
      "Je baarmoeder trekt licht samen om dat slijmvlies af te voeren — dat is je menstruatie. Voor sommige vrouwen voelt dat als milde tot stevigere krampen, voor anderen nauwelijks merkbaar. Ook de hoeveelheid bloedverlies en hoe lang het aanhoudt, verschillen sterk van persoon tot persoon.",
    whyExplainer:
      "Doordat beide hormonen op hun laagst staan, is dit voor veel vrouwen de fase waarin ze zich wat rustiger, naar binnen gekeerd of minder energiek voelen dan in de rest van de cyclus. Dat betekent niet dat er iets mis is: je lichaam doet hier precies wat het hoort te doen. Extra behoefte aan warmte, rust of zachtere dagen past daar vaak bij.",
    changes: [
      {
        label: "Energie",
        text: "Je kunt merken dat je energie wat lager ligt dan in andere fases — dat is voor veel vrouwen heel gewoon, vooral op de eerste dagen.",
        highlight: true,
      },
      {
        label: "Buikgevoel",
        text: "Lichte tot stevigere buikkrampen komen vaak voor doordat je baarmoeder samentrekt. Warmte of zachte beweging voelt voor sommigen prettig.",
        highlight: true,
      },
      {
        label: "Stemming",
        text: "Sommige vrouwen voelen zich rustiger of gevoeliger dan anders; voor anderen verandert er weinig. Beide is oké.",
        highlight: true,
      },
      {
        label: "Concentratie",
        text: "Focus vasthouden kan soms wat meer moeite kosten, zeker op de eerste dagen — dat zegt niets over je kunnen, wel over je fase.",
        highlight: true,
      },
      {
        label: "Slaap",
        text: "Je slaap kan net iets onrustiger aanvoelen of je hebt sneller behoefte aan een vroeger avondritueel. Niet iedereen ervaart dit.",
      },
      {
        label: "Hoofdpijn",
        text: "Hoofdpijn komt bij sommige vrouwen aan het begin van de menstruatie vaker voor, soms samen met minder slaap of minder vocht.",
      },
      {
        label: "Lichaamstemperatuur",
        text: "Je basale lichaamstemperatuur is in deze fase doorgaans op zijn laagst — meetbaar, meestal niet voelbaar.",
      },
      {
        label: "Vermoeidheid",
        text: "Een grotere behoefte aan rust is een veelvoorkomende ervaring. Even minder ‘moeten’ mag in deze fase helemaal.",
      },
      {
        label: "Huid",
        text: "Sommige vrouwen merken weinig verandering in hun huid; anderen zien juist wat meer onzuiverheden of juist rust.",
      },
      {
        label: "Stressgevoeligheid",
        text: "Kleine dingen kunnen soms net iets zwaarder aanvoelen dan normaal — zachtheid naar jezelf toe is dan geen luxe.",
      },
    ],
    normalNote:
      "Cyclusduur, hoeveelheid bloedverlies en klachten verschillen enorm van vrouw tot vrouw — en zelfs van cyclus tot cyclus bij dezelfde vrouw. Er bestaat geen ‘standaard’ menstruatie. Wat voor jou gewoon voelt, mag dus anders zijn dan bij een vriendin of dan wat je online leest.",
    attentionNote:
      "Dit is voor veel vrouwen een goed moment om net iets meer rust, warmte en aandacht voor jezelf in te plannen. Drink voldoende water, eet iets warms als dat fijn voelt, en gun jezelf genoeg slaap. Luister vooral naar wat jouw lichaam vandaag vraagt — een dag zonder ‘perfecte’ check-in is ook een goede dag.",
    funFacts: [
      "Wist je dat de gemiddelde menstruatie 3 tot 7 dagen duurt — en dat dit per vrouw flink kan verschillen?",
      "Wist je dat het baarmoederslijmvlies dat je nu verliest, in de weken ervoor speciaal is opgebouwd voor een mogelijke zwangerschap?",
      "Wist je dat warmte, zoals een kruik op je buik, kan helpen om gespannen buikspieren wat te ontspannen?",
      "Wist je dat voldoende vocht rondom je menstruatie voor veel vrouwen prettig aanvoelt — bij vermoeidheid of hoofdpijn soms nét dat beetje verschil maakt?",
    ],
  },
  folliculair: {
    phase: "folliculair",
    hormonalSummary:
      "Na je menstruatie begint je lichaam geleidelijk meer oestrogeen aan te maken. Dat hormoon zorgt ervoor dat een aantal eiblaasjes (follikels — kleine ‘zakjes’ in je eierstokken met daarin een onrijpe eicel) gaat rijpen. Die opbouw gebeurt stap voor stap: niet van de ene op de andere dag.",
    bodySummary:
      "Ondertussen bouwt je baarmoederslijmvlies zich weer op, als voorbereiding op een mogelijke zwangerschap later in je cyclus. Je lichaam is hier dus duidelijk in een opbouwende stand — wat voor veel vrouwen samenhangt met meer ruimte voor energie en plannen.",
    whyExplainer:
      "De geleidelijk stijgende oestrogeenspiegel wordt door veel vrouwen in verband gebracht met meer energie en een opgewekter gevoel — al is dit geen vaste regel en verschilt de timing per vrouw. Sommigen merken het al snel na hun menstruatie, anderen pas later in deze fase. Beide is normaal.",
    changes: [
      {
        label: "Energie",
        text: "Je kunt merken dat je energie geleidelijk toeneemt naarmate deze fase vordert — vaak geen knop, maar een zachte opbouw.",
        highlight: true,
      },
      {
        label: "Stemming",
        text: "Veel vrouwen voelen zich in deze fase wat opgewekter of optimistischer. Dat is geen verplichting — wel iets wat je mag herkennen.",
        highlight: true,
      },
      {
        label: "Concentratie",
        text: "Focus en helderheid van denken voelen voor sommige vrouwen wat makkelijker in deze fase.",
        highlight: true,
      },
      {
        label: "Libido",
        text: "Interesse in intimiteit kan geleidelijk toenemen naarmate deze fase vordert — of juist niet. Beide komt voor.",
        highlight: true,
      },
      {
        label: "Huid",
        text: "Je huid kan er wat frisser uitzien naarmate oestrogeen stijgt. Ook dit is persoonlijk.",
      },
      {
        label: "Slaap",
        text: "Slaap verloopt voor veel vrouwen in deze fase relatief stabiel — een fijn moment om een rustig avondritueel vast te houden.",
      },
      {
        label: "Honger/eetlust",
        text: "Eetlust is voor veel vrouwen in deze fase wat stabieler dan vlak voor of tijdens de menstruatie.",
      },
      {
        label: "Lichaamstemperatuur",
        text: "Je basale temperatuur blijft doorgaans laag, tot vlak voor de eisprong.",
      },
      {
        label: "Stressgevoeligheid",
        text: "Sommige vrouwen voelen zich in deze fase veerkrachtiger tegen stress — dat maakt zachtheid naar jezelf toe niet minder belangrijk.",
      },
      {
        label: "Vermoeidheid",
        text: "Vermoeidheid speelt voor veel vrouwen een kleinere rol dan rond de menstruatie of later in de cyclus.",
      },
    ],
    normalNote:
      "Hoe snel je energie ‘terugkomt’ na je menstruatie verschilt sterk per vrouw. Bij sommigen is dat al na een dag merkbaar, bij anderen duurt het langer — allebei is normaal. Vergelijk jezelf vooral met je eigen eerdere cycli, niet met een ideaalbeeld.",
    attentionNote:
      "Met vaak wat meer energie is dit voor veel vrouwen een fijn moment om iets nieuws te proberen of je week vooruit te plannen. Blijf wel drinken en slapen alsof het ‘gewone’ basiszorg is — ook als je je sterker voelt. Volg steeds je eigen tempo, niet een schema.",
    funFacts: [
      "Wist je dat ‘folliculair’ verwijst naar de follikels: kleine blaasjes in je eierstokken waarin eicellen rijpen?",
      "Wist je dat de lengte van deze fase het meest kan verschillen tussen vrouwen — soms wel een week schelen?",
      "Wist je dat oestrogeen, naast je cyclus, ook een rol speelt bij de opbouw van botweefsel?",
      "Wist je dat voldoende slaap in een energieke fase net zo belangrijk blijft — herstel gebeurt vooral ’s nachts?",
    ],
  },
  ovulatie: {
    phase: "ovulatie",
    hormonalSummary:
      "Rond het midden van je cyclus bereikt oestrogeen een piek. Dat veroorzaakt een korte, sterke stijging van luteïniserend hormoon (LH) — het signaal voor de eisprong: het vrijkomen van een rijpe eicel. Die piek is kort; daarna verandert het hormonale beeld weer.",
    bodySummary:
      "Eén van je eierstokken laat die eicel los; via de eileider reist hij richting je baarmoeder. Dit is het meest vruchtbare moment van je cyclus. Niet iedere vrouw merkt dit fysiek — en dat is helemaal oké.",
    whyExplainer:
      "De piek in oestrogeen rond de eisprong wordt door veel vrouwen in verband gebracht met een kort gevoel van meer energie of zelfvertrouwen — al verschilt de intensiteit hiervan sterk per persoon. Sommigen voelen niets bijzonders; anderen juist een duidelijk ‘sterk’ moment. Beide past bij hoe lichaam en cyclus kunnen samenwerken.",
    changes: [
      {
        label: "Energie",
        text: "Veel vrouwen voelen zich rond de eisprong tijdelijk energieker — een korte golf, geen garantie voor elke cyclus.",
        highlight: true,
      },
      {
        label: "Buikgevoel",
        text: "Een lichte, kortdurende steek aan één kant van je onderbuik komt bij sommige vrouwen voor rond de eisprong.",
        highlight: true,
      },
      {
        label: "Stemming",
        text: "Zelfvertrouwen en sociale energie kunnen voor sommige vrouwen rond dit moment toenemen.",
        highlight: true,
      },
      {
        label: "Libido",
        text: "Interesse in intimiteit piekt voor veel vrouwen rond de eisprong — maar niet voor iedereen, en niet elke cyclus even sterk.",
        highlight: true,
      },
      {
        label: "Lichaamstemperatuur",
        text: "Je basale lichaamstemperatuur stijgt met een fractie van een graad vlak na de eisprong.",
      },
      {
        label: "Huid",
        text: "Je huid kan er rond dit moment stralender uitzien — of juist niet. Beide komt voor.",
      },
      {
        label: "Concentratie",
        text: "Sommige vrouwen ervaren rond dit moment extra alertheid of scherpte.",
      },
      {
        label: "Borsten",
        text: "Lichte gevoeligheid van de borsten komt bij sommige vrouwen rond de eisprong voor.",
      },
      {
        label: "Slaap",
        text: "Slaap blijft voor de meeste vrouwen in deze korte fase redelijk stabiel. Blijf wel drinken als je actiever beweegt.",
      },
      {
        label: "Stressgevoeligheid",
        text: "Veel vrouwen voelen zich in deze fase veerkrachtig, al is dit persoonlijk.",
      },
    ],
    normalNote:
      "Niet iedere vrouw merkt haar eisprong fysiek op. Sommige vrouwen voelen een lichte steek aan één kant (in de volksmond ook wel ‘mittelschmerz’, Duits voor ‘middenpijn’), anderen merken helemaal niets — beide is normaal. Apps en schema’s schatten; jouw lichaam heeft altijd het laatste woord.",
    attentionNote:
      "Voelt dit als een energieke dag voor jou? Dan kan het een fijn moment zijn voor iets actiefs of sociaals. Drink voldoende als je meer beweegt, en gun je lichaam ook hier herstel. Voelt het anders? Dan is dat evengoed prima — dit is geen vaste regel.",
    funFacts: [
      "Wist je dat een losgekomen eicel ongeveer 12 tot 24 uur bevruchtbaar is?",
      "Wist je dat ‘mittelschmerz’ de term is voor de lichte steek die sommige vrouwen rond de eisprong voelen?",
      "Wist je dat je basale lichaamstemperatuur na de eisprong met slechts een fractie van een graad stijgt — meetbaar, maar niet voelbaar?",
      "Wist je dat ‘ovulatie’ en ‘energiepiek’ niet hetzelfde zijn — de ene is fysiologie, de andere een gevoel dat wel of niet meekomt?",
    ],
  },
  luteaal: {
    phase: "luteaal",
    hormonalSummary:
      "Na de eisprong verandert het overgebleven follikelweefsel in het ‘gele lichaam’ (corpus luteum), dat progesteron aanmaakt. Dit hormoon bereidt je baarmoederslijmvlies voor op een mogelijke zwangerschap. Progesteron kan ook een licht kalmerend effect hebben — en later, als het weer daalt, juist meer wisselingen geven.",
    bodySummary:
      "Blijft bevruchting uit, dan dalen progesteron en oestrogeen weer richting het einde van deze fase — dat is het signaal voor je lichaam om de volgende menstruatie te starten. Die overgang voelt voor sommigen vloeiend, voor anderen als een duidelijke omslag in energie of stemming.",
    whyExplainer:
      "De stijging van progesteron, gevolgd door de daling ervan richting het einde van deze fase, hangt bij sommige vrouwen samen met wisselingen in energie, stemming en slaap — vaak aangeduid als PMS-achtige gevoelens. Dat is geen karaktertrek en geen ‘falen’: het is een hormonale overgang die bij veel vrouwen herkenbaar is, in heel verschillende mate.",
    changes: [
      {
        label: "Energie",
        text: "Richting het einde van deze fase kan je energie geleidelijk afnemen. Een zachter tempo is dan geen zwakte — vaak juist wijsheid.",
        highlight: true,
      },
      {
        label: "Stemming",
        text: "Stemmingswisselingen komen bij sommige vrouwen vaker voor in de dagen voor de menstruatie. Herkennen helpt vaak meer dan ‘eroverheen willen’.",
        highlight: true,
      },
      {
        label: "Honger/eetlust",
        text: "Meer trek, met name in zoet of hartig eten, is een veelvoorkomende ervaring in deze fase. Eten mag — stevige basis naast iets lekkers vaak fijner.",
        highlight: true,
      },
      {
        label: "Slaap",
        text: "Slaap kan wat wisselender aanvoelen naarmate deze fase vordert. Een vast avondritueel en een koelere slaapkamer helpen sommige vrouwen.",
        highlight: true,
      },
      {
        label: "Buikgevoel",
        text: "Een opgeblazen gevoel komt bij sommige vrouwen voor, vaak door vochtretentie. Extra water drinken voelt paradoxaal soms juist prettig.",
      },
      {
        label: "Borsten",
        text: "Gevoelige of gespannen borsten komen bij sommige vrouwen voor in deze fase.",
      },
      {
        label: "Hoofdpijn",
        text: "Hoofdpijn wordt door sommige vrouwen vaker gemeld in de dagen voor de menstruatie — soms samen met minder slaap of minder vocht.",
      },
      {
        label: "Stressgevoeligheid",
        text: "Kleine stressoren kunnen in deze fase soms zwaarder aanvoelen dan anders. Minder op je bord mag.",
      },
      {
        label: "Huid",
        text: "Onzuiverheden komen bij sommige vrouwen vaker voor richting het einde van deze fase.",
      },
      {
        label: "Concentratie",
        text: "Focus vasthouden kan voor sommige vrouwen wat meer moeite kosten richting het einde van deze fase.",
      },
    ],
    normalNote:
      "Niet iedere vrouw ervaart klachten in deze fase, en de mate waarin verschilt sterk. Aanhoudende, zware klachten die je dagelijks leven flink beïnvloeden zijn het overleggen met een arts of zorgverlener waard — dat is zorgzaamheid, geen overdrijven.",
    attentionNote:
      "Richting het einde van deze fase kan een iets rustiger tempo, voldoende slaap, genoeg water en aandacht voor je basisbehoeften net dat beetje verschil maken. Er is geen ‘moeten’ bij — alleen wat voor jou fijn voelt. Een avond eerder naar bed mag een bewuste keuze zijn, geen schuld.",
    funFacts: [
      "Wist je dat ‘luteaal’ is afgeleid van het gele lichaam (corpus luteum), het overblijfsel van de follikel na de eisprong?",
      "Wist je dat progesteron naast je cyclus ook een licht kalmerend effect op het zenuwstelsel kan hebben?",
      "Wist je dat deze fase qua lengte meestal stabieler is dan de folliculaire fase — vaak rond de 12 tot 14 dagen?",
      "Wist je dat vocht vasthouden en dorst tegelijk kunnen voorkomen — voldoende drinken blijft dan vaak wél prettig?",
    ],
  },
}

export function getPhaseKnowledge(phase: CyclePhase): PhaseKnowledge {
  return PHASE_KNOWLEDGE[phase]
}
