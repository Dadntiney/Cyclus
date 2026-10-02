/**
 * Time-of-day matching for push reminders.
 *
 * The send-reminders route runs every 15 minutes (Supabase pg_cron) plus once
 * a day from Vercel Cron as a fallback. Each run sends what is due "now":
 * the chosen time has passed, but not by more than the grace window. The
 * push log (one row per item per day) keeps a later run from sending it
 * twice, so a missed run is simply caught up by the next one.
 */

/** Same grace window as the in-app reminder toast (reminder-scheduler.ts). */
export const PUSH_GRACE_WINDOW_MINUTES = 180

/** Used when an item has no time of its own (e.g. a medication without one). */
export const DEFAULT_PUSH_TIME = "08:00"

/** "HH:MM" or "HH:MM:SS" → minutes since midnight, or null when unreadable. */
export function timeToMinutes(time: string | null | undefined): number | null {
  if (!time) return null
  const match = /^(\d{1,2}):(\d{2})/.exec(time)
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  if (h > 23 || m > 59) return null
  return h * 60 + m
}

/** Whether an item scheduled at `time` should be sent at `nowMinutes`. */
export function isPushTimeDue(
  time: string | null | undefined,
  nowMinutes: number,
  fallback: string = DEFAULT_PUSH_TIME,
): boolean {
  const scheduled = timeToMinutes(time) ?? timeToMinutes(fallback)
  if (scheduled === null) return false
  const minutesSince = nowMinutes - scheduled
  return minutesSince >= 0 && minutesSince <= PUSH_GRACE_WINDOW_MINUTES
}
