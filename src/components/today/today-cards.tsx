import Link from "next/link"
import { Dumbbell, Salad, Sparkles } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { WorkoutImage } from "@/components/training/workout-image"
import { RecipeImage } from "@/components/nutrition/recipe-image"
import { cn } from "@/lib/utils"
import type { Recommendation } from "@/lib/recommendations/engine"

export function TodayCards({ recommendation }: { recommendation: Recommendation }) {
  const { training, nutrition, recovery, dayFocus, movementEnabled, nutritionEnabled } = recommendation

  return (
    <div>
      <h2 className="font-display text-lg text-ink mb-1">Voor jou vandaag</h2>
      {dayFocus && <p className="text-sm text-ink-soft mb-3">{dayFocus}</p>}
      <div className="flex flex-col gap-3">
        {movementEnabled && (
          <div className="rounded-2xl border border-line/70 p-3.5">
            <p className="text-xs font-medium text-sage-dark mb-2 inline-flex items-center gap-1">
              <Dumbbell className="h-3.5 w-3.5" strokeWidth={1.75} />
              Beweging
            </p>
            {training.workout ? (
              <>
                <div className="flex items-start gap-3">
                  <WorkoutImage
                    type={training.workout.type}
                    title={training.workout.title}
                    imageUrl={training.workout.image_url}
                    className="h-16 w-16 rounded-xl shrink-0"
                    sizes="64px"
                  />
                  <div className="min-w-0">
                    <p className="font-display text-lg text-ink leading-snug">{training.workout.title}</p>
                    <p className="text-sm text-ink-soft mt-0.5">{training.workout.duration} minuten</p>
                  </div>
                </div>
                <p className="text-sm text-ink-soft mt-2">{training.reason}</p>
                <Link href={`/training/${training.workout.id}`} className={cn(buttonVariants(), "mt-3")}>
                  Start training
                </Link>
              </>
            ) : (
              <p className="text-sm text-ink-soft mt-1">{training.reason}</p>
            )}
          </div>
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
              className={cn(buttonVariants({ variant: "secondary" }), "mt-3")}
            >
              {recovery.ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
