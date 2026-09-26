import type { BodyChangeItem } from "@/lib/cycle/phase-knowledge"

/**
 * Educational content on how the cycle can change with age and what
 * perimenopause commonly involves — the "Cyclus & ouder worden" page
 * (/cyclus/overgang). Separate from phase-knowledge.ts (which is about a
 * single cycle's four phases): this content applies across cycles, over
 * months and years, which is a different timescale and a different kind of
 * explanation. Same content rules as phase-knowledge.ts: hedged phrasing,
 * medical terms explained inline, never a diagnosis.
 */

export interface LifeStageSection {
  heading: string
  text: string
}

export interface LifeStageKnowledge {
  intro: string
  ageChanges: LifeStageSection[]
  whatIsPerimenopause: string
  /** Reuses BodyChangeItem so the same list component (BodyChangeList) can render this. */
  signals: BodyChangeItem[]
  normalNote: string
  whenToTalkToDoctor: string
  funFacts: string[]
}

export const LIFE_STAGE_KNOWLEDGE: LifeStageKnowledge = {
  intro:
    "Vanaf ergens in de dertiger of veertiger jaren kan je cyclus geleidelijk gaan veranderen. Dat is een normale levensfase, geen probleem dat opgelost moet worden — en het verloopt bij iedere vrouw weer anders.",
  ageChanges: [
    {
      heading: "Je cyclusduur kan gaan variëren",
      text: "Waar je cyclus eerder misschien vrij voorspelbaar was, kan de duur nu per cyclus wat meer wisselen — soms korter, soms langer, en af en toe sla je er misschien een over.",
    },
    {
      heading: "Je hormonen schommelen onvoorspelbaarder",
      text: "Oestrogeen en progesteron, de twee hormonen die je cyclus grotendeels sturen, kunnen sterker op en neer gaan dan voorheen — dat kan verklaren waarom klachten soms heftiger of juist milder aanvoelen dan je gewend was.",
    },
    {
      heading: "Je eicelvoorraad neemt geleidelijk af",
      text: "Je wordt geboren met alle eicellen die je ooit zult hebben; dat aantal neemt geleidelijk af naarmate je ouder wordt. Dit hangt samen met de andere veranderingen, maar zegt niets over hoe je je voelt of wie je bent.",
    },
  ],
  whatIsPerimenopause:
    "De overgang (perimenopauze) is de fase vóór de menopauze, die officieel begint na 12 maanden zonder menstruatie. Perimenopauze kan meerdere jaren duren — vaak ergens tussen de 4 en 8 jaar — en is de periode waarin je hormonen geleidelijk veranderen richting die overgang.",
  signals: [
    { emoji: "🌀", label: "Onregelmatige cyclus", text: "Je cyclus kan onvoorspelbaarder worden qua lengte en hoeveelheid bloedverlies.", highlight: true },
    { emoji: "🔥", label: "Opvliegers", text: "Een plotselinge golf van warmte, vaak in het gezicht en bovenlichaam, komt bij veel vrouwen in deze fase voor.", highlight: true },
    { emoji: "🌙", label: "Nachtelijk zweten", text: "Opvliegers kunnen zich 's nachts voordoen en je slaap verstoren.", highlight: true },
    { emoji: "😴", label: "Slaapproblemen", text: "Moeite met inslapen of doorslapen komt vaker voor, met of zonder nachtelijk zweten.", highlight: true },
    { emoji: "💭", label: "Stemmingswisselingen", text: "Sommige vrouwen merken dat ze sneller geïrriteerd, emotioneel of somber zijn dan voorheen." },
    { emoji: "🎯", label: "Concentratie en geheugen", text: "Woorden even kwijt zijn of moeite met focussen ('brain fog') wordt door sommige vrouwen in deze fase herkend." },
    { emoji: "✨", label: "Huid en slijmvliezen", text: "Een drogere huid of droge slijmvliezen kunnen samenhangen met de dalende oestrogeenspiegel." },
    { emoji: "❤️", label: "Libido", text: "Interesse in intimiteit kan afnemen, gelijk blijven of soms zelfs toenemen — dit verschilt sterk per vrouw." },
    { emoji: "⚖️", label: "Lichaamssamenstelling", text: "Sommige vrouwen merken dat gewicht zich anders verdeelt dan voorheen, ook zonder dat hun leefstijl is veranderd." },
  ],
  normalNote:
    "Sommige vrouwen merken in deze levensfase nauwelijks iets, anderen ervaren duidelijke klachten. Beide is normaal — er is geen 'juiste' manier om de overgang te ervaren, en de intensiteit en duur verschillen enorm van vrouw tot vrouw.",
  whenToTalkToDoctor:
    "Heb je hevige of aanhoudende opvliegers, ongewoon hevig of onregelmatig bloedverlies, klachten die je dagelijks functioneren flink beïnvloeden, of maak je je zorgen over wat je merkt? Dan is contact met een arts of andere zorgverlener een goede stap. Er bestaan behandelopties die kunnen helpen — dit hoef je niet alleen uit te zoeken.",
  funFacts: [
    "Wist je dat de gemiddelde leeftijd voor de menopauze in Nederland rond de 51 jaar ligt, maar dat perimenopauze vaak al jaren eerder begint?",
    "Wist je dat opvliegers vaak worden toegeschreven aan hoe dalend oestrogeen het temperatuurregelcentrum in je hersenen beïnvloedt?",
    "Wist je dat perimenopauze en de klachten die erbij horen decennialang relatief weinig onderzocht zijn geweest — daar komt de laatste jaren gelukkig steeds meer aandacht voor?",
  ],
}
