import { todayISO as amsterdamTodayISO } from "@/lib/dates/amsterdam"
import { normalizeReminderTime } from "@/lib/validations/reminder"

/**
 * One-shot appointment reminders — fire only on the appointment date at
 * the chosen time (same grace window as other in-app reminders).
 */
export interface DoctorAppointmentReminderLike {
  id: string
  appointmentDate: string
  reminderEnabled: boolean
  reminderTime: string | null
  notes: string | null
}

const GRACE_WINDOW_MINUTES = 180

export function getDueDoctorAppointmentReminders(
  appointments: DoctorAppointmentReminderLike[],
  now: Date,
  wasShown: (id: string, dateISO: string) => boolean,
): DoctorAppointmentReminderLike[] {
  const todayISO = amsterdamTodayISO(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  return appointments.filter((a) => {
    if (!a.reminderEnabled || !a.reminderTime) return false
    if (a.appointmentDate !== todayISO) return false

    const time = normalizeReminderTime(a.reminderTime)
    const [h, min] = time.split(":").map(Number)
    if (Number.isNaN(h) || Number.isNaN(min)) return false
    const scheduledMinutes = h * 60 + min
    const minutesSince = nowMinutes - scheduledMinutes
    if (minutesSince < 0 || minutesSince > GRACE_WINDOW_MINUTES) return false

    return !wasShown(a.id, todayISO)
  })
}

export function doctorAppointmentReminderText(appointment: DoctorAppointmentReminderLike): string {
  if (appointment.notes?.trim()) {
    return `Herinnering: artsafspraak vandaag — ${appointment.notes.trim().slice(0, 80)}`
  }
  return "Herinnering: je hebt vandaag een artsafspraak genoteerd."
}
