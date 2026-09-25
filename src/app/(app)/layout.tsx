import { redirect } from "next/navigation"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { Sidebar } from "@/components/nav/sidebar"
import { BottomNav } from "@/components/nav/bottom-nav"
import { MobileHeader } from "@/components/nav/mobile-header"
import { PageTransition } from "@/components/nav/page-transition"
import { ReminderToastHost } from "@/components/reminders/reminder-toast-host"
import { getReminders } from "@/lib/data/reminders"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const user = await getAuthedUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, avatar_url, onboarding_completed")
    .eq("id", user.id)
    .single()

  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  const reminders = await getReminders(user.id)

  return (
    <div className="flex min-h-screen">
      <Sidebar name={profile.name} avatarUrl={profile.avatar_url} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader avatarUrl={profile.avatar_url} />
        <main className="flex-1 pb-24 md:pb-10">
          <PageTransition>{children}</PageTransition>
        </main>
        <BottomNav />
        <ReminderToastHost reminders={reminders} />
      </div>
    </div>
  )
}
