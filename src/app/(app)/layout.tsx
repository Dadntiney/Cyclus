import { redirect } from "next/navigation"
import { getAuthedUser } from "@/lib/supabase/server"
import { Sidebar } from "@/components/nav/sidebar"
import { BottomNav } from "@/components/nav/bottom-nav"
import { MobileHeader } from "@/components/nav/mobile-header"
import { PageTransition } from "@/components/nav/page-transition"
import { ReminderToastHost, type MorningReminderSettings } from "@/components/reminders/reminder-toast-host"
import { getReminders } from "@/lib/data/reminders"
import { getMedicationReminderSources } from "@/lib/data/medications"
import { getDoctorAppointmentReminderSources } from "@/lib/data/doctor-appointments"
import { getProfile } from "@/lib/data/profile"
import type { MedicationReminderLike } from "@/lib/client/medication-reminder-scheduler"
import type { DoctorAppointmentReminderLike } from "@/lib/client/doctor-appointment-reminder-scheduler"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthedUser()

  if (!user) {
    redirect("/login")
  }

  // Profile + shell data in one round — onboarding redirect is rare after first use.
  const [profile, reminders, medicationReminderSources, doctorAppointmentSources] = await Promise.all([
    getProfile(user.id),
    getReminders(user.id),
    getMedicationReminderSources(user.id),
    getDoctorAppointmentReminderSources(user.id),
  ])

  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }
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
    <div className="flex min-h-screen">
      <Sidebar avatarUrl={profile.avatar_url} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        <main className="flex-1 pb-[calc(var(--bottom-nav-h,5.5rem)+0.75rem)] md:pb-10">
          <PageTransition>{children}</PageTransition>
        </main>
        <BottomNav avatarUrl={profile.avatar_url} />
        <ReminderToastHost
          reminders={reminders}
          medications={medicationReminders}
          doctorAppointments={doctorAppointments}
          buddyStyles={profile.buddy_styles}
          morningReminder={
            profile.morning_reminder_enabled === true
              ? {
                  enabled: true,
                  time: profile.morning_reminder_time,
                  days: profile.morning_reminder_days,
                  contentTypes: (profile.morning_reminder_content_types?.length
                    ? profile.morning_reminder_content_types
                    : ["reminder"]) as MorningReminderSettings["contentTypes"],
                  preferredStyles: profile.buddy_styles,
                }
              : null
          }
        />
      </div>
    </div>
  )
}
