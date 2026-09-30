import { addDays, format, parseISO } from "date-fns"
import { todayISO } from "@/lib/dates/amsterdam"

export const DEFAULT_PERIOD_LENGTH = 5
export const MIN_PERIOD_LENGTH = 2
export const MAX_PERIOD_LENGTH = 14

/** Clamp a user-entered bleeding length to a safe range. */
export function clampPeriodLength(value: number | null | undefined): number {
  if (value == null || !Number.isFinite(value)) return DEFAULT_PERIOD_LENGTH
  return Math.min(MAX_PERIOD_LENGTH, Math.max(MIN_PERIOD_LENGTH, Math.round(value)))
}

/**
 * Consecutive menstruation dates to seed from a last-period start + duration.
 * Never writes future days; if the period is still ongoing, stops at today.
 */
export function buildPeriodSeedDates(
  startISO: string,
  durationDays: number,
  today: string = todayISO(),
): string[] {
  const duration = clampPeriodLength(durationDays)
  const start = parseISO(startISO)
  if (Number.isNaN(start.getTime())) return []

  const dates: string[] = []
  for (let i = 0; i < duration; i++) {
    const date = format(addDays(start, i), "yyyy-MM-dd")
    if (date > today) break
    dates.push(date)
  }
  return dates
}

/** True when the seeded bleed window still includes today. */
export function isPeriodStillActive(
  startISO: string,
  durationDays: number,
  today: string = todayISO(),
): boolean {
  const dates = buildPeriodSeedDates(startISO, durationDays, today)
  return dates.includes(today)
}
