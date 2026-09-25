import type { CyclePhase } from "@/lib/cycle/estimate"

/**
 * Content for the daily "Buddy"-quote card on Vandaag — a short, warm
 * message that isn't always about motivation. Deliberately a static,
 * hand-curated pool (like phase-content.ts) rather than a database table:
 * this is editorial copy the app ships with, not user data, so it doesn't
 * need a migration to grow — just add a line here.
 *
 * Phase-tagged entries are mixed subtly into the daily pool rather than
 * always shown — the Buddy notices your cycle, it doesn't lecture about it.
 */

export type BuddyQuoteCategory =
  | "positief"
  | "motivatie"
  | "weetje"
  | "herkenbaar"
  | "tip"
  | "bemoedigend"
  | "luchtig"

export interface BuddyQuote {
  emoji: string
  text: string
  category: BuddyQuoteCategory
  /** When set, this quote fits especially well in these phases. */
  phases?: CyclePhase[]
}

const GENERAL_QUOTES: BuddyQuote[] = [
  { emoji: "🌿", text: "Je hoeft vandaag niet perfect te zijn. Goed genoeg is ook goed.", category: "positief" },
  { emoji: "✨", text: "Klein succesje geteld is ook een succesje.", category: "positief" },
  { emoji: "🫶", text: "Wat je vandaag ook voelt — het is oké dat het er is.", category: "positief" },
  { emoji: "🌱", text: "Je lijf werkt de hele dag door voor je, ook als je er niet bij stilstaat.", category: "positief" },
  { emoji: "🧘‍♀️", text: "Rust nemen is geen luxe, het is onderhoud.", category: "positief" },

  { emoji: "💪", text: "Je hebt al zoveel dagen doorstaan waarvan je dacht dat het niet zou lukken.", category: "motivatie" },
  { emoji: "🔥", text: "Elke kleine stap telt mee, ook als niemand hem ziet.", category: "motivatie" },
  { emoji: "🚶‍♀️", text: "Je hoeft niet te rennen. Lopen in jouw tempo brengt je ook vooruit.", category: "motivatie" },
  { emoji: "🌤️", text: "Vandaag is een nieuwe kans om iets kleins voor jezelf te doen.", category: "motivatie" },
  { emoji: "🎯", text: "Consistentie klopt niet met perfectie — vaak genoeg is genoeg.", category: "motivatie" },

  { emoji: "🧠", text: "Wist je dat je lichaamstemperatuur licht schommelt gedurende je cyclus?", category: "weetje" },
  { emoji: "💧", text: "Wist je dat je vochtbehoefte kan meebewegen met hoe actief je bent, niet alleen met het weer?", category: "weetje" },
  { emoji: "😴", text: "Wist je dat slaap een van de grootste hefbomen is voor hoe je je overdag voelt?", category: "weetje" },
  { emoji: "🩸", text: "Wist je dat de gemiddelde cyclusduur ergens tussen de 21 en 35 dagen ligt — en dat allebei heel normaal kan zijn?", category: "weetje" },
  { emoji: "🍫", text: "Wist je dat trek in iets zoets niet per se een teken van 'zwak zijn' is, maar gewoon iets is wat veel mensen ervaren?", category: "weetje" },
  { emoji: "🚶", text: "Wist je dat een korte wandeling al kan bijdragen aan een helderder hoofd?", category: "weetje" },

  { emoji: "🫠", text: "Sommige dagen voelt alles zwaarder dan het is. Dat is geen falen, dat is een dag.", category: "herkenbaar" },
  { emoji: "🙃", text: "Je hoeft niet elke dag evenveel energie te hebben — dat is niemand gegeven.", category: "herkenbaar" },
  { emoji: "😅", text: "Een dag zonder to-do-lijstje afvinken is ook een geldige dag.", category: "herkenbaar" },
  { emoji: "🛋️", text: "Soms is 'niets doen' precies het juiste om te doen.", category: "herkenbaar" },
  { emoji: "📵", text: "Het is oké om vandaag even niet overal 'ja' op te zeggen.", category: "herkenbaar" },

  { emoji: "💡", text: "Zet een glas water binnen handbereik — kleine gewoontes maken vaak het verschil.", category: "tip" },
  { emoji: "🪟", text: "Even daglicht opzoeken, ook maar vijf minuten, kan al net dat beetje energie geven.", category: "tip" },
  { emoji: "📝", text: "Schrijf één ding op waar je vandaag blij van werd, hoe klein ook.", category: "tip" },
  { emoji: "🫁", text: "Drie rustige, diepe ademhalingen kunnen al helpen om een moment te resetten.", category: "tip" },
  { emoji: "⏰", text: "Zet vanavond je scherm iets eerder weg — je lichaam zal het je morgen danken.", category: "tip" },

  { emoji: "🌷", text: "Je doet het beter dan je van jezelf denkt.", category: "bemoedigend" },
  { emoji: "🤍", text: "Wat er ook speelt vandaag — je hoeft het niet alleen te dragen.", category: "bemoedigend" },
  { emoji: "🌈", text: "Moeilijke dagen zijn ook maar dagen. Ze gaan voorbij.", category: "bemoedigend" },
  { emoji: "🕊️", text: "Je bent toegestaan om trots te zijn op iets kleins.", category: "bemoedigend" },
  { emoji: "🌻", text: "Vergelijk je binnenkant niet met ieders buitenkant.", category: "bemoedigend" },

  { emoji: "🐢", text: "Traag is ook een snelheid.", category: "luchtig" },
  { emoji: "☕", text: "Soms is de beste planning: koffie, en dan verder zien.", category: "luchtig" },
  { emoji: "🧦", text: "Twee verschillende sokken aan is geen crisis, gewoon een vibe.", category: "luchtig" },
  { emoji: "🎧", text: "Een goed liedje kan een matige dag zomaar net iets beter maken.", category: "luchtig" },
  { emoji: "🐌", text: "Je hoeft vandaag geen slak in te halen. Geniet van het tempo.", category: "luchtig" },
]

const PHASE_QUOTES: BuddyQuote[] = [
  { emoji: "🌙", text: "Extra rust nemen deze dagen is geen luxe — het past gewoon bij deze fase.", category: "tip", phases: ["menstruatie"] },
  { emoji: "🫖", text: "Iets warms drinken en het rustiger aan doen: helemaal oké vandaag.", category: "positief", phases: ["menstruatie"] },
  { emoji: "🧣", text: "Als je lichaam om zachtheid vraagt deze dagen, mag je daar gehoor aan geven.", category: "bemoedigend", phases: ["menstruatie"] },

  { emoji: "🌤️", text: "Merk je wat meer energie deze dagen? Een fijn moment om iets nieuws te proberen.", category: "motivatie", phases: ["folliculair"] },
  { emoji: "📋", text: "Veel mensen plannen graag in deze fase — misschien is dit een goed moment om je week te bekijken.", category: "tip", phases: ["folliculair"] },
  { emoji: "🌼", text: "Frisse energie, frisse start — volg het tempo dat bij jou past.", category: "positief", phases: ["folliculair"] },

  { emoji: "⚡", text: "Voelt dit als een sterke dag? Benut het waar het kan.", category: "motivatie", phases: ["ovulatie"] },
  { emoji: "🎤", text: "Sommige mensen voelen zich rond nu socialer of zelfverzekerder — herken je dat?", category: "weetje", phases: ["ovulatie"] },
  { emoji: "🌟", text: "Een piekmoment voelen mag gevierd worden, groot of klein.", category: "positief", phases: ["ovulatie"] },

  { emoji: "🍂", text: "Als je merkt dat je lichaam iets rustiger aan wil, is dat de moeite waard om te volgen.", category: "herkenbaar", phases: ["luteaal"] },
  { emoji: "🥜", text: "Magnesiumrijke snacks zoals noten kunnen in deze fase een fijne toevoeging zijn.", category: "tip", phases: ["luteaal"] },
  { emoji: "🕯️", text: "Wat extra zachtheid voor jezelf past goed bij deze periode van je cyclus.", category: "bemoedigend", phases: ["luteaal"] },
]

export const BUDDY_QUOTES: BuddyQuote[] = [...GENERAL_QUOTES, ...PHASE_QUOTES]

function seededIndex(seed: string, length: number): number {
  if (length <= 0) return 0
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % length
}

/**
 * Picks today's quote, seeded by user + date so it's stable across a page's
 * re-renders/reloads but rotates daily and differs between people. Roughly
 * 1 in 4 days pulls from the (small) phase-matched pool when a phase is
 * known — enough to feel like the Buddy notices, not so much that every
 * period day gets the same "take it easy" message.
 */
export function getDailyBuddyQuote(seed: string, phase: CyclePhase | null): BuddyQuote {
  const phaseMatches = phase ? PHASE_QUOTES.filter((q) => q.phases?.includes(phase)) : []
  const usePhaseQuote = phaseMatches.length > 0 && seededIndex(`${seed}-phase-gate`, 4) === 0
  const pool = usePhaseQuote ? phaseMatches : GENERAL_QUOTES
  return pool[seededIndex(seed, pool.length)]
}
