import { addDays, format } from "date-fns"
import { symptomLabel } from "@/lib/constants"
import { estimateCycle, phaseLabel, type CyclePhase } from "@/lib/cycle/estimate"
import type { PhaseSymptomInsight } from "@/lib/cycle/patterns"

/**
 * Vooruitkijken — "Ik zie je aankomen".
 *
 * Looks 1–3 days ahead for the moment she *enters* a cycle phase where her
 * own history shows a recurring symptom pattern. Deliberately silent while
 * she is already inside that phase (today's body-recognition covers that)
 * and silent when history isn't strong enough — fewer false alarms beat a
 * louder, wronger coach.
 */

export const ANTICIPATION_HORIZON_DAYS = 3

/** How many days of the newly entered phase we soft-tilt in the week plan. */
export const ANTICIPATION_SOFT_WINDOW_DAYS = 3

export interface Anticipation {
  /** First day of the anticipated harder stretch (ISO). */
  startDate: string
  /** Inclusive end of the soft window we expose to the week plan (ISO). */
  endDate: string
  /** 1 = tomorrow, 2 = day after, … */
  daysAhead: number
  phase: CyclePhase
  phaseLabel: string
  primarySymptom: string
  cyclesWithSymptom: number
  cyclesConsidered: number
  headline: string
  body: string
  /** Dates to soft-tilt (upcoming only, within the soft window). */
  softDates: string[]
}

export interface ComposeAnticipationInput {
  lastPeriodStart: string | null
  averageCycleLength: number | null
  hasCycle: boolean
  /** All phase×symptom insights (any phase), strongest first. */
  phaseInsights: PhaseSymptomInsight[]
  today?: Date
  horizonDays?: number
  softWindowDays?: number
}

function whenLabel(daysAhead: number): string {
  if (daysAhead === 1) return "Morgen"
  if (daysAhead === 2) return "Overmorgen"
  return "Over een paar dagen"
}

function topInsightByPhase(insights: PhaseSymptomInsight[]): Map<CyclePhase, PhaseSymptomInsight> {
  const map = new Map<CyclePhase, PhaseSymptomInsight>()
  for (const insight of insights) {
    if (!map.has(insight.phase)) map.set(insight.phase, insight)
  }
  return map
}

function iso(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

/**
 * Returns at most one anticipation signal: the soonest phase-entry in the
 * horizon that matches a known personal pattern.
 */
export function composeAnticipation(input: ComposeAnticipationInput): Anticipation | null {
  const {
    lastPeriodStart,
    averageCycleLength,
    hasCycle,
    phaseInsights,
    today = new Date(),
    horizonDays = ANTICIPATION_HORIZON_DAYS,
    softWindowDays = ANTICIPATION_SOFT_WINDOW_DAYS,
  } = input

  if (!hasCycle || !lastPeriodStart || !averageCycleLength || !phaseInsights.length) {
    return null
  }

  const todayNoon = new Date(`${iso(today)}T12:00:00`)
  const todayEstimate = estimateCycle(lastPeriodStart, averageCycleLength, hasCycle, todayNoon)
  if (!todayEstimate) return null

  const byPhase = topInsightByPhase(phaseInsights)

  for (let offset = 1; offset <= horizonDays; offset++) {
    const day = addDays(todayNoon, offset)
    const estimate = estimateCycle(lastPeriodStart, averageCycleLength, hasCycle, day)
    if (!estimate) continue

    const insight = byPhase.get(estimate.phase)
    if (!insight) continue

    const previous = estimateCycle(
      lastPeriodStart,
      averageCycleLength,
      hasCycle,
      addDays(todayNoon, offset - 1),
    )
    // Only fire on the day she *enters* the patterned phase — not every day
    // she spends inside it.
    if (!previous || previous.phase === estimate.phase) continue

    const startDate = iso(day)
    const softDates: string[] = []
    for (let w = 0; w < softWindowDays; w++) {
      const softDay = addDays(day, w)
      const softEstimate = estimateCycle(lastPeriodStart, averageCycleLength, hasCycle, softDay)
      if (!softEstimate || softEstimate.phase !== estimate.phase) break
      softDates.push(iso(softDay))
    }
    if (!softDates.length) softDates.push(startDate)

    const label = phaseLabel(estimate.phase)
    const symptom = symptomLabel(insight.symptom).toLowerCase()
    const cycleWord =
      insight.cyclesWithSymptom === insight.cyclesConsidered
        ? "al je laatste"
        : `${insight.cyclesWithSymptom} van je laatste ${insight.cyclesConsidered}`

    return {
      startDate,
      endDate: softDates[softDates.length - 1],
      daysAhead: offset,
      phase: estimate.phase,
      phaseLabel: label,
      primarySymptom: insight.symptom,
      cyclesWithSymptom: insight.cyclesWithSymptom,
      cyclesConsidered: insight.cyclesConsidered,
      headline: `${whenLabel(offset)} valt vaak zwaarder bij jou`,
      body: `In ${cycleWord} cycli kwam "${symptom}" vaker terug rond de ${label.toLowerCase()}. Geen voorspelling dat het zo moet gaan — wel iets om zacht rekening mee te houden.`,
      softDates,
    }
  }

  return null
}
