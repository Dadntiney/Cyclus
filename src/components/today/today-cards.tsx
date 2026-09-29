import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { RecipeImage } from "@/components/nutrition/recipe-image"
import { TodayMovementCard, type TodayWorkoutOption } from "@/components/today/today-movement-card"
import type { Recommendation } from "@/lib/recommendations/engine"
import type { MentalWellbeingSuggestion } from "@/lib/mental-wellbeing/suggestions"

/**
 * One composition for today’s plan — primary action + secondary rows
 * inside a single surface. Not a stack of equal dashboard cards.
 */
export function TodayCards({
  recommendation,
  userId,
  date,
  weekStartISO,
  workoutAlternatives,
  completedWorkout,
  mentalSuggestion = null,
  focusLine = null,
  showRecovery = true,
}: {
  recommendation: Recommendation
  userId: string
  date: string
  weekStartISO: string
  workoutAlternatives: TodayWorkoutOption[]
  completedWorkout: { workoutId: string; title: string; duration: number } | null
  mentalSuggestion?: MentalWellbeingSuggestion | null
  focusLine?: string | null
  /** When false, hide the generic recovery row (keeps mental suggestion). */
  showRecovery?: boolean
}) {
  const { training, nutrition, recovery, movementEnabled, nutritionEnabled } = recommendation

  const showNutrition = nutritionEnabled && Boolean(nutrition.recipe)
  const showMental = Boolean(mentalSuggestion)
  const showRecoveryRow = showRecovery && !showMental && Boolean(recovery.title)
  const hasSecondary = showNutrition || showMental || showRecoveryRow

  return (
    <section aria-labelledby="voor-vandaag-heading">
      <h2 id="voor-vandaag-heading" className="font-display text-lg text-ink">
        Voor jou vandaag
      </h2>
      {focusLine ? (
        <p className="text-sm text-ink-soft mt-1 mb-3 leading-relaxed">{focusLine}</p>
      ) : (
        <div className="mb-3" aria-hidden />
      )}

      <div className="rounded-3xl bg-sage-soft/55 overflow-hidden">
        {movementEnabled ? (
          <TodayMovementCard
            userId={userId}
            date={date}
            weekStartISO={weekStartISO}
            suggested={training.workout}
            reason={training.reason}
            alternatives={workoutAlternatives}
            completed={completedWorkout}
            emphasis="primary"
            embedded
          />
        ) : (
          <div className="px-4 py-4">
            <p className="text-sm text-ink-soft">
              Beweging staat uit. Je kunt dit weer aanzetten in je profiel.
            </p>
          </div>
        )}

        {hasSecondary && (
          <div className="border-t border-sage/15 divide-y divide-sage/15">
            {showNutrition && nutrition.recipe && (
              <Link
                href={`/voeding/${nutrition.recipe.id}`}
                className="flex items-center gap-3 px-4 py-3 touch-manipulation motion-safe:active:bg-sage-soft/80 transition-colors"
              >
                <RecipeImage
                  title={nutrition.recipe.title}
                  imageUrl={nutrition.recipe.image_url}
                  className="h-11 w-11 rounded-xl shrink-0"
                  sizes="44px"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-sage-dark">Voeding</p>
                  <p className="text-sm font-medium text-ink leading-snug truncate">
                    {nutrition.recipe.title}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={2} aria-hidden />
              </Link>
            )}

            {showMental && mentalSuggestion && (
              <Link
                href={`/mentale-rust/${mentalSuggestion.exercise.id}`}
                className="block px-4 py-3 touch-manipulation motion-safe:active:bg-sage-soft/80 transition-colors"
              >
                <p className="text-[11px] font-medium text-info mb-0.5">Voor je hoofd</p>
                <p className="text-sm text-ink leading-snug">{mentalSuggestion.text}</p>
                <p className="text-xs font-medium text-info mt-1 inline-flex items-center gap-0.5">
                  {mentalSuggestion.exercise.title} · {mentalSuggestion.exercise.durationMinutes} min
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                </p>
              </Link>
            )}

            {showRecoveryRow &&
              (recovery.href ? (
                <Link
                  href={recovery.href}
                  className="flex items-center justify-between gap-3 px-4 py-3 touch-manipulation motion-safe:active:bg-sage-soft/80 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-sage-dark">Even voor jezelf</p>
                    <p className="text-sm font-medium text-ink truncate">
                      {recovery.title}
                      <span className="font-normal text-ink-soft"> · {recovery.duration} min</span>
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={2} aria-hidden />
                </Link>
              ) : (
                <div className="px-4 py-3">
                  <p className="text-[11px] font-medium text-sage-dark">Even voor jezelf</p>
                  <p className="text-sm font-medium text-ink">
                    {recovery.title}
                    <span className="font-normal text-ink-soft"> · {recovery.duration} min</span>
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {(movementEnabled || nutritionEnabled) && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {movementEnabled && (
            <Link
              href="/training"
              className="inline-flex items-center min-h-11 text-sm font-medium text-sage-dark touch-manipulation"
            >
              Alle trainingen
            </Link>
          )}
          {nutritionEnabled && (
            <Link
              href="/voeding"
              className="inline-flex items-center min-h-11 text-sm font-medium text-sage-dark touch-manipulation"
            >
              Alle recepten
            </Link>
          )}
        </div>
      )}
    </section>
  )
}
