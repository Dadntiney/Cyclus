import { AFFIRMATIONS } from "@/lib/data/affirmations"

/**
 * Soft evening lines shown only after she marks the day closed.
 *
 * Deliberately NOT a second exercise: no input, no score, no “doe dit”.
 * One short, grounded sentence that helps the day land — gratitude-adjacent,
 * restful, or gently reflective. Tone matches product vision: warm and human,
 * never zweverig or betuttelend.
 *
 * Seeded by date so the same day always shows the same line, and consecutive
 * days rotate through the pool.
 */

const DAY_CLOSE_LINES = [
  "Wat er vandaag ook speelde — je mag het hier even laten liggen.",
  "Eén ding dat vandaag oké was, is al genoeg om bij stil te staan.",
  "Je hoeft vanavond niets meer goed te maken.",
  "Rust is ook een vorm van voor jezelf zorgen.",
  "Morgen mag opnieuw beginnen. Vanavond mag het stil worden.",
  "Je lichaam heeft vandaag hard gewerkt. Dank je, lichaam.",
  "Niet alles hoeft af voor je mag stoppen.",
  "Een zachte ademhaling is soms al een hele avondroutine.",
  "Je hebt vandaag genoeg gedaan — ook als het zo niet voelde.",
  "Laat de dag los zoals je een jas ophangt: klaar voor later.",
  "Kleine dingen tellen mee. Ook vandaag.",
  "Je mag trots zijn op iets kleins van vandaag.",
  "Geen checklist meer. Alleen jij, even.",
  "Wat je vandaag voelde, mag er geweest zijn.",
  "Welterusten aan alles wat nog open staat — morgen is er weer.",
  "Even niets hoeven. Dat is ook een plan.",
  "Je bent meer dan wat je vandaag hebt afgevinkt.",
  "Sluit de dag met zachtheid, niet met een oordeel.",
  "Dankbaar mag ook iets heel kleins zijn.",
  "De dag is rond. Jij mag nu ook.",
] as const

const EVENING_AFFIRMATION_THEMES = new Set([
  "rust",
  "loslaten",
  "zelfcompassie",
  "energie",
  "moeilijke_dagen",
])

function daySeed(date: string): number {
  // Stable hash of YYYY-MM-DD — same day → same line, no flicker on refresh.
  let hash = 0
  for (let i = 0; i < date.length; i++) {
    hash = (hash * 31 + date.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function getDayCloseLine(date: string): string {
  return DAY_CLOSE_LINES[daySeed(date) % DAY_CLOSE_LINES.length]
}

/** Short evening affirmation for the day-close moment — grounded, not pushy. */
export function getEveningAffirmation(date: string): string {
  const pool = AFFIRMATIONS.filter((a) => EVENING_AFFIRMATION_THEMES.has(a.theme))
  const list = pool.length ? pool : AFFIRMATIONS
  return list[daySeed(`${date}-evening`) % list.length].text
}
