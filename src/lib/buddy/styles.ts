/**
 * Shared types and pure helpers for the optional Buddy tone-of-voice
 * preference (profiles.buddy_styles) and message-frequency preference
 * (profiles.buddy_message_frequency). Kept separate from the content pools
 * themselves so onboarding, profile, content selection and the chat prompt
 * can all import the same small vocabulary without circular imports.
 */

export type BuddyStyle =
  | "liefdevol"
  | "humor"
  | "spiritueel"
  | "motiverend"
  | "informatief"
  | "rustig"
  | "direct"
  | "luchtig"

export type BuddyFrequency = "elke_dag" | "paar_keer_per_week" | "alleen_relevant" | "uit"

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
 * Deterministically picks one of her selected styles for "today" — so a
 * "Liefdevol + Humor" combo actually alternates between the two rather than
 * always leaning on one. Returns null when she has no preference set, so
 * callers can fall back to the existing neutral tone.
 */
export function pickStyleForToday(seed: string, preferredStyles: string[]): BuddyStyle | null {
  if (preferredStyles.length === 0) return null
  return preferredStyles[seededIndex(`${seed}-style-pick`, preferredStyles.length)] as BuddyStyle
}

/**
 * Whether to show a passive/ambient Buddy message today (daily quote card,
 * "even onthouden" moments) — deliberately separate from the explicit,
 * per-item `reminders` schedule, which she configures precisely herself.
 * `isRelevant` should reflect whether there's something specific to say
 * right now (e.g. a recognized symptom pattern); only used for
 * "alleen_relevant". An unset preference behaves like "elke_dag" — today's
 * existing behavior — so nobody sees a change unless she opts in.
 */
export function shouldShowBuddyMessage(seed: string, frequency: string | null, isRelevant: boolean): boolean {
  switch (frequency) {
    case "uit":
      return false
    case "alleen_relevant":
      return isRelevant
    case "paar_keer_per_week":
      // Roughly 4 of every 7 days, deterministic per day so it doesn't
      // flicker on/off across reloads.
      return seededIndex(`${seed}-freq-gate`, 7) < 4
    case "elke_dag":
    default:
      return true
  }
}
