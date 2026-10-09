import { AFFIRMATIONS } from "@/lib/data/affirmations"

/**
 * The evening affirmation for "Even afronden" on Vandaag.
 *
 * Deliberately NOT a second exercise: no input, no score, no “doe dit”.
 * One short, grounded sentence that helps the day land — restful or gently
 * reflective. Tone matches product vision: warm and human, never zweverig
 * or betuttelend.
 *
 * Seeded by date so the same day always shows the same line, and
 * consecutive days rotate through the pool.
 */

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

/** Short evening affirmation for the day-close moment — grounded, not pushy. */
export function getEveningAffirmation(date: string): string {
  const pool = AFFIRMATIONS.filter((a) => EVENING_AFFIRMATION_THEMES.has(a.theme))
  const list = pool.length ? pool : AFFIRMATIONS
  return list[daySeed(`${date}-evening`) % list.length].text
}
