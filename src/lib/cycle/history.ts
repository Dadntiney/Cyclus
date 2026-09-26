import { differenceInCalendarDays, parseISO } from "date-fns"

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

export const MENSTRUATION_OPEN_GAP_DAYS = 10

/**
 * Whether her most recently logged period is still "open" — recent enough
 * that a quick "menstruatie gestopt" action on Vandaag should finish it by
 * filling any gap through today, rather than treating it as unrelated old
 * history. A generous cap (real periods rarely exceed ~10 days) keeps this
 * from ever reaching back into a clearly separate, much older cycle.
 *
 * @param cycleHistory Completed + current period history, oldest first (see computeCycleHistory).
 */
export function getOpenPeriod(
  cycleHistory: Pick<CycleHistoryEntry, "start" | "end">[],
  today: string,
): { start: string; end: string } | null {
  const latest = cycleHistory[cycleHistory.length - 1]
  if (!latest) return null
  if (differenceInCalendarDays(parseISO(today), parseISO(latest.end)) > MENSTRUATION_OPEN_GAP_DAYS) return null
  return latest
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
