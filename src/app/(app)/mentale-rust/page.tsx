import type { Metadata } from "next"
import Link from "next/link"
import { Brain } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { nowMinutesInAmsterdam, todayISO } from "@/lib/dates/amsterdam"
import { MINDFUL_EXERCISES } from "@/lib/data/mindful-exercises"
import { affirmationThemesForCategories, getAffirmationsByThemes } from "@/lib/data/affirmations"
import { getSavedMomentTexts } from "@/lib/data/moments"
import { FEATURES } from "@/lib/navigation/features"
import type { MentalWellbeingCategory } from "@/lib/constants"
import { Page, PageSections } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { ExerciseLibrary } from "@/components/mental-wellbeing/exercise-library"
import { AffirmationViewer } from "@/components/mental-wellbeing/affirmation-viewer"
import { ForNowCard } from "@/components/mental-wellbeing/for-now-card"
import { isEvening, pickForNow } from "@/components/mental-wellbeing/library-filter"
import { EmptyState } from "@/components/ui/empty-state"
import { buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = { title: FEATURES.mentaleRust.label }

const SUBTITLE = "Korte momenten om te landen, wanneer jij wilt."

/**
 * Mentale rust (ontwerpvisie §7.6): header, one suggestion "Voor nu" with
 * Start, the library (one chip row, six exercises, the rest behind a
 * disclosure), and the affirmation as a small quote at the bottom.
 */
export default async function MentaleRustPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const profile = await getProfile(user.id)

  if (!profile || profile.mental_wellbeing_enabled !== true) {
    return (
      <Page>
        <PageHeader title={FEATURES.mentaleRust.label} subtitle={SUBTITLE} />
        <EmptyState
          icon={Brain}
          title="Mentale rust staat nu uit"
          description="Je ziet hierdoor nergens meditaties, mindfulness of affirmaties. Wil je dit toch gebruiken?"
          action={
            <Link
              href={`${FEATURES.gebruik.href}#mentale-rust`}
              className={buttonVariants({ variant: "tonal", size: "sm" })}
            >
              Aanzetten in {FEATURES.gebruik.label}
            </Link>
          }
        />
      </Page>
    )
  }

  const today = todayISO()
  const hour = Math.floor(nowMinutesInAmsterdam() / 60)
  const preferredCategories = (profile.mental_wellbeing_categories ?? []) as MentalWellbeingCategory[]
  const forNow = pickForNow(MINDFUL_EXERCISES, preferredCategories, hour)
  const affirmations = getAffirmationsByThemes(affirmationThemesForCategories(preferredCategories))
  const savedTexts = [...(await getSavedMomentTexts(user.id))]

  return (
    <Page>
      <PageHeader title={FEATURES.mentaleRust.label} subtitle={SUBTITLE} />
      <PageSections>
        {forNow && <ForNowCard exercise={forNow} evening={isEvening(hour)} />}

        <ExerciseLibrary exercises={MINDFUL_EXERCISES} preferredCategories={preferredCategories} />

        <AffirmationViewer affirmations={affirmations} seed={`${user.id}-${today}`} savedTexts={savedTexts} />

        <p className="text-xs text-ink-soft">
          Algemene ondersteuning, geen behandeling of therapie. Voel je je langere tijd somber, angstig of alleen? Dan kan
          je huisarts met je meedenken.
        </p>
      </PageSections>
    </Page>
  )
}
