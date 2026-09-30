import type { BodyChangeItem } from "@/lib/cycle/phase-knowledge"

/**
 * Educational content on how the cycle can change with age and what
 * perimenopause commonly involves — the "Cyclus & ouder worden" page
 * (/cyclus/overgang). Same content rules as phase-knowledge.ts: hedged
 * phrasing, medical terms explained inline, never a diagnosis.
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
    "Vanaf ergens in de dertiger of veertiger jaren kan je cyclus geleidelijk gaan veranderen. Dat is een normale levensfase, geen probleem dat opgelost moet worden — en het verloopt bij iedere vrouw weer anders. Wat je merkt, mag serieus genomen worden zonder dat het meteen ‘medisch’ hoeft te klinken.",
  ageChanges: [
    {
      heading: "Je cyclusduur kan gaan variëren",
      text: "Waar je cyclus eerder misschien vrij voorspelbaar was, kan de duur nu per cyclus wat meer wisselen — soms korter, soms langer, en af en toe sla je er misschien een over. Dat kan verwarrend voelen als je gewend was aan een vast ritme; het zegt vaak meer over hormonale schommelingen dan over iets wat je ‘fout’ doet.",
    },
    {
      heading: "Je hormonen schommelen onvoorspelbaarder",
      text: "Oestrogeen en progesteron, de twee hormonen die je cyclus grotendeels sturen, kunnen sterker op en neer gaan dan voorheen — dat kan verklaren waarom klachten soms heftiger of juist milder aanvoelen dan je gewend was. Ook slaap, stemming en energie kunnen daardoor van week tot week meer wisselen.",
    },
    {
      heading: "Je eicelvoorraad neemt geleidelijk af",
      text: "Je wordt geboren met alle eicellen die je ooit zult hebben; dat aantal neemt geleidelijk af naarmate je ouder wordt. Dit hangt samen met de andere veranderingen, maar zegt niets over hoe je je voelt, hoe ‘fit’ je bent, of wie je bent. Het is biologie — geen oordeel.",
    },
    {
      heading: "Herstel en basiszorg wegen zwaarder",
      text: "Veel vrouwen merken dat slaap, vocht, voeding en rust in deze levensfase nóg meer verschil maken. Niet omdat je ‘zwakker’ bent, maar omdat je lichaam harder werkt om schommelingen op te vangen. Kleine stevige gewoontes tellen vaak meer dan grote beloftes.",
    },
  ],
  whatIsPerimenopause:
    "De overgang (perimenopauze) is de fase rondom je laatste menstruaties. De menopauze zelf is die laatste menstruatie — je weet het pas achteraf, als je 12 maanden zonder menstruatie bent geweest. Perimenopauze kan meerdere jaren duren (bij veel vrouwen ongeveer 4 tot 8 jaar, langer als het eerder begint) en is de periode waarin je hormonen geleidelijk veranderen. Je kunt dus nog menstrueren én al overgangsklachten merken; dat sluit elkaar niet uit.",
  signals: [
    {
      label: "Onregelmatige cyclus",
      text: "Je cyclus kan onvoorspelbaarder worden qua lengte en hoeveelheid bloedverlies.",
      highlight: true,
    },
    {
      label: "Opvliegers",
      text: "Een plotselinge golf van warmte, vaak in het gezicht en bovenlichaam, komt bij veel vrouwen in deze fase voor.",
      highlight: true,
    },
    {
      label: "Nachtelijk zweten",
      text: "Opvliegers kunnen zich ’s nachts voordoen en je slaap verstoren — soms zonder dat je overdag veel merkt.",
      highlight: true,
    },
    {
      label: "Slaapproblemen",
      text: "Moeite met inslapen of doorslapen komt vaker voor, met of zonder nachtelijk zweten. Een koelere kamer en vaste bedtijden helpen sommige vrouwen.",
      highlight: true,
    },
    {
      label: "Stemmingswisselingen",
      text: "Sommige vrouwen merken dat ze sneller geïrriteerd, emotioneel of somber zijn dan voorheen — vaak in golven, niet constant.",
    },
    {
      label: "Concentratie en geheugen",
      text: "Woorden even kwijt zijn of moeite met focussen (‘brain fog’) wordt door sommige vrouwen in deze fase herkend.",
    },
    {
      label: "Huid en slijmvliezen",
      text: "Een drogere huid of droge slijmvliezen kunnen samenhangen met de dalende oestrogeenspiegel. Extra vocht drinken kan prettig aanvoelen, al lost het niet alles op.",
    },
    {
      label: "Libido",
      text: "Interesse in intimiteit kan afnemen, gelijk blijven of soms zelfs toenemen — dit verschilt sterk per vrouw.",
    },
    {
      label: "Lichaamssamenstelling",
      text: "Sommige vrouwen merken dat gewicht zich anders verdeelt dan voorheen, ook zonder dat hun leefstijl is veranderd.",
    },
  ],
  normalNote:
    "Sommige vrouwen merken in deze levensfase nauwelijks iets, anderen ervaren duidelijke klachten. Beide is normaal — er is geen ‘juiste’ manier om de overgang te ervaren, en de intensiteit en duur verschillen enorm van vrouw tot vrouw. Wat jij merkt, mag serieus genoeg zijn om zachtheid en ondersteuning te verdienen.",
  whenToTalkToDoctor:
    "Heb je hevige of aanhoudende opvliegers, ongewoon hevig of onregelmatig bloedverlies, klachten die je dagelijks functioneren flink beïnvloeden, of maak je je zorgen over wat je merkt? Dan is contact met een arts of andere zorgverlener een goede stap. Er bestaan behandelopties die kunnen helpen — dit hoef je niet alleen uit te zoeken. GoFiev is er om te herkennen en te ondersteunen, niet om een diagnose te stellen.",
  funFacts: [
    "Wist je dat de gemiddelde leeftijd voor de menopauze in Nederland rond de 51 jaar ligt, maar dat perimenopauze vaak al jaren eerder begint?",
    "Wist je dat opvliegers vaak worden toegeschreven aan hoe dalend oestrogeen het temperatuurregelcentrum in je hersenen beïnvloedt?",
    "Wist je dat perimenopauze en de klachten die erbij horen decennialang relatief weinig onderzocht zijn geweest — daar komt de laatste jaren gelukkig steeds meer aandacht voor?",
    "Wist je dat goede slaaphygiëne (vaste tijden, koel slapen, cafeïne beperken) voor veel vrouwen in deze fase een van de meest praktische steuntjes is?",
  ],
}
