import { Suspense } from "react"
import { ReminderHostClient } from "@/components/reminders/reminder-host-client"
import type { MorningReminderSettings } from "@/components/reminders/reminder-toast-host"
import { getReminders } from "@/lib/data/reminders"
import { getMedicationReminderSources } from "@/lib/data/medications"
import { getDoctorAppointmentReminderSources } from "@/lib/data/doctor-appointments"
import type { MedicationReminderLike } from "@/lib/client/medication-reminder-scheduler"
import type { DoctorAppointmentReminderLike } from "@/lib/client/doctor-appointment-reminder-scheduler"
/**
 * Loads reminder sources off the layout critical path so first HTML for
 * Vandaag / Week / etc. is not blocked on these three queries.
 */
export function ReminderHostBoundary({
  userId,
  buddyStyles,
  morningReminder,
}: {
  userId: string
  buddyStyles: string[] | null
  morningReminder: MorningReminderSettings | null
}) {
  return (
    <Suspense fallback={null}>
      <ReminderHostLoader
        userId={userId}
        buddyStyles={buddyStyles}
        morningReminder={morningReminder}
      />
    </Suspense>
  )
}

async function ReminderHostLoader({
  userId,
  buddyStyles,
  morningReminder,
}: {
  userId: string
  buddyStyles: string[] | null
  morningReminder: MorningReminderSettings | null
}) {
  const [reminders, medicationReminderSources, doctorAppointmentSources] = await Promise.all([
    getReminders(userId),
    getMedicationReminderSources(userId),
    getDoctorAppointmentReminderSources(userId),
  ])

  const medicationReminders = medicationReminderSources.map((m) => ({
    id: m.id,
    name: m.name,
    reminderEnabled: m.reminder_enabled,
    timeOfDay: m.time_of_day,
    scheduleType: m.schedule_type as MedicationReminderLike["scheduleType"],
    scheduleDays: m.schedule_days,
    scheduleDaysOn: m.schedule_days_on,
    scheduleDaysOff: m.schedule_days_off,
    startDate: m.start_date,
    endDate: m.end_date,
    remindOnStart: m.remind_on_start,
    remindDaily: m.remind_daily,
    remindOnStop: m.remind_on_stop,
  }))
  const doctorAppointments: DoctorAppointmentReminderLike[] = doctorAppointmentSources
    .filter((a): a is typeof a & { appointment_date: string } => Boolean(a.appointment_date))
    .map((a) => ({
      id: a.id,
      appointmentDate: a.appointment_date,
      reminderEnabled: a.reminder_enabled,
      reminderTime: a.reminder_time,
      reminderLeadDays: a.reminder_lead_days ?? 0,
      notes: a.notes,
    }))

  return (
    <ReminderHostClient
      reminders={reminders}
      medications={medicationReminders}
      doctorAppointments={doctorAppointments}
      buddyStyles={buddyStyles}
      morningReminder={morningReminder}
    />
  )
}
