import Link from "next/link"
import { ChevronRight, ShoppingCart } from "lucide-react"
import { TodayMovementCard, type TodayWorkoutOption } from "@/components/today/today-movement-card"
import {
  TodayMealsRows,
  type TodayMealAlternative,
} from "@/components/today/today-meals-rows"
import { PhaseSnackTipCard } from "@/components/cycle/phase-snack-tip-card"
import type { Recommendation } from "@/lib/recommendations/engine"
import type { MentalWellbeingSuggestion } from "@/lib/mental-wellbeing/suggestions"
import type { MealSlotKey } from "@/lib/client/week-plan-storage"

/**
 * Vandaag plan: movement → meals → groceries (right under the last dish) →
 * mind/recovery. Snack tip follows outside as a light food tip — then the
 * page continues with check-in / sleep / day close.
 */
export function TodayCards({
  recommendation,
  userId,
  date,
  weekStartISO,
  workoutAlternatives,
  mealAlternativesBySlot = {},
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
  mealAlternativesBySlot?: Partial<Record<MealSlotKey, TodayMealAlternative[]>>
  completedWorkout: { workoutId: string; title: string; duration: number } | null
  mentalSuggestion?: MentalWellbeingSuggestion | null
  focusLine?: string | null
  showRecovery?: boolean
  recipeImageById?: Record<string, string | null>
}) {
  const { training, nutrition, recovery, movementEnabled, nutritionEnabled } = recommendation

  const meals = nutrition.meals ?? []
  const showMeals = nutritionEnabled && meals.length > 0
  const showSnack = nutritionEnabled && Boolean(nutrition.snackTip)
  const showMental = Boolean(mentalSuggestion)
  const showRecoveryRow = showRecovery && !showMental && Boolean(recovery.title)
  const showGrocery = nutritionEnabled
  const hasSecondary = showMeals || showGrocery || showMental || showRecoveryRow

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
                alternativesBySlot={mealAlternativesBySlot}
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

            {showGrocery && (
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 min-h-11">
                <Link
                  href="/deze-week/boodschappen"
                  className="inline-flex items-center gap-2 text-sm font-medium text-ink touch-manipulation min-h-11"
                >
                  <ShoppingCart className="h-4 w-4 text-sage-dark shrink-0" strokeWidth={1.75} />
                  Boodschappen
                </Link>
                <Link
                  href="/deze-week/boodschappen?modus=dag"
                  className="text-xs font-medium text-sage-dark touch-manipulation min-h-11 inline-flex items-center shrink-0"
                >
                  Voor vandaag →
                </Link>
              </div>
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

      {showSnack && nutrition.snackTip && (
        <div className="mt-3">
          <PhaseSnackTipCard tip={nutrition.snackTip} compact />
        </div>
      )}
    </section>
  )
}
