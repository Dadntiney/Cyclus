import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { RecipeImage } from "@/components/nutrition/recipe-image"
import { TodayMovementCard, type TodayWorkoutOption } from "@/components/today/today-movement-card"
import type { Recommendation } from "@/lib/recommendations/engine"
import type { MentalWellbeingSuggestion } from "@/lib/mental-wellbeing/suggestions"

/**
 * Today’s plan — one primary action, secondary rows underneath.
 * Not a stack of equal “dashboard cards”.
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
}: {
  recommendation: Recommendation
  userId: string
  date: string
  weekStartISO: string
  workoutAlternatives: TodayWorkoutOption[]
  completedWorkout: { workoutId: string; title: string; duration: number } | null
  mentalSuggestion?: MentalWellbeingSuggestion | null
  /** Optional personalized one-liner (only when check-in actually shaped today). */
  focusLine?: string | null
}) {
  const { training, nutrition, recovery, movementEnabled, nutritionEnabled } = recommendation

  const showNutrition = nutritionEnabled && Boolean(nutrition.recipe)
  // Mental suggestion replaces the generic recovery row when check-in signals it.
  const showMental = Boolean(mentalSuggestion)
  const showRecovery = !showMental && Boolean(recovery.title)

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

      <div className="flex flex-col gap-3">
        {movementEnabled && (
          <TodayMovementCard
            userId={userId}
            date={date}
            weekStartISO={weekStartISO}
            suggested={training.workout}
            reason={training.reason}
            alternatives={workoutAlternatives}
            completed={completedWorkout}
            emphasis="primary"
          />
        )}

        {showNutrition && nutrition.recipe && (
          <Link
            href={`/voeding/${nutrition.recipe.id}`}
            className="flex items-center gap-3 rounded-2xl bg-cream-soft/70 px-3.5 py-3 touch-manipulation motion-safe:active:scale-[0.99] transition-transform"
          >
            <RecipeImage
              title={nutrition.recipe.title}
              imageUrl={nutrition.recipe.image_url}
              className="h-12 w-12 rounded-xl shrink-0"
              sizes="48px"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-sage-dark">Voeding</p>
              <p className="text-sm font-medium text-ink leading-snug truncate">
                {nutrition.recipe.title}
              </p>
              <p className="text-xs text-ink-soft mt-0.5 line-clamp-1">{nutrition.reason}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={2} aria-hidden />
          </Link>
        )}

        {showMental && mentalSuggestion && (
          <Link
            href={`/mentale-rust/${mentalSuggestion.exercise.id}`}
            className="rounded-2xl bg-info-soft/80 px-3.5 py-3 touch-manipulation motion-safe:active:scale-[0.99] transition-transform"
          >
            <p className="text-[11px] font-medium text-info mb-0.5">Voor je hoofd</p>
            <p className="text-sm text-ink leading-snug">{mentalSuggestion.text}</p>
            <p className="text-xs font-medium text-info mt-1.5 inline-flex items-center gap-0.5">
              {mentalSuggestion.exercise.title} · {mentalSuggestion.exercise.durationMinutes} min
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
            </p>
          </Link>
        )}

        {showRecovery &&
          (recovery.href ? (
            <Link
              href={recovery.href}
              className="flex items-center justify-between gap-3 rounded-2xl bg-cream-soft/70 px-3.5 py-3 touch-manipulation motion-safe:active:scale-[0.99] transition-transform"
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
            <div className="rounded-2xl bg-cream-soft/70 px-3.5 py-3">
              <p className="text-[11px] font-medium text-sage-dark">Even voor jezelf</p>
              <p className="text-sm font-medium text-ink">
                {recovery.title}
                <span className="font-normal text-ink-soft"> · {recovery.duration} min</span>
              </p>
            </div>
          ))}

        {!movementEnabled && !showNutrition && !showMental && !showRecovery && (
          <p className="text-sm text-ink-soft">
            Zet modules aan in je profiel om hier persoonlijke voorstellen te zien.
          </p>
        )}
      </div>
    </section>
  )
}
