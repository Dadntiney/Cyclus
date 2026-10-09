import type { Metadata } from "next"
import { FEATURES } from "@/lib/navigation/features"
import { Page, PageSections } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { ProgressSection } from "@/components/profile/progress-section"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfileOverview } from "@/lib/data/profile"

export const metadata: Metadata = { title: FEATURES.voortgang.label }

export default async function ProfielVoortgangPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const { stats, milestones } = await getProfileOverview(user.id)

  return (
    <Page>
      <PageHeader
        title={FEATURES.voortgang.label}
        subtitle="Geen scores, geen druk. Gewoon wat je al hebt opgebouwd."
      />
      <PageSections>
        <ProgressSection
          totalWorkoutsCompleted={stats.totalWorkoutsCompleted}
          totalCheckins={stats.totalCheckins}
          currentStreak={stats.currentStreak}
          bestStreak={stats.bestStreak}
          milestones={milestones}
        />
      </PageSections>
    </Page>
  )
}
