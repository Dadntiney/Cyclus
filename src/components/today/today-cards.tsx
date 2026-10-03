import Link from "next/link"
import type { ReactNode } from "react"
import { Brain, ChevronRight, Leaf, ShoppingCart } from "lucide-react"
import { TodayMovementCard, type TodayWorkoutOption } from "@/components/today/today-movement-card"
import {
  TodayMealsRows,
  type TodayMealAlternative,
} from "@/components/today/today-meals-rows"
import { Card } from "@/components/ui/card"
import { SectionAction, SectionHeader } from "@/components/ui/section-header"
import { FEATURES } from "@/lib/navigation/features"
import type { Recommendation } from "@/lib/recommendations/engine"
import type { MentalWellbeingSuggestion } from "@/lib/mental-wellbeing/suggestions"
import type { MealSlotKey } from "@/lib/client/week-plan-storage"
import { ICON, iconProps } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

/** The generic Mentale rust entry — not a concrete next step for today. */
const GENERIC_RECOVERY_HREF = "/mentale-rust"
const GENTLE_TYPES = new Set(["wandelen", "mobiliteit"])

const rowLinkClass =
  "flex min-h-14 items-center gap-3 px-4 py-3 touch-manipulation -outline-offset-2 " +
  "transition-colors duration-fast ease-standard hover:bg-cream-soft/60 active:bg-cream-soft"

function RowTile({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-inset bg-sage-soft text-sage-dark"
    >
      {children}
    </span>
  )
}

/**
 * "Voor jou vandaag": one day-voice line, then one plan card —
 * beweging → ontbijt, lunch, diner → "Boodschappen voor vandaag" → voor je
 * hoofd / even voor jezelf. Parts she switched off disappear quietly.
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
  focusAction = null,
  hideWorkoutReason = false,
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
  /** The day voice: check-in focus, else roadmap "why", else body recognition. */
  focusLine?: string | null
  /** E.g. a favourite heart when the day voice comes from the roadmap. */
  focusAction?: ReactNode
  /** The day voice already explains today (from the check-in): skip the workout's reason. */
  hideWorkoutReason?: boolean
  showRecovery?: boolean
  recipeImageById?: Record<string, string | null>
}) {
  const { training, nutrition, recovery, movementEnabled, nutritionEnabled } = recommendation

  const meals = nutrition.meals ?? []
  const showMeals = nutritionEnabled && meals.length > 0
  const showMental = Boolean(mentalSuggestion)
  const workout = training.workout
  const gentleWorkout =
    movementEnabled &&
    !completedWorkout &&
    Boolean(workout && (workout.difficulty === "makkelijk" || GENTLE_TYPES.has(workout.type)))
  // "Even voor jezelf" only when it adds something: not next to a mind
  // exercise, and not next to a walk or mobility session that already is
  // the calm moment.
  const showRecoveryRow = showRecovery && !showMental && Boolean(recovery.title) && !gentleWorkout
  const recoveryHref = recovery.href && recovery.href !== GENERIC_RECOVERY_HREF ? recovery.href : null
  const showGrocery = nutritionEnabled
  const showWeekLink = movementEnabled || nutritionEnabled
  const hasPlan = movementEnabled || showMeals || showGrocery || showMental || showRecoveryRow

  // The day voice is said only here (Vandaag hides the roadmap's own why),
  // so keep the section for it even when nothing in the plan is switched on.
  if (!hasPlan && !focusLine) return null

  return (
    <section aria-labelledby="voor-vandaag-heading">
      <SectionHeader
        id="voor-vandaag-heading"
        title="Voor jou vandaag"
        action={
          showWeekLink ? (
            <SectionAction href={FEATURES.week.href}>{FEATURES.week.linkLabel}</SectionAction>
          ) : undefined
        }
      />
      {focusLine && (
        <div className={cn("-mt-1 flex items-start gap-1", hasPlan && "mb-3")}>
          <p className="min-w-0 flex-1 text-sm text-ink-soft">{focusLine}</p>
          {focusAction && <span className="-my-2.5 shrink-0">{focusAction}</span>}
        </div>
      )}

      {hasPlan && (
        <Card padding="none" className="divide-y divide-line overflow-hidden">
          {movementEnabled && (
            <div id="beweging" className="scroll-mt-4">
              <TodayMovementCard
                userId={userId}
                date={date}
                weekStartISO={weekStartISO}
                suggested={training.workout}
                reason={training.reason}
                alternatives={workoutAlternatives}
                completed={completedWorkout}
                hideReason={hideWorkoutReason}
                emphasis="primary"
                embedded
              />
            </div>
          )}

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
            <Link href={`${FEATURES.boodschappen.href}?modus=dag`} className={rowLinkClass}>
              <RowTile>
                <ShoppingCart {...ICON.sm} />
              </RowTile>
              <span className="min-w-0 flex-1 text-base font-medium text-ink">Boodschappen voor vandaag</span>
              <ChevronRight {...iconProps("sm", "text-ink-soft")} aria-hidden />
            </Link>
          )}

          {showMental && mentalSuggestion && (
            <Link href={`/mentale-rust/${mentalSuggestion.exercise.id}`} className={rowLinkClass}>
              <RowTile>
                <Brain {...ICON.sm} />
              </RowTile>
              <span className="min-w-0 flex-1">
                <span className="block type-eyebrow text-sage-dark">Voor je hoofd</span>
                <span className="block text-base font-medium text-ink">
                  {mentalSuggestion.exercise.title}
                  <span className="font-normal text-ink-soft"> · {mentalSuggestion.exercise.durationMinutes} min</span>
                </span>
                <span className="block text-sm text-ink-soft">{mentalSuggestion.text}</span>
              </span>
              <ChevronRight {...iconProps("sm", "text-ink-soft")} aria-hidden />
            </Link>
          )}

          {showRecoveryRow &&
            (recoveryHref ? (
              <Link href={recoveryHref} className={rowLinkClass}>
                <RowTile>
                  <Leaf {...ICON.sm} />
                </RowTile>
                <span className="min-w-0 flex-1">
                  <span className="block type-eyebrow text-sage-dark">Even voor jezelf</span>
                  <span className="block text-base font-medium text-ink">
                    {recovery.title}
                    <span className="font-normal text-ink-soft"> · {recovery.duration} min</span>
                  </span>
                </span>
                <ChevronRight {...iconProps("sm", "text-ink-soft")} aria-hidden />
              </Link>
            ) : (
              <div className="flex min-h-14 items-center gap-3 px-4 py-3">
                <RowTile>
                  <Leaf {...ICON.sm} />
                </RowTile>
                <span className="min-w-0 flex-1">
                  <span className="block type-eyebrow text-sage-dark">Even voor jezelf</span>
                  <span className="block text-base font-medium text-ink">
                    {recovery.title}
                    <span className="font-normal text-ink-soft"> · {recovery.duration} min</span>
                  </span>
                  <span className="block text-sm text-ink-soft">{recovery.description}</span>
                </span>
              </div>
            ))}
        </Card>
      )}
    </section>
  )
}
