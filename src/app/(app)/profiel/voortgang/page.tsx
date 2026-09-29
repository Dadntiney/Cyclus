import { BackButton } from "@/components/ui/back-button"
import { ProgressSection } from "@/components/profile/progress-section"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfileOverview } from "@/lib/data/profile"

export default async function ProfielVoortgangPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const { stats, milestones } = await getProfileOverview(user.id)

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-5">
      <div>
        <BackButton href="/profiel" label="Profiel" />
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Mijn voortgang</h1>
        <p className="text-sm text-ink-soft mt-1">Geen scores — gewoon wat je al hebt opgebouwd.</p>
      </div>
      <ProgressSection
        totalWorkoutsCompleted={stats.totalWorkoutsCompleted}
        totalCheckins={stats.totalCheckins}
        currentStreak={stats.currentStreak}
        bestStreak={stats.bestStreak}
        milestones={milestones}
      />
    </div>
  )
}
