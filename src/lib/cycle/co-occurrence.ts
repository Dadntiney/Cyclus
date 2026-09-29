import { symptomLabel } from "@/lib/constants"

/**
 * Symptom co-occurrence: when she logs A, does B often show up the same day?
 * The "één zin die klopt" moment on Vandaag — "als jij stress noteert, komt
 * hoofdpijn bij jou vaker mee" — only fires when the conditional rate clears
 * a real bar, so ordinary coincidence stays silent.
 */

export interface CheckinSymptoms {
  date: string
  symptoms: string[]
}

export interface SymptomCoOccurrence {
  trigger: string
  companion: string
  /** Days where both appeared together. */
  togetherDays: number
  /** Days where the trigger appeared (with or without companion). */
  triggerDays: number
  /** togetherDays / triggerDays */
  rate: number
}

const IGNORED = new Set(["Geen klachten", "Anders"])
const MIN_TRIGGER_DAYS = 4
const MIN_TOGETHER = 3
const MIN_RATE = 0.55

function clean(symptoms: string[]): string[] {
  return [...new Set(symptoms.filter((s) => s && !IGNORED.has(s)))]
}

/**
 * @param checkins Daily check-ins with logged symptoms, any order.
 * Returns strongest pairs first (rate, then together count).
 */
export function computeSymptomCoOccurrences(checkins: CheckinSymptoms[]): SymptomCoOccurrence[] {
  // trigger -> companion -> { together, triggerDays tracked separately }
  const together = new Map<string, Map<string, number>>()
  const triggerDays = new Map<string, number>()

  for (const checkin of checkins) {
    const symptoms = clean(checkin.symptoms)
    if (symptoms.length < 2) {
      // Still count single-symptom days toward triggerDays so the
      // conditional rate isn't inflated by only looking at multi-symptom days.
      for (const s of symptoms) {
        triggerDays.set(s, (triggerDays.get(s) ?? 0) + 1)
      }
      continue
    }

    for (const trigger of symptoms) {
      triggerDays.set(trigger, (triggerDays.get(trigger) ?? 0) + 1)
      let companions = together.get(trigger)
      if (!companions) {
        companions = new Map()
        together.set(trigger, companions)
      }
      for (const companion of symptoms) {
        if (companion === trigger) continue
        companions.set(companion, (companions.get(companion) ?? 0) + 1)
      }
    }
  }

  const results: SymptomCoOccurrence[] = []
  for (const [trigger, companions] of together) {
    const tDays = triggerDays.get(trigger) ?? 0
    if (tDays < MIN_TRIGGER_DAYS) continue
    for (const [companion, count] of companions) {
      if (count < MIN_TOGETHER) continue
      const rate = count / tDays
      if (rate < MIN_RATE) continue
      results.push({ trigger, companion, togetherDays: count, triggerDays: tDays, rate })
    }
  }

  return results.sort(
    (a, b) => b.rate - a.rate || b.togetherDays - a.togetherDays || a.trigger.localeCompare(b.trigger),
  )
}

/** Strongest co-occurrence whose trigger appears in today's symptoms, if any. */
export function getCoOccurrenceForToday(
  pairs: SymptomCoOccurrence[],
  todaySymptoms: string[],
): SymptomCoOccurrence | null {
  const today = new Set(clean(todaySymptoms))
  if (!today.size) return null
  return pairs.find((p) => today.has(p.trigger) && !today.has(p.companion)) ?? null
}

export function formatCoOccurrenceInsight(pair: SymptomCoOccurrence): string {
  const trigger = symptomLabel(pair.trigger).toLowerCase()
  const companion = symptomLabel(pair.companion).toLowerCase()
  return `Als je "${trigger}" noteert, komt "${companion}" bij jou vaker mee.`
}
