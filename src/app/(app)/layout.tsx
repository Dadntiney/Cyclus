import { redirect } from "next/navigation"
import { getAuthedUser } from "@/lib/supabase/server"
import { Sidebar } from "@/components/nav/sidebar"
import { BottomNav } from "@/components/nav/bottom-nav"
import { MobileHeader } from "@/components/nav/mobile-header"
import { AppBarProvider } from "@/components/nav/app-bar-context"
import { PageTransition } from "@/components/nav/page-transition"
import { PullToRefresh } from "@/components/ui/pull-to-refresh"
import { ReminderHostBoundary } from "@/components/reminders/reminder-host-boundary"
import { AccountStateBoundary } from "@/components/client-state/account-state-boundary"
import { getProfile } from "@/lib/data/profile"
import type { MorningReminderSettings } from "@/components/reminders/reminder-toast-host"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthedUser()

  if (!user) {
    redirect("/login")
  }

  // Shell only needs profile — reminders stream in via Suspense so first
  // paint for Vandaag / Week / etc. is not blocked on three extra queries.
  const profile = await getProfile(user.id)

  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  const morningReminder: MorningReminderSettings | null =
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

  return (
    // #app-root: what an open sheet or dialog makes inert (overlay stack).
    // Overlays and the toast layer are portalled outside it, into <body>.
    <div id="app-root" className="flex min-h-screen">
      <Sidebar avatarUrl={profile.avatar_url} />
      <div className="flex-1 flex flex-col min-w-0">
        <AppBarProvider>
          <MobileHeader />
          {/* --mobile-header-h has a CSS default (globals.css, shell block)
              so the first paint already clears the app bar. */}
          <main className="flex-1 pt-[var(--mobile-header-h)] md:pt-0 pb-[calc(var(--bottom-nav-h,5.5rem)+1.5rem)] md:pb-10">
            <PullToRefresh>
              <PageTransition>{children}</PageTransition>
            </PullToRefresh>
          </main>
        </AppBarProvider>
        <BottomNav avatarUrl={profile.avatar_url} />
        <ReminderHostBoundary
          userId={user.id}
          buddyStyles={profile.buddy_styles}
          morningReminder={morningReminder}
        />
        <AccountStateBoundary userId={user.id} />
      </div>
    </div>
  )
}
