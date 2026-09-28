import Link from "next/link"
import { Brain } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { pickMentalWellbeingSuggestion } from "@/lib/mental-wellbeing/suggestions"
import { MINDFUL_EXERCISES } from "@/lib/data/mindful-exercises"
import { getAffirmationsByThemes } from "@/lib/data/affirmations"
import { ExerciseLibrary } from "@/components/mental-wellbeing/exercise-library"
import { AffirmationViewer } from "@/components/mental-wellbeing/affirmation-viewer"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { buttonVariants } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import type { BuddyStyle } from "@/lib/buddy/styles"
import type { MentalWellbeingCategory } from "@/lib/constants"

export default async function MentaleRustPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const profile = await getProfile(user.id)

  if (!profile || profile.mental_wellbeing_enabled !== true) {
    return (
      <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
        <BackButton href="/voor-jou" label="Voor jou" />
        <h1 className="font-display text-2xl lg:text-3xl text-ink mb-1">Mijn mentale rust</h1>
        <p className="text-sm text-ink-soft mb-6">Korte oefeningen en affirmaties voor meer rust.</p>
        <Card>
          <EmptyState
            icon={<Brain className="h-8 w-8" strokeWidth={1.5} />}
            title="Mentale rust staat nu uit"
            description="Je ziet hierdoor nergens meditaties, mindfulness of affirmaties. Wil je dit toch gebruiken?"
            action={
              <Link href="/profiel#mentale-rust" className={buttonVariants()}>
                Zet aan in mijn profiel
              </Link>
            }
          />
        </Card>
      </div>
    )
  }

  const today = new Date().toISOString().slice(0, 10)
  const supabase = await createClient()
  const { data: checkin } = await supabase
    .from("daily_checkins")
    .select("symptoms, mood")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle()

  const preferredCategories = (profile.mental_wellbeing_categories ?? []) as MentalWellbeingCategory[]
  const preferredStyles = (profile.buddy_styles ?? []) as BuddyStyle[]

  const suggestion = pickMentalWellbeingSuggestion({
    symptoms: checkin?.symptoms ?? [],
    mood: checkin?.mood ?? null,
    seed: `${user.id}-${today}-mentale-rust`,
    preferredStyles,
  })

  const affirmations = getAffirmationsByThemes([])

  return (
    <div className="w-full max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6 lg:gap-8">
      <div>
        <BackButton href="/voor-jou" label="Voor jou" />
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Mijn mentale rust</h1>
        <p className="text-sm text-ink-soft mt-1">Korte oefeningen en affirmaties voor meer rust.</p>
      </div>

      {suggestion && (
        <Link
          href={`/mentale-rust/${suggestion.exercise.id}`}
          className="rounded-3xl bg-info-soft px-5 py-4 touch-manipulation motion-safe:active:scale-[0.99] transition-transform"
        >
          <p className="text-[11px] font-medium text-info mb-0.5">Voor je hoofd, vandaag</p>
          <p className="text-base text-ink leading-relaxed">{suggestion.text}</p>
        </Link>
      )}

      <div>
        <h2 className="font-display text-lg text-ink mb-3">Een klein moment voor jezelf</h2>
        <AffirmationViewer affirmations={affirmations} seed={`${user.id}-${today}`} />
      </div>

      <div>
        <h2 className="font-display text-lg text-ink mb-3">Meditaties & mindfulness</h2>
        <ExerciseLibrary exercises={MINDFUL_EXERCISES} preferredCategories={preferredCategories} />
      </div>

      <p className="text-xs text-ink-soft px-1 leading-relaxed">
        Deze content is algemene, informatieve ondersteuning — geen behandeling, therapie of
        diagnose. Cyclus vervangt geen professionele hulp. Voel je je langere tijd erg somber,
        angstig of alleen, of beïnvloedt dit je dagelijks leven sterk? Dan kan het goed zijn om
        hierover te praten met je huisarts of een andere zorgverlener.
      </p>
    </div>
  )
}
