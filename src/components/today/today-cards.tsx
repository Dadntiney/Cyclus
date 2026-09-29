import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { TodayMovementCard, type TodayWorkoutOption } from "@/components/today/today-movement-card"
import { TodayMealsRows } from "@/components/today/today-meals-rows"
import type { Recommendation } from "@/lib/recommendations/engine"
import type { MentalWellbeingSuggestion } from "@/lib/mental-wellbeing/suggestions"

/**
 * Vandaag plan: movement first (today’s primary action), then the same
 * meals as Deze week. No library footer — Week is in the nav; full
 * libraries stay reachable from Profiel → Wat ik gebruik and recipe/workout detail.
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
  recipeImageById = {},
}: {
  recommendation: Recommendation
  userId: string
  date: string
  weekStartISO: string
  workoutAlternatives: TodayWorkoutOption[]
  completedWorkout: { workoutId: string; title: string; duration: number } | null
  mentalSuggestion?: MentalWellbeingSuggestion | null
  focusLine?: string | null
  showRecovery?: boolean
  recipeImageById?: Record<string, string | null>
}) {
  const { training, nutrition, recovery, movementEnabled, nutritionEnabled } = recommendation

  const meals = nutrition.meals ?? []
  const showMeals = nutritionEnabled && meals.length > 0
  const showMental = Boolean(mentalSuggestion)
  const showRecoveryRow = showRecovery && !showMental && Boolean(recovery.title)
  const hasSecondary = showMeals || showMental || showRecoveryRow

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
            {showMeals && (
              <TodayMealsRows
                userId={userId}
                date={date}
                weekStartISO={weekStartISO}
                recipeImageById={recipeImageById}
                meals={meals.map((m) => ({
                  slot: m.slot,
                  label: m.label,
                  recipe: m.recipe
                    ? {
                        id: m.recipe.id,
                        title: m.recipe.title,
                        image_url: m.recipe.image_url,
                        preparation_time: m.recipe.preparation_time,
                      }
                    : null,
                }))}
              />
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
    </section>
  )
}
