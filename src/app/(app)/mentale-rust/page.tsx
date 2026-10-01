import Link from "next/link"
import { Brain } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { todayISO } from "@/lib/dates/amsterdam"
import { MINDFUL_EXERCISES } from "@/lib/data/mindful-exercises"
import { affirmationThemesForCategories, getAffirmationsByThemes } from "@/lib/data/affirmations"
import { ExerciseLibrary } from "@/components/mental-wellbeing/exercise-library"
import { AffirmationViewer } from "@/components/mental-wellbeing/affirmation-viewer"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { buttonVariants } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import type { MentalWellbeingCategory } from "@/lib/constants"
import { getSavedMomentTexts } from "@/lib/data/moments"

export default async function MentaleRustPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const profile = await getProfile(user.id)

  if (!profile || profile.mental_wellbeing_enabled !== true) {
    return (
      <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
        <BackButton href="/vandaag" label="Vandaag" />
        <h1 className="font-display text-2xl lg:text-3xl text-ink mb-1">Mijn mentale rust</h1>
        <p className="text-sm text-ink-soft mb-6">Korte oefeningen en affirmaties voor meer rust.</p>
        <Card>
          <EmptyState
            icon={<Brain className="h-8 w-8" strokeWidth={1.5} />}
            title="Mentale rust staat nu uit"
            description="Je ziet hierdoor nergens meditaties, mindfulness of affirmaties. Wil je dit toch gebruiken?"
            action={
              <Link href="/profiel/gebruik#mentale-rust" className={buttonVariants({ variant: "secondary" })}>
                Zet aan in mijn profiel
              </Link>
            }
          />
        </Card>
      </div>
    )
  }

  const today = todayISO()
  const preferredCategories = (profile.mental_wellbeing_categories ?? []) as MentalWellbeingCategory[]
  const affirmations = getAffirmationsByThemes(affirmationThemesForCategories(preferredCategories))
  const savedTexts = [...(await getSavedMomentTexts(user.id))]

  return (
    <div className="w-full max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6 lg:gap-8">
      <div>
        <BackButton href="/vandaag" label="Vandaag" />
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Mijn mentale rust</h1>
        <p className="text-sm text-ink-soft mt-1">
          Korte oefeningen en affirmaties. Een tip op basis van je check-in staat op Vandaag.
        </p>
      </div>

      <div>
        <h2 className="font-display text-lg text-ink mb-3">Een klein moment voor jezelf</h2>
        <AffirmationViewer
          affirmations={affirmations}
          seed={`${user.id}-${today}`}
          savedTexts={savedTexts}
        />
      </div>

      <div>
        <h2 className="font-display text-lg text-ink mb-3">Meditaties & mindfulness</h2>
        <ExerciseLibrary exercises={MINDFUL_EXERCISES} preferredCategories={preferredCategories} />
      </div>

      <p className="text-xs text-ink-soft px-1 leading-relaxed">
        Deze content is algemene, informatieve ondersteuning — geen behandeling, therapie of
        diagnose. GoFiev vervangt geen professionele hulp. Voel je je langere tijd erg somber,
        angstig of alleen, of beïnvloedt dit je dagelijks leven sterk? Dan kan het goed zijn om
        hierover te praten met je huisarts of een andere zorgverlener.
      </p>
    </div>
  )
}
