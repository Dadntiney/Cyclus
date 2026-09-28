import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { RecipeImage } from "@/components/nutrition/recipe-image"
import { TodayMovementCard, type TodayWorkoutOption } from "@/components/today/today-movement-card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Recommendation } from "@/lib/recommendations/engine"
import type { MentalWellbeingSuggestion } from "@/lib/mental-wellbeing/suggestions"

/**
 * One composition for today’s plan — primary action + secondary rows
 * inside a single surface. Not a stack of equal dashboard cards.
 *
 * When prioritizeRest: mental/recovery leads; movement becomes quiet.
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
  prioritizeRest = false,
  showRecovery = false,
}: {
  recommendation: Recommendation
  userId: string
  date: string
  weekStartISO: string
  workoutAlternatives: TodayWorkoutOption[]
  completedWorkout: { workoutId: string; title: string; duration: number } | null
  mentalSuggestion?: MentalWellbeingSuggestion | null
  focusLine?: string | null
  /** Soft day: lead with rest/mental, not a hard workout CTA. */
  prioritizeRest?: boolean
  /** When false, hide the generic recovery row (mental suggestion stays). */
  showRecovery?: boolean
}) {
  const { training, nutrition, recovery, movementEnabled, nutritionEnabled } = recommendation

  const showNutrition = nutritionEnabled && Boolean(nutrition.recipe)
  const showMental = Boolean(mentalSuggestion)
  const showRecoveryRow = showRecovery && !showMental && Boolean(recovery.title)
  const hasRestPrimary = prioritizeRest && (showMental || showRecoveryRow)

  return (
    <section aria-labelledby="voor-vandaag-heading">
      <h2 id="voor-vandaag-heading" className="font-display text-lg text-ink">
        Voor jou vandaag
      </h2>
      {focusLine ? (
        <p className="text-sm text-ink-soft mt-1.5 mb-3.5 leading-relaxed">{focusLine}</p>
      ) : (
        <div className="mb-3.5" aria-hidden />
      )}

      <div className="rounded-3xl bg-sage-soft/55 overflow-hidden">
        {hasRestPrimary ? (
          <>
            {showMental && mentalSuggestion ? (
              <div className="px-4 pt-4 pb-3">
                <p className="text-xs font-medium text-info mb-1">Voor je hoofd</p>
                <p className="font-display text-lg text-ink leading-snug">
                  {mentalSuggestion.text}
                </p>
                <Link
                  href={`/mentale-rust/${mentalSuggestion.exercise.id}`}
                  className={cn(buttonVariants(), "mt-3")}
                >
                  {mentalSuggestion.exercise.title} · {mentalSuggestion.exercise.durationMinutes}{" "}
                  min
                </Link>
              </div>
            ) : (
              <div className="px-4 pt-4 pb-3">
                <p className="text-xs font-medium text-sage-dark mb-1">Even voor jezelf</p>
                <p className="font-display text-lg text-ink leading-snug">{recovery.title}</p>
                <p className="text-sm text-ink-soft mt-1 leading-relaxed">{recovery.description}</p>
                {recovery.href ? (
                  <Link href={recovery.href} className={cn(buttonVariants(), "mt-3")}>
                    {recovery.ctaLabel ?? "Bekijk voorstel"} · {recovery.duration} min
                  </Link>
                ) : (
                  <p className="text-sm text-ink-soft mt-2">{recovery.duration} minuten</p>
                )}
              </div>
            )}

            <div className="border-t border-sage/15 divide-y divide-sage/15">
              {movementEnabled && (
                <TodayMovementCard
                  userId={userId}
                  date={date}
                  weekStartISO={weekStartISO}
                  suggested={training.workout}
                  reason={training.reason}
                  alternatives={workoutAlternatives}
                  completed={completedWorkout}
                  emphasis="quiet"
                  embedded
                />
              )}
              {showNutrition && nutrition.recipe && (
                <NutritionRow
                  id={nutrition.recipe.id}
                  title={nutrition.recipe.title}
                  imageUrl={nutrition.recipe.image_url}
                />
              )}
            </div>
          </>
        ) : (
          <>
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
                {showMental && mentalSuggestion ? (
                  <>
                    <p className="text-xs font-medium text-info mb-1">Voor je hoofd</p>
                    <p className="font-display text-lg text-ink leading-snug">
                      {mentalSuggestion.text}
                    </p>
                    <Link
                      href={`/mentale-rust/${mentalSuggestion.exercise.id}`}
                      className={cn(buttonVariants(), "mt-3")}
                    >
                      {mentalSuggestion.exercise.title} ·{" "}
                      {mentalSuggestion.exercise.durationMinutes} min
                    </Link>
                  </>
                ) : showRecoveryRow ? (
                  <>
                    <p className="text-xs font-medium text-sage-dark mb-1">Even voor jezelf</p>
                    <p className="font-display text-lg text-ink leading-snug">{recovery.title}</p>
                    {recovery.href ? (
                      <Link href={recovery.href} className={cn(buttonVariants(), "mt-3")}>
                        {recovery.ctaLabel ?? "Bekijk voorstel"} · {recovery.duration} min
                      </Link>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm text-ink-soft">
                    Beweging staat uit. Je kunt dit weer aanzetten in je profiel.
                  </p>
                )}
              </div>
            )}

            {(showNutrition || showMental || showRecoveryRow) && (
              <div className="border-t border-sage/15 divide-y divide-sage/15">
                {showNutrition && nutrition.recipe && (
                  <NutritionRow
                    id={nutrition.recipe.id}
                    title={nutrition.recipe.title}
                    imageUrl={nutrition.recipe.image_url}
                  />
                )}

                {showMental && mentalSuggestion && movementEnabled && (
                  <Link
                    href={`/mentale-rust/${mentalSuggestion.exercise.id}`}
                    className="block px-4 py-3.5 touch-manipulation motion-safe:active:bg-sage-soft/80 transition-colors"
                  >
                    <p className="text-xs font-medium text-info mb-0.5">Voor je hoofd</p>
                    <p className="text-sm text-ink leading-snug">{mentalSuggestion.text}</p>
                    <p className="text-sm font-medium text-info mt-1 inline-flex items-center gap-0.5">
                      {mentalSuggestion.exercise.title} ·{" "}
                      {mentalSuggestion.exercise.durationMinutes} min
                      <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                    </p>
                  </Link>
                )}

                {showRecoveryRow && movementEnabled &&
                  (recovery.href ? (
                    <Link
                      href={recovery.href}
                      className="flex items-center justify-between gap-3 px-4 py-3.5 touch-manipulation motion-safe:active:bg-sage-soft/80 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-sage-dark">Even voor jezelf</p>
                        <p className="text-sm font-medium text-ink truncate">
                          {recovery.title}
                          <span className="font-normal text-ink-soft">
                            {" "}
                            · {recovery.duration} min
                          </span>
                        </p>
                      </div>
                      <ChevronRight
                        className="h-4 w-4 text-ink-soft shrink-0"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </Link>
                  ) : (
                    <div className="px-4 py-3.5">
                      <p className="text-xs font-medium text-sage-dark">Even voor jezelf</p>
                      <p className="text-sm font-medium text-ink">
                        {recovery.title}
                        <span className="font-normal text-ink-soft">
                          {" "}
                          · {recovery.duration} min
                        </span>
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

function NutritionRow({
  id,
  title,
  imageUrl,
}: {
  id: string
  title: string
  imageUrl: string | null
}) {
  return (
    <Link
      href={`/voeding/${id}`}
      className="flex items-center gap-3 px-4 py-3.5 touch-manipulation motion-safe:active:bg-sage-soft/80 transition-colors"
    >
      <RecipeImage
        title={title}
        imageUrl={imageUrl}
        className="h-11 w-11 rounded-xl shrink-0"
        sizes="44px"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-sage-dark">Voeding</p>
        <p className="text-sm font-medium text-ink leading-snug truncate">{title}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={2} aria-hidden />
    </Link>
  )
}
