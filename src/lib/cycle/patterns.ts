import { differenceInCalendarDays, parseISO } from "date-fns"
import { classifyPhase, type CyclePhase } from "@/lib/cycle/estimate"
import type { CycleHistoryEntry } from "@/lib/cycle/history"
import { symptomLabel } from "@/lib/constants"

/**
 * Phase-aware symptom patterns: instead of "Hoofdpijn — 5x in je
 * check-ins" (a flat total), this compares WHERE in each of her recent,
 * completed cycles a symptom showed up, so it can surface something like
 * "Je had de afgelopen 3 cycli vaker last van vermoeidheid in de luteale
 * fase" — the concrete example from the product brief. Only uses cycles
 * with a known length (i.e. a period was followed by another one), so the
 * still-ongoing current cycle is deliberately excluded: we don't yet know
 * its full length, and "de afgelopen cycli" should mean cycles that are
 * actually over.
 */

export interface CheckinLike {
  date: string
  symptoms: string[]
}

export interface PhaseSymptomInsight {
  phase: CyclePhase
  symptom: string
  /** In how many of the recent completed cycles considered this symptom showed up during this phase. */
  cyclesWithSymptom: number
  cyclesConsidered: number
}

const RECENT_CYCLES_WINDOW = 6
const IGNORED_SYMPTOMS = new Set(["Geen klachten", "Anders"])

function minCyclesForPattern(cyclesConsidered: number): number {
  return Math.max(2, Math.ceil(cyclesConsidered * 0.6))
}

/**
 * @param periods Completed-cycle history, oldest first (see computeCycleHistory).
 * @param checkins Daily check-ins with logged symptoms, any order.
 */
export function computePhaseSymptomInsights(
  periods: CycleHistoryEntry[],
  checkins: CheckinLike[],
): PhaseSymptomInsight[] {
  const completedCycles = periods
    .filter((p): p is CycleHistoryEntry & { cycleLength: number } => p.cycleLength !== null)
    .slice(-RECENT_CYCLES_WINDOW)

  if (completedCycles.length < 2) return []

  // (phase, symptom) -> set of cycle start-dates that showed it, so a
  // symptom logged on several days within the same phase of one cycle
  // still only counts as "1 cycle", not several.
  const seenByKey = new Map<string, Set<string>>()

  for (const checkin of checkins) {
    const relevantSymptoms = checkin.symptoms.filter((s) => !IGNORED_SYMPTOMS.has(s))
    if (!relevantSymptoms.length) continue

    const checkinDate = parseISO(checkin.date)
    const cycle = completedCycles.find((c) => {
      const start = parseISO(c.start)
      const dayIndex = differenceInCalendarDays(checkinDate, start)
      return dayIndex >= 0 && dayIndex < c.cycleLength
    })
    if (!cycle) continue

    const cycleDay = differenceInCalendarDays(checkinDate, parseISO(cycle.start)) + 1
    const phase = classifyPhase(cycleDay, cycle.cycleLength)

    for (const symptom of relevantSymptoms) {
      const key = `${phase}:${symptom}`
      const set = seenByKey.get(key) ?? new Set<string>()
      set.add(cycle.start)
      seenByKey.set(key, set)
    }
  }

  const cyclesConsidered = completedCycles.length
  const threshold = minCyclesForPattern(cyclesConsidered)

  const insights: PhaseSymptomInsight[] = []
  for (const [key, cycleSet] of seenByKey) {
    if (cycleSet.size < threshold) continue
    const [phase, symptom] = key.split(":") as [CyclePhase, string]
    insights.push({ phase, symptom, cyclesWithSymptom: cycleSet.size, cyclesConsidered })
  }

  return insights.sort((a, b) => b.cyclesWithSymptom - a.cyclesWithSymptom || a.symptom.localeCompare(b.symptom))
}

/** The single strongest pattern for a given phase, if any clears the bar. */
export function getTopPhaseSymptomInsight(
  insights: PhaseSymptomInsight[],
  phase: CyclePhase,
): PhaseSymptomInsight | null {
  return insights.find((i) => i.phase === phase) ?? null
}

export function formatPhaseSymptomInsight(insight: PhaseSymptomInsight, phaseLabel: string): string {
  const cycleWord = insight.cyclesWithSymptom === insight.cyclesConsidered ? "al je" : `${insight.cyclesWithSymptom} van je laatste ${insight.cyclesConsidered}`
  return `Je gaf bij ${cycleWord} cycli vaker "${symptomLabel(insight.symptom).toLowerCase()}" aan rond de ${phaseLabel.toLowerCase()} — mogelijk een patroon dat bij jou past.`
}

/**
 * Whether her cycle length is swinging more or less than before — the
 * "wordt mijn cyclus onregelmatiger, of juist stabieler?" question, most
 * relevant for the 30+/perimenopauze-doelgroep this app centers. Rather
 * than judging any single cycle length against "normal", this compares the
 * average month-to-month swing in cycle length across the earlier vs. more
 * recent half of her completed cycles: a genuine shift in variability, not
 * a guess dressed up as a number. Only reports a direction when that shift
 * clears MEANINGFUL_SWING_DELTA_DAYS, so ordinary noise (every cycle
 * varies a little) stays silent rather than reading as a "finding". The
 * still-ongoing current cycle is excluded, same as the phase/symptom
 * insights above.
 */
export type CycleLengthTrendDirection = "onregelmatiger" | "stabieler"

export interface CycleLengthTrendInsight {
  direction: CycleLengthTrendDirection
  cyclesConsidered: number
}

const TREND_WINDOW = 6
const MIN_CYCLES_FOR_TREND = 4
const MEANINGFUL_SWING_DELTA_DAYS = 2

function averageSwing(lengths: number[]): number {
  if (lengths.length < 2) return 0
  let total = 0
  for (let i = 1; i < lengths.length; i++) {
    total += Math.abs(lengths[i] - lengths[i - 1])
  }
  return total / (lengths.length - 1)
}

/** @param periods Completed-cycle history, oldest first (see computeCycleHistory). */
export function computeCycleLengthTrend(periods: CycleHistoryEntry[]): CycleLengthTrendInsight | null {
  const completedLengths = periods
    .filter((p): p is CycleHistoryEntry & { cycleLength: number } => p.cycleLength !== null)
    .slice(-TREND_WINDOW)
    .map((p) => p.cycleLength)

  if (completedLengths.length < MIN_CYCLES_FOR_TREND) return null

  const mid = Math.ceil(completedLengths.length / 2)
  const earlierSwing = averageSwing(completedLengths.slice(0, mid))
  const recentSwing = averageSwing(completedLengths.slice(mid))
  const delta = recentSwing - earlierSwing

  if (Math.abs(delta) < MEANINGFUL_SWING_DELTA_DAYS) return null

  return {
    direction: delta > 0 ? "onregelmatiger" : "stabieler",
    cyclesConsidered: completedLengths.length,
  }
}

export function formatCycleLengthTrendInsight(insight: CycleLengthTrendInsight): string {
  if (insight.direction === "onregelmatiger") {
    return `Op basis van je laatste ${insight.cyclesConsidered} cycli wisselt je cyclusduur de laatste tijd meer dan daarvoor — dit kan erop wijzen dat je cyclus op dit moment wat onregelmatiger is. Dat kan door allerlei dingen komen, zoals stress of je levensfase, en is geen diagnose — wel de moeite waard om in de gaten te houden.`
  }
  return `Op basis van je laatste ${insight.cyclesConsidered} cycli wisselt je cyclusduur de laatste tijd minder dan daarvoor — je cyclus lijkt op dit moment wat stabieler te verlopen.`
}
