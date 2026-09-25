import { differenceInCalendarDays, parseISO } from "date-fns"

export interface CycleLogEntry {
  date: string
  menstruation: boolean
  symptoms: string[]
}

export interface PeriodEntry {
  start: string
  end: string
  days: number
}

export interface CycleHistoryEntry extends PeriodEntry {
  cycleLength: number | null
}

/**
 * Groups menstruation days into periods (consecutive calendar dates) and
 * derives the cycle length between one period's start and the next.
 */
export function computeCycleHistory(logs: CycleLogEntry[]): CycleHistoryEntry[] {
  const menstruationDates = logs
    .filter((l) => l.menstruation)
    .map((l) => l.date)
    .sort()

  if (!menstruationDates.length) return []

  const periods: PeriodEntry[] = []
  let periodStart = menstruationDates[0]
  let periodEnd = menstruationDates[0]

  for (let i = 1; i < menstruationDates.length; i++) {
    const prev = parseISO(periodEnd)
    const current = parseISO(menstruationDates[i])
    if (differenceInCalendarDays(current, prev) <= 1) {
      periodEnd = menstruationDates[i]
    } else {
      periods.push({
        start: periodStart,
        end: periodEnd,
        days: differenceInCalendarDays(parseISO(periodEnd), parseISO(periodStart)) + 1,
      })
      periodStart = menstruationDates[i]
      periodEnd = menstruationDates[i]
    }
  }
  periods.push({
    start: periodStart,
    end: periodEnd,
    days: differenceInCalendarDays(parseISO(periodEnd), parseISO(periodStart)) + 1,
  })

  return periods.map((period, index) => {
    const next = periods[index + 1]
    const cycleLength = next
      ? differenceInCalendarDays(parseISO(next.start), parseISO(period.start))
      : null
    return { ...period, cycleLength }
  })
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
