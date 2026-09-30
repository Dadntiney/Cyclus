/**
 * Pure sleep-duration math. Times are "HH:MM" (or "HH:MM:SS", Postgres'
 * `time` type round-trips as either) — she never has to calculate the
 * duration herself, and it correctly handles sleeping across midnight
 * (bedtime 23:15 → wake 07:00 is a forward span, not a negative one).
 */

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN
  return h * 60 + m
}

/**
 * Returns null when times are missing/invalid or identical (identical
 * clocks used to report “24 uur geslapen” via the overnight branch).
 */
export function computeSleepDurationMinutes(bedtime: string, wakeTime: string): number | null {
  const bed = toMinutes(bedtime)
  const wake = toMinutes(wakeTime)
  if (!Number.isFinite(bed) || !Number.isFinite(wake)) return null
  // Same clock time is not a night of sleep — usually a half-filled form.
  if (wake === bed) return null
  // Wake earlier on the clock than bedtime → slept past midnight.
  const minutes = wake < bed ? wake + 24 * 60 - bed : wake - bed
  // Guard absurd spans (e.g. > 18u) so a typo never reads as a full day.
  if (minutes <= 0 || minutes > 18 * 60) return null
  return minutes
}

export function formatSleepDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} uur`
  return `${h} uur ${m} min`
}
