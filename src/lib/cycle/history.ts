import { differenceInCalendarDays, eachDayOfInterval, format, parseISO } from "date-fns"

export interface CycleLogEntry {
  date: string
  menstruation: boolean
  symptoms: string[]
  /** Optional flow intensity for the day — see cycle_logs.flow. */
  flow?: string | null
}

export interface PeriodEntry {
  start: string
  end: string
  days: number
  /**
   * The most-logged flow intensity across this period's days, or null when
   * nobody recorded one (flow tracking is opt-in — most periods won't have
   * this). Ties prefer the more intense value so nothing reads as lighter
   * than what was actually logged.
   */
  dominantFlow: string | null
}

export interface CycleHistoryEntry extends PeriodEntry {
  cycleLength: number | null
}

const FLOW_INTENSITY_RANK: Record<string, number> = { geen: 0, licht: 1, gemiddeld: 2, hevig: 3 }

function computeDominantFlow(flows: (string | null | undefined)[]): string | null {
  const counts = new Map<string, number>()
  for (const flow of flows) {
    if (!flow) continue
    counts.set(flow, (counts.get(flow) ?? 0) + 1)
  }
  if (!counts.size) return null

  let best: string | null = null
  let bestCount = -1
  for (const [flow, count] of counts) {
    const rank = FLOW_INTENSITY_RANK[flow] ?? 0
    const bestRank = best ? (FLOW_INTENSITY_RANK[best] ?? 0) : -1
    if (count > bestCount || (count === bestCount && rank > bestRank)) {
      best = flow
      bestCount = count
    }
  }
  return best
}

/**
 * Groups menstruation days into periods (consecutive calendar dates) and
 * derives the cycle length between one period's start and the next.
 */
export function computeCycleHistory(logs: CycleLogEntry[]): CycleHistoryEntry[] {
  const menstruationLogs = logs.filter((l) => l.menstruation).sort((a, b) => a.date.localeCompare(b.date))

  if (!menstruationLogs.length) return []

  const flowByDate = new Map(menstruationLogs.map((l) => [l.date, l.flow ?? null]))
  const menstruationDates = menstruationLogs.map((l) => l.date)

  const periods: PeriodEntry[] = []
  let periodStart = menstruationDates[0]
  let periodEnd = menstruationDates[0]
  let periodDates = [menstruationDates[0]]

  for (let i = 1; i < menstruationDates.length; i++) {
    const prev = parseISO(periodEnd)
    const current = parseISO(menstruationDates[i])
    if (differenceInCalendarDays(current, prev) <= 1) {
      periodEnd = menstruationDates[i]
      periodDates.push(menstruationDates[i])
    } else {
      periods.push({
        start: periodStart,
        end: periodEnd,
        days: differenceInCalendarDays(parseISO(periodEnd), parseISO(periodStart)) + 1,
        dominantFlow: computeDominantFlow(periodDates.map((d) => flowByDate.get(d))),
      })
      periodStart = menstruationDates[i]
      periodEnd = menstruationDates[i]
      periodDates = [menstruationDates[i]]
    }
  }
  periods.push({
    start: periodStart,
    end: periodEnd,
    days: differenceInCalendarDays(parseISO(periodEnd), parseISO(periodStart)) + 1,
    dominantFlow: computeDominantFlow(periodDates.map((d) => flowByDate.get(d))),
  })

  return periods.map((period, index) => {
    const next = periods[index + 1]
    const cycleLength = next
      ? differenceInCalendarDays(parseISO(next.start), parseISO(period.start))
      : null
    return { ...period, cycleLength }
  })
}

/**
 * Her calendar logging should always win over a stale onboarding-time
 * anchor date: if she's logged a period more recently than the stored
 * `last_period_start`, that becomes the effective anchor for phase
 * estimation. Without this, marking periods in the calendar would never
 * feed back into the cyclusdag/fase estimate shown everywhere else, and
 * the two could silently contradict each other indefinitely.
 */
export function getEffectiveLastPeriodStart(
  storedStart: string | null,
  cycleHistory: Pick<CycleHistoryEntry, "start">[],
): string | null {
  const latestLoggedStart = cycleHistory.length ? cycleHistory[cycleHistory.length - 1].start : null
  if (!latestLoggedStart) return storedStart
  if (!storedStart) return latestLoggedStart
  return latestLoggedStart > storedStart ? latestLoggedStart : storedStart
}

/**
 * Merges the currently in-progress period (see cycle_profiles.
 * active_period_start) into a logs list BEFORE computing history, so every
 * consumer — Vandaag's quick-action, the Cyclus-kalender, the Cyclusdag
 * phase estimate, and pattern insights — sees the exact same "she's on day
 * N of an active period" picture, without needing a real cycle_logs row
 * for every day in between. This replaces an earlier heuristic that
 * guessed whether a period was "still open" from a gap in logged days;
 * "active" is now an explicit, unambiguous flag instead of a guess.
 *
 * Days that already have a real cycle_logs row (true OR false) keep that
 * row as-is — a day she explicitly unmarked via the calendar during an
 * active period stays unmarked, rather than being silently overridden.
 * Only days with NO row at all get a synthetic "menstruation: true" entry.
 */
export function withActivePeriod(
  logs: CycleLogEntry[],
  activePeriodStart: string | null,
  today: string,
): CycleLogEntry[] {
  if (!activePeriodStart || activePeriodStart > today) return logs

  const knownDates = new Set(logs.map((l) => l.date))
  const activeDays = eachDayOfInterval({ start: parseISO(activePeriodStart), end: parseISO(today) })
  const synthesized: CycleLogEntry[] = activeDays
    .map((d) => format(d, "yyyy-MM-dd"))
    .filter((date) => !knownDates.has(date))
    .map((date) => ({ date, menstruation: true, symptoms: [], flow: null }))

  return [...logs, ...synthesized]
}

export function computeSymptomFrequency(
  logs: { symptoms: string[] }[],
): { symptom: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const log of logs) {
    for (const symptom of log.symptoms) {
      if (symptom === "Geen klachten") continue
      counts.set(symptom, (counts.get(symptom) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries())
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count)
}
