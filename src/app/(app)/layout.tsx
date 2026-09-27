import { redirect } from "next/navigation"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { Sidebar } from "@/components/nav/sidebar"
import { BottomNav } from "@/components/nav/bottom-nav"
import { MobileHeader } from "@/components/nav/mobile-header"
import { PageTransition } from "@/components/nav/page-transition"
import { ReminderScheduler } from "@/components/reminders/reminder-scheduler"
import { getMedicationsForUser } from "@/lib/data/medications"
import { buildWeeklyProgram } from "@/lib/recommendations/weekly-program"
import { format } from "date-fns"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const user = await getAuthedUser()

  if (!user) {
    redirect("/login")
  }

  const todayISO = format(new Date(), "yyyy-MM-dd")

  const [
    { data: profile },
    { data: checkin },
    { data: todaySession },
    { data: workouts },
    medications,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single(),
    supabase
      .from("daily_checkins")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", todayISO)
      .maybeSingle(),
    supabase
      .from("workout_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", todayISO)
      .eq("completed", true)
      .limit(1)
      .maybeSingle(),
    supabase.from("workouts").select("*"),
    getMedicationsForUser(user.id),
  ])

  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  const program = buildWeeklyProgram({
    frequency: profile.training_frequency ?? 3,
    healthConditions: profile.health_conditions ?? [],
    movementLimitations: profile.movement_limitations ?? [],
    workouts: workouts ?? [],
    seed: `${user.id}-weekprogram`,
  })
  const jsDay = new Date().getDay() // 0 Sun
  const mondayIndex = jsDay === 0 ? 6 : jsDay - 1
  const isPlannedWorkoutDay = program[mondayIndex]?.focus !== "rust"

  return (
    <div className="flex min-h-screen">
      <Sidebar name={profile.name} avatarUrl={profile.avatar_url} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader avatarUrl={profile.avatar_url} />
        <main className="flex-1 pb-24 md:pb-10">
          <PageTransition>{children}</PageTransition>
        </main>
        <BottomNav />
      </div>
      <ReminderScheduler
        enabled={Boolean(profile.browser_notifications_enabled)}
        checkinReminderEnabled={Boolean(profile.checkin_reminder_enabled)}
        checkinReminderTime={
          profile.checkin_reminder_time ? String(profile.checkin_reminder_time) : "09:00"
        }
        workoutReminderEnabled={Boolean(profile.workout_reminder_enabled)}
        hasCheckinToday={Boolean(checkin)}
        hasWorkoutToday={Boolean(todaySession)}
        isPlannedWorkoutDay={isPlannedWorkoutDay}
        medications={medications.map((m) => ({
          id: m.id,
          name: m.name,
          reminder_time: m.reminder_time,
          reminder_enabled: m.reminder_enabled,
          takenToday: m.takenToday,
        }))}
      />
    </div>
  )
}
