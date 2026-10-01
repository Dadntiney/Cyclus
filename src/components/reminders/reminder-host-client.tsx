"use client"

import dynamic from "next/dynamic"
import type { MorningReminderSettings } from "@/components/reminders/reminder-toast-host"
import type { ReminderLike } from "@/lib/client/reminder-scheduler"
import type { MedicationReminderLike } from "@/lib/client/medication-reminder-scheduler"
import type { DoctorAppointmentReminderLike } from "@/lib/client/doctor-appointment-reminder-scheduler"
const ReminderToastHost = dynamic(
  () =>
    import("@/components/reminders/reminder-toast-host").then((m) => m.ReminderToastHost),
  { ssr: false },
)

/**
 * Client island for reminder toasts — dynamic so the scheduler/toast code
 * stays out of the initial shared JS for every authenticated route.
 */
export function ReminderHostClient(props: {
  reminders: ReminderLike[]
  medications: MedicationReminderLike[]
  doctorAppointments: DoctorAppointmentReminderLike[]
  buddyStyles: string[] | null
  morningReminder: MorningReminderSettings | null
}) {
  return (
    <ReminderToastHost
      reminders={props.reminders}
      medications={props.medications}
      doctorAppointments={props.doctorAppointments}
      buddyStyles={props.buddyStyles ?? undefined}
      morningReminder={props.morningReminder}
    />
  )
}
