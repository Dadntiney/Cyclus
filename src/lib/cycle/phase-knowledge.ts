import type { CyclePhase } from "@/lib/cycle/estimate"

/**
 * "What's happening in my body" educational content per cycle phase — shown
 * on the Cyclusdag detail page (see cyclusdag.ts, which composes this with
 * phase-content.ts's practical nutrition/movement tips and the buddy quotes
 * into what the page actually renders).
 *
 * This file is deliberately separate from phase-content.ts: phase-content.ts
 * is the *practical* layer (what to eat, how to move, this week's tips) used
 * across Deze week / Cyclus / Vandaag. This file is the *educational* layer
 * (what's happening hormonally/physically, how that can feel) used only on
 * the Cyclusdag detail page. Keeping them separate avoids the two ever
 * repeating or contradicting each other — cyclusdag.ts is the one place that
 * pulls from both.
 *
 * Content rules (see AGENTS.md-adjacent guidance from the product brief):
 * - Never a diagnosis, never "this is what happens to you" — always hedged
 *   ("je kunt merken dat", "sommige vrouwen ervaren", "kan samenhangen met").
 * - Explain a medical term the moment it's used (e.g. "follikels" gets one
 *   clause of plain-language explanation inline).
 * - Distinguish what's physiologically well-established (hormonalSummary,
 *   bodySummary, whyExplainer) from what varies a lot person to person
 *   (changes, normalNote).
 */

export interface BodyChangeItem {
  emoji: string
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
  /** "Wat gebeurt er hormonaal?" — 1-2 short sentences, plain language. */
  hormonalSummary: string
  /** "Wat gebeurt er in je lichaam?" — 1-2 short sentences. */
  bodySummary: string
  /** "Waarom voel ik me zo?" — ties feelings back to the physiology above. */
  whyExplainer: string
  /** Physical + mental/emotional changes, mixed — see BodyChangeItem.highlight. */
  changes: BodyChangeItem[]
  /** Reassurance that variation is normal — goes in the "Meer weten" panel. */
  normalNote: string
  /** A gentle, general self-care angle for this phase (not a nutrition/movement tip — those live in phase-content.ts). */
  attentionNote: string
  /** Pool of short "Wist je dat...?" facts; one is picked per day (see cyclusdag.ts). */
  funFacts: string[]
}

export const PHASE_KNOWLEDGE: Record<CyclePhase, PhaseKnowledge> = {
  menstruatie: {
    phase: "menstruatie",
    hormonalSummary:
      "Aan het begin van je cyclus staan je hormoonspiegels oestrogeen en progesteron allebei laag. Die daling is het signaal voor je lichaam om het opgebouwde baarmoederslijmvlies los te laten.",
    bodySummary:
      "Je baarmoeder trekt licht samen om dat slijmvlies af te voeren — dat is je menstruatie. Voor sommige vrouwen voelt dat als milde tot stevigere krampen, voor anderen nauwelijks merkbaar.",
    whyExplainer:
      "Doordat beide hormonen op hun laagst staan, is dit voor veel vrouwen de fase waarin ze zich wat rustiger, naar binnen gekeerd of minder energiek voelen dan in de rest van de cyclus.",
    changes: [
      { emoji: "🔋", label: "Energie", text: "Je kunt merken dat je energie wat lager ligt dan in andere fases — dat is voor veel vrouwen heel gewoon.", highlight: true },
      { emoji: "🌀", label: "Buikgevoel", text: "Lichte tot stevigere buikkrampen komen vaak voor doordat je baarmoeder samentrekt.", highlight: true },
      { emoji: "💭", label: "Stemming", text: "Sommige vrouwen voelen zich rustiger of gevoeliger dan anders; voor anderen verandert er weinig.", highlight: true },
      { emoji: "🎯", label: "Concentratie", text: "Focus vasthouden kan soms wat meer moeite kosten, zeker op de eerste dagen.", highlight: true },
      { emoji: "😴", label: "Slaap", text: "Je slaap kan net iets onrustiger aanvoelen, al ervaart niet iedereen dit." },
      { emoji: "🤕", label: "Hoofdpijn", text: "Hoofdpijn komt bij sommige vrouwen aan het begin van de menstruatie vaker voor." },
      { emoji: "🌡️", label: "Lichaamstemperatuur", text: "Je basale lichaamstemperatuur is in deze fase doorgaans op zijn laagst." },
      { emoji: "🛌", label: "Vermoeidheid", text: "Een grotere behoefte aan rust is een veelvoorkomende ervaring in deze fase." },
      { emoji: "✨", label: "Huid", text: "Sommige vrouwen merken weinig verandering in hun huid in deze fase, anderen wel." },
      { emoji: "⚡", label: "Stressgevoeligheid", text: "Kleine dingen kunnen soms net iets zwaarder aanvoelen dan normaal." },
    ],
    normalNote:
      "Cyclusduur, hoeveelheid bloedverlies en klachten verschillen enorm van vrouw tot vrouw — en zelfs van cyclus tot cyclus bij dezelfde vrouw. Er bestaat geen 'standaard' menstruatie.",
    attentionNote:
      "Dit is voor veel vrouwen een goed moment om net iets meer rust, warmte en aandacht voor jezelf in te plannen. Luister vooral naar wat jouw lichaam vandaag vraagt.",
    funFacts: [
      "Wist je dat de gemiddelde menstruatie 3 tot 7 dagen duurt — en dat dit per vrouw flink kan verschillen?",
      "Wist je dat het baarmoederslijmvlies dat je nu verliest, in de weken ervoor speciaal is opgebouwd voor een mogelijke zwangerschap?",
      "Wist je dat warmte, zoals een kruik op je buik, kan helpen om gespannen buikspieren wat te ontspannen?",
    ],
  },
  folliculair: {
    phase: "folliculair",
    hormonalSummary:
      "Na je menstruatie begint je lichaam geleidelijk meer oestrogeen aan te maken. Dat hormoon zorgt ervoor dat een aantal eiblaasjes (follikels — kleine 'zakjes' in je eierstokken met daarin een onrijpe eicel) gaat rijpen.",
    bodySummary:
      "Ondertussen bouwt je baarmoederslijmvlies zich weer op, als voorbereiding op een mogelijke zwangerschap later in je cyclus.",
    whyExplainer:
      "De geleidelijk stijgende oestrogeenspiegel wordt door veel vrouwen in verband gebracht met meer energie en een opgewekter gevoel — al is dit geen vaste regel en verschilt de timing per vrouw.",
    changes: [
      { emoji: "🔋", label: "Energie", text: "Je kunt merken dat je energie geleidelijk toeneemt naarmate deze fase vordert.", highlight: true },
      { emoji: "💭", label: "Stemming", text: "Veel vrouwen voelen zich in deze fase wat opgewekter of optimistischer.", highlight: true },
      { emoji: "🎯", label: "Concentratie", text: "Focus en helderheid van denken voelen voor sommige vrouwen wat makkelijker in deze fase.", highlight: true },
      { emoji: "❤️", label: "Libido", text: "Interesse in intimiteit kan geleidelijk toenemen naarmate deze fase vordert.", highlight: true },
      { emoji: "✨", label: "Huid", text: "Je huid kan er wat frisser uitzien naarmate oestrogeen stijgt." },
      { emoji: "😴", label: "Slaap", text: "Slaap verloopt voor veel vrouwen in deze fase relatief stabiel." },
      { emoji: "🍽️", label: "Honger/eetlust", text: "Eetlust is voor veel vrouwen in deze fase wat stabieler dan vlak voor of tijdens de menstruatie." },
      { emoji: "🌡️", label: "Lichaamstemperatuur", text: "Je basale temperatuur blijft doorgaans laag, tot vlak voor de eisprong." },
      { emoji: "⚡", label: "Stressgevoeligheid", text: "Sommige vrouwen voelen zich in deze fase veerkrachtiger tegen stress." },
      { emoji: "🛌", label: "Vermoeidheid", text: "Vermoeidheid speelt voor veel vrouwen een kleinere rol dan rond de menstruatie of later in de cyclus." },
    ],
    normalNote:
      "Hoe snel je energie 'terugkomt' na je menstruatie verschilt sterk per vrouw. Bij sommigen is dat al na een dag merkbaar, bij anderen duurt het langer — allebei is normaal.",
    attentionNote:
      "Met vaak wat meer energie is dit voor veel vrouwen een fijn moment om iets nieuws te proberen of je week vooruit te plannen. Volg wel steeds je eigen tempo, niet een schema.",
    funFacts: [
      "Wist je dat 'folliculair' verwijst naar de follikels: kleine blaasjes in je eierstokken waarin eicellen rijpen?",
      "Wist je dat de lengte van deze fase het meest kan verschillen tussen vrouwen — soms wel een week schelen?",
      "Wist je dat oestrogeen, naast je cyclus, ook een rol speelt bij de opbouw van botweefsel?",
    ],
  },
  ovulatie: {
    phase: "ovulatie",
    hormonalSummary:
      "Rond het midden van je cyclus bereikt oestrogeen een piek. Dat veroorzaakt een korte, sterke stijging van luteïniserend hormoon (LH) — het signaal voor de eisprong: het vrijkomen van een rijpe eicel.",
    bodySummary:
      "Eén van je eierstokken laat die eicel los; via de eileider reist hij richting je baarmoeder. Dit is het meest vruchtbare moment van je cyclus.",
    whyExplainer:
      "De piek in oestrogeen rond de eisprong wordt door veel vrouwen in verband gebracht met een kort gevoel van meer energie of zelfvertrouwen — al verschilt de intensiteit hiervan sterk per persoon.",
    changes: [
      { emoji: "🔋", label: "Energie", text: "Veel vrouwen voelen zich rond de eisprong tijdelijk energieker.", highlight: true },
      { emoji: "🌀", label: "Buikgevoel", text: "Een lichte, kortdurende steek aan één kant van je onderbuik komt bij sommige vrouwen voor rond de eisprong.", highlight: true },
      { emoji: "💭", label: "Stemming", text: "Zelfvertrouwen en sociale energie kunnen voor sommige vrouwen rond dit moment toenemen.", highlight: true },
      { emoji: "❤️", label: "Libido", text: "Interesse in intimiteit piekt voor veel vrouwen rond de eisprong.", highlight: true },
      { emoji: "🌡️", label: "Lichaamstemperatuur", text: "Je basale lichaamstemperatuur stijgt met een fractie van een graad vlak na de eisprong." },
      { emoji: "✨", label: "Huid", text: "Je huid kan er rond dit moment stralender uitzien." },
      { emoji: "🎯", label: "Concentratie", text: "Sommige vrouwen ervaren rond dit moment extra alertheid of scherpte." },
      { emoji: "🤍", label: "Borsten", text: "Lichte gevoeligheid van de borsten komt bij sommige vrouwen rond de eisprong voor." },
      { emoji: "😴", label: "Slaap", text: "Slaap blijft voor de meeste vrouwen in deze korte fase redelijk stabiel." },
      { emoji: "⚡", label: "Stressgevoeligheid", text: "Veel vrouwen voelen zich in deze fase veerkrachtig, al is dit persoonlijk." },
    ],
    normalNote:
      "Niet iedere vrouw merkt haar eisprong fysiek op. Sommige vrouwen voelen een lichte steek aan één kant (in de volksmond ook wel 'mittelschmerz', Duits voor 'middenpijn'), anderen merken helemaal niets — beide is normaal.",
    attentionNote:
      "Voelt dit als een energieke dag voor jou? Dan kan het een fijn moment zijn voor iets actiefs of sociaals. Voelt het anders? Dan is dat evengoed prima — dit is geen vaste regel.",
    funFacts: [
      "Wist je dat een losgekomen eicel ongeveer 12 tot 24 uur bevruchtbaar is?",
      "Wist je dat 'mittelschmerz' de term is voor de lichte steek die sommige vrouwen rond de eisprong voelen?",
      "Wist je dat je basale lichaamstemperatuur na de eisprong met slechts een fractie van een graad stijgt — meetbaar, maar niet voelbaar?",
    ],
  },
  luteaal: {
    phase: "luteaal",
    hormonalSummary:
      "Na de eisprong verandert het overgebleven follikelweefsel in het 'gele lichaam' (corpus luteum), dat progesteron aanmaakt. Dit hormoon bereidt je baarmoederslijmvlies voor op een mogelijke zwangerschap.",
    bodySummary:
      "Blijft bevruchting uit, dan dalen progesteron en oestrogeen weer richting het einde van deze fase — dat is het signaal voor je lichaam om de volgende menstruatie te starten.",
    whyExplainer:
      "De stijging van progesteron, gevolgd door de daling ervan richting het einde van deze fase, hangt bij sommige vrouwen samen met wisselingen in energie, stemming en slaap — vaak aangeduid als PMS-achtige gevoelens.",
    changes: [
      { emoji: "🔋", label: "Energie", text: "Richting het einde van deze fase kan je energie geleidelijk afnemen.", highlight: true },
      { emoji: "💭", label: "Stemming", text: "Stemmingswisselingen komen bij sommige vrouwen vaker voor in de dagen voor de menstruatie.", highlight: true },
      { emoji: "🍽️", label: "Honger/eetlust", text: "Meer trek, met name in zoet of hartig eten, is een veelvoorkomende ervaring in deze fase.", highlight: true },
      { emoji: "😴", label: "Slaap", text: "Slaap kan wat wisselender aanvoelen naarmate deze fase vordert.", highlight: true },
      { emoji: "🌀", label: "Buikgevoel", text: "Een opgeblazen gevoel komt bij sommige vrouwen voor, vaak door vochtretentie." },
      { emoji: "🤍", label: "Borsten", text: "Gevoelige of gespannen borsten komen bij sommige vrouwen voor in deze fase." },
      { emoji: "🤕", label: "Hoofdpijn", text: "Hoofdpijn wordt door sommige vrouwen vaker gemeld in de dagen voor de menstruatie." },
      { emoji: "⚡", label: "Stressgevoeligheid", text: "Kleine stressoren kunnen in deze fase soms zwaarder aanvoelen dan anders." },
      { emoji: "✨", label: "Huid", text: "Onzuiverheden komen bij sommige vrouwen vaker voor richting het einde van deze fase." },
      { emoji: "🎯", label: "Concentratie", text: "Focus vasthouden kan voor sommige vrouwen wat meer moeite kosten richting het einde van deze fase." },
    ],
    normalNote:
      "Niet iedere vrouw ervaart klachten in deze fase, en de mate waarin verschilt sterk. Aanhoudende, zware klachten die je dagelijks leven flink beïnvloeden zijn het overleggen met een arts of zorgverlener waard.",
    attentionNote:
      "Richting het einde van deze fase kan een iets rustiger tempo, voldoende slaap en aandacht voor je basisbehoeften net dat beetje verschil maken. Er is geen 'moeten' bij — alleen wat voor jou fijn voelt.",
    funFacts: [
      "Wist je dat 'luteaal' is afgeleid van het gele lichaam (corpus luteum), het overblijfsel van de follikel na de eisprong?",
      "Wist je dat progesteron naast je cyclus ook een licht kalmerend effect op het zenuwstelsel kan hebben?",
      "Wist je dat deze fase qua lengte meestal stabieler is dan de folliculaire fase — vaak rond de 12 tot 14 dagen?",
    ],
  },
}

export function getPhaseKnowledge(phase: CyclePhase): PhaseKnowledge {
  return PHASE_KNOWLEDGE[phase]
}
