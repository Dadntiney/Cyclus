/**
 * Pure sleep-duration math. Times are "HH:MM" (or "HH:MM:SS", Postgres'
 * `time` type round-trips as either) — she never has to calculate the
 * duration herself, and it correctly handles sleeping across midnight
 * (bedtime 23:15 → wake 07:00 is a forward span, not a negative one).
 */

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export function computeSleepDurationMinutes(bedtime: string, wakeTime: string): number {
  const bed = toMinutes(bedtime)
  const wake = toMinutes(wakeTime)
  // Wake at/before bedtime (clock-wise) means she slept past midnight.
  return wake <= bed ? wake + 24 * 60 - bed : wake - bed
}

export function formatSleepDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} uur`
  return `${h} uur ${m} min`
}
