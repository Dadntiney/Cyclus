import { redirect } from "next/navigation"
import { getAuthedUser } from "@/lib/supabase/server"
import { Sidebar } from "@/components/nav/sidebar"
import { BottomNav } from "@/components/nav/bottom-nav"
import { MobileHeader } from "@/components/nav/mobile-header"
import { PageTransition } from "@/components/nav/page-transition"
import { ReminderToastHost, type MorningReminderSettings } from "@/components/reminders/reminder-toast-host"
import { getReminders } from "@/lib/data/reminders"
import { getMedicationReminderSources } from "@/lib/data/medications"
import { getProfile } from "@/lib/data/profile"
import type { MedicationReminderLike } from "@/lib/client/medication-reminder-scheduler"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthedUser()

  if (!user) {
    redirect("/login")
  }

  const profile = await getProfile(user.id)

  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  const [reminders, medicationReminderSources] = await Promise.all([
    getReminders(user.id),
    getMedicationReminderSources(user.id),
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
  }))

  return (
    <div className="flex min-h-screen">
      <Sidebar name={profile.name} avatarUrl={profile.avatar_url} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader avatarUrl={profile.avatar_url} />
        <main className="flex-1 pb-24 md:pb-10">
          <PageTransition>{children}</PageTransition>
        </main>
        <BottomNav />
        <ReminderToastHost
          reminders={reminders}
          medications={medicationReminders}
          buddyStyles={profile.buddy_styles}
          morningReminder={
            profile.morning_reminder_enabled === true
              ? {
                  enabled: true,
                  time: profile.morning_reminder_time,
                  days: profile.morning_reminder_days,
                  contentType: profile.morning_reminder_content_type as MorningReminderSettings["contentType"],
                  preferredStyles: profile.buddy_styles,
                }
              : null
          }
        />
      </div>
    </div>
  )
}
