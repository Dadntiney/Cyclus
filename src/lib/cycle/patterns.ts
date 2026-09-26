import { differenceInCalendarDays, parseISO } from "date-fns"
import { classifyPhase, type CyclePhase } from "@/lib/cycle/estimate"
import type { CycleHistoryEntry } from "@/lib/cycle/history"

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
  return `Je gaf bij ${cycleWord} cycli vaker "${insight.symptom.toLowerCase()}" aan rond de ${phaseLabel.toLowerCase()} — mogelijk een patroon dat bij jou past.`
}
