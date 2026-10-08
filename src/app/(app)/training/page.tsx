import type { Metadata } from "next"
import Link from "next/link"
import { Footprints } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { getWorkoutLibrary } from "@/lib/data/training"
import { FEATURES } from "@/lib/navigation/features"
import { TRAINING_PREFERENCE_TO_TYPE } from "@/lib/constants"
import { Page } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { WorkoutLibrary } from "@/components/training/workout-library"
import { EmptyState } from "@/components/ui/empty-state"
import { buttonVariants, textActionClass } from "@/components/ui/button"

export const metadata: Metadata = { title: FEATURES.beweging.label }

const PREFERENCES_HREF = `${FEATURES.gebruik.href}#beweging`

/**
 * Beweging: the library of trainings (ontwerpvisie §7.5). One header with
 * the one action (Favorieten, a text action: the heart only means
 * "bewaren", besluit 12), the type chips with her preferences at the end,
 * then the trainings. Today's suggestion lives on Vandaag; this page does
 * not point there.
 */
export default async function TrainingPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const [workouts, profile] = await Promise.all([getWorkoutLibrary(), getProfile(user.id)])

  if (profile && !profile.movement_enabled) {
    return (
      <Page>
        <PageHeader title={FEATURES.beweging.label} subtitle="Trainingen op jouw tempo." />
        <EmptyState
          icon={Footprints}
          title="Beweging staat nu uit"
          description="Je ziet hierdoor nergens trainingsadvies. Wil je het toch weer gebruiken?"
          action={
            <Link href={PREFERENCES_HREF} className={buttonVariants({ variant: "tonal", size: "sm" })}>
              Aanzetten in {FEATURES.gebruik.label}
            </Link>
          }
        />
      </Page>
    )
  }

  const rawPreferences = profile?.training_preferences ?? []
  const preferredTypes = rawPreferences
    .map((p) => TRAINING_PREFERENCE_TO_TYPE[p])
    .filter((t): t is string => Boolean(t))
  const libraryWorkouts = rawPreferences.length
    ? workouts.filter((w) => preferredTypes.includes(w.type))
    : workouts

  return (
    <Page>
      <PageHeader
        title={FEATURES.beweging.label}
        subtitle={
          rawPreferences.length
            ? "Trainingen die passen bij wat jij fijn vindt."
            : "Trainingen op jouw tempo, voor elke dag."
        }
        action={
          <Link href={`${FEATURES.favorieten.href}?soort=beweging`} className={textActionClass()}>
            {FEATURES.favorieten.label}
          </Link>
        }
      />
      {libraryWorkouts.length ? (
        <WorkoutLibrary workouts={libraryWorkouts} preferencesHref={PREFERENCES_HREF} />
      ) : (
        <EmptyState
          icon={Footprints}
          title="Nog geen trainingen voor jouw keuze"
          description="We hebben nog geen trainingen voor de vormen van bewegen die je koos. Kies er gerust een paar bij."
          action={
            <Link href={PREFERENCES_HREF} className={buttonVariants({ variant: "tonal", size: "sm" })}>
              Voorkeuren aanpassen
            </Link>
          }
        />
      )}
    </Page>
  )
}
