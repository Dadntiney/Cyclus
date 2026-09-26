import { isDosingDay, type MedicationSchedule } from "@/lib/medication/schedule"

/**
 * Same in-app-only scheduling model as reminder-scheduler.ts, but "is this
 * due today" is decided by her own medication schedule (isDosingDay) rather
 * than a plain weekday list — a "2 weken wel/2 weken niet" reminder should
 * stay silent on the "niet" weeks.
 */
export interface MedicationReminderLike extends MedicationSchedule {
  id: string
  name: string
  reminderEnabled: boolean
  timeOfDay: string | null
}

const GRACE_WINDOW_MINUTES = 180

export function getDueMedicationReminders(
  medications: MedicationReminderLike[],
  now: Date,
  wasShown: (id: string, dateISO: string) => boolean,
): MedicationReminderLike[] {
  const todayISO = now.toISOString().slice(0, 10)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  return medications.filter((m) => {
    if (!m.reminderEnabled || !m.timeOfDay) return false
    // false = a computed "off" day for her schedule, stay silent. true or
    // null (e.g. "eigen schema", not automatically trackable) still remind
    // at her chosen time — better than silently dropping a custom schedule.
    if (isDosingDay(m, now) === false) return false

    const [h, min] = m.timeOfDay.split(":").map(Number)
    if (Number.isNaN(h) || Number.isNaN(min)) return false
    const scheduledMinutes = h * 60 + min
    const minutesSince = nowMinutes - scheduledMinutes
    if (minutesSince < 0 || minutesSince > GRACE_WINDOW_MINUTES) return false

    return !wasShown(m.id, todayISO)
  })
}
