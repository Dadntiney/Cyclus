import Link from "next/link"
import { Salad, Sparkles } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { RecipeImage } from "@/components/nutrition/recipe-image"
import { TodayMovementCard, type TodayWorkoutOption } from "@/components/today/today-movement-card"
import { cn } from "@/lib/utils"
import type { Recommendation } from "@/lib/recommendations/engine"

export function TodayCards({
  recommendation,
  userId,
  date,
  weekStartISO,
  workoutAlternatives,
  completedWorkout,
}: {
  recommendation: Recommendation
  userId: string
  date: string
  weekStartISO: string
  workoutAlternatives: TodayWorkoutOption[]
  completedWorkout: { workoutId: string; title: string; duration: number } | null
}) {
  const { training, nutrition, recovery, dayFocus, movementEnabled, nutritionEnabled } = recommendation

  return (
    <div>
      <h2 className="font-display text-lg text-ink mb-1">Voor jou vandaag</h2>
      {dayFocus && <p className="text-sm text-ink-soft mb-3">{dayFocus}</p>}
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
          />
        )}

        {nutritionEnabled && (
          <div className="rounded-2xl border border-line/70 p-3.5">
            <p className="text-xs font-medium text-sage-dark mb-2 inline-flex items-center gap-1">
              <Salad className="h-3.5 w-3.5" strokeWidth={1.75} />
              Voeding
            </p>
            {nutrition.recipe ? (
              <>
                <div className="flex items-start gap-3">
                  <RecipeImage
                    title={nutrition.recipe.title}
                    imageUrl={nutrition.recipe.image_url}
                    className="h-16 w-16 rounded-xl shrink-0"
                    sizes="64px"
                  />
                  <div className="min-w-0">
                    <p className="font-display text-lg text-ink leading-snug">{nutrition.recipe.title}</p>
                  </div>
                </div>
                <p className="text-sm text-ink-soft mt-2">{nutrition.reason}</p>
                <Link
                  href={`/voeding/${nutrition.recipe.id}`}
                  className={cn(buttonVariants({ variant: "secondary" }), "mt-3")}
                >
                  Bekijk recept
                </Link>
              </>
            ) : (
              <p className="text-sm text-ink-soft mt-1">
                Nog geen recepten beschikbaar. Kijk later nog eens terug.
              </p>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-line/70 p-3.5">
          <p className="text-xs font-medium text-sage-dark mb-1 inline-flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
            Herstel
          </p>
          <p className="font-display text-lg text-ink">{recovery.title}</p>
          <p className="text-sm text-ink-soft mt-0.5">{recovery.duration} minuten</p>
          <p className="text-sm text-ink-soft mt-1.5">{recovery.description}</p>
          {recovery.href && recovery.ctaLabel && (
            <Link
              href={recovery.href}
              className="mt-3 inline-flex items-center min-h-11 text-sm font-medium text-sage-dark touch-manipulation"
            >
              {recovery.ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
