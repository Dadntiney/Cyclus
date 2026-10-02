import { format, parseISO, subDays } from "date-fns"
import { todayISO as amsterdamTodayISO } from "@/lib/dates/amsterdam"
import { doctorReminderLeadLabel, normalizeReminderTime } from "@/lib/reminders/options"

/**
 * One-shot appointment reminders — fire on appointment_date minus
 * reminderLeadDays, at the chosen time (same grace window as other in-app
 * reminders).
 */
export interface DoctorAppointmentReminderLike {
  id: string
  appointmentDate: string
  reminderEnabled: boolean
  reminderTime: string | null
  reminderLeadDays: number
  notes: string | null
}

const GRACE_WINDOW_MINUTES = 180

/** Calendar day (yyyy-MM-dd) on which the reminder should fire. */
export function doctorAppointmentReminderFireDate(
  appointmentDate: string,
  leadDays: number,
): string {
  const safeLead = Math.max(0, Math.min(30, Math.floor(leadDays) || 0))
  if (safeLead === 0) return appointmentDate
  return format(subDays(parseISO(appointmentDate), safeLead), "yyyy-MM-dd")
}

export function getDueDoctorAppointmentReminders(
  appointments: DoctorAppointmentReminderLike[],
  now: Date,
  wasShown: (id: string, dateISO: string) => boolean,
): DoctorAppointmentReminderLike[] {
  const todayISO = amsterdamTodayISO(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  return appointments.filter((a) => {
    if (!a.reminderEnabled || !a.reminderTime) return false
    const fireDate = doctorAppointmentReminderFireDate(a.appointmentDate, a.reminderLeadDays)
    if (fireDate !== todayISO) return false

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
  const lead = appointment.reminderLeadDays || 0
  const when =
    lead === 0 ? "vandaag" : lead === 1 ? "morgen" : lead === 7 ? "over een week" : `over ${lead} dagen`
  if (appointment.notes?.trim()) {
    return `Herinnering: artsafspraak ${when} — ${appointment.notes.trim().slice(0, 80)}`
  }
  if (lead === 0) return "Herinnering: je hebt vandaag een artsafspraak genoteerd."
  return `Herinnering: artsafspraak ${when} (${doctorReminderLeadLabel(lead).toLowerCase()}).`
}
