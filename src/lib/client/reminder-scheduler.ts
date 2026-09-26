/**
 * Pure scheduling logic for in-app reminders — kept separate from the React
 * component so it's easy to reason about (and test) without a browser.
 *
 * Important, honest limitation: this only fires while the app is open in a
 * browser tab. There's no push-notification server behind it (that would
 * need a service worker + a backend cron job), so a reminder for 8:00 only
 * actually appears once she opens Cyclus that day — same as many web apps
 * without native push infrastructure.
 */

export interface ReminderLike {
  id: string
  type: string
  label: string | null
  enabled: boolean
  days: number[]
  /** "HH:MM" or "HH:MM:SS" (Postgres `time` serializes with seconds). */
  time: string
}

/** ISO weekday: 1 = maandag .. 7 = zondag. */
export function isoWeekday(date: Date): number {
  const day = date.getDay()
  return day === 0 ? 7 : day
}

// How long after its scheduled time a reminder still counts as "due" if she
// opens the app late — long enough to still be useful, short enough that a
// reminder from yesterday morning never resurfaces at dinner time.
const GRACE_WINDOW_MINUTES = 180

/**
 * Which reminders should fire right now: enabled, scheduled for today,
 * whose time has passed (within the grace window), and not already shown
 * today (per `wasShown`, backed by localStorage — see reminder-storage.ts).
 */
export function getDueReminders(
  reminders: ReminderLike[],
  now: Date,
  wasShown: (reminderId: string, dateISO: string) => boolean,
): ReminderLike[] {
  const todayISO = now.toISOString().slice(0, 10)
  const weekday = isoWeekday(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  return reminders.filter((r) => {
    if (!r.enabled) return false
    if (!r.days.includes(weekday)) return false
    const [h, m] = r.time.split(":").map(Number)
    if (Number.isNaN(h) || Number.isNaN(m)) return false
    const scheduledMinutes = h * 60 + m
    const minutesSince = nowMinutes - scheduledMinutes
    if (minutesSince < 0 || minutesSince > GRACE_WINDOW_MINUTES) return false
    return !wasShown(r.id, todayISO)
  })
}
