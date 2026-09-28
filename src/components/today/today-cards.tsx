import Link from "next/link"
import { Dumbbell, Salad, Sparkles } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Recommendation } from "@/lib/recommendations/engine"

export function TodayCards({ recommendation }: { recommendation: Recommendation }) {
  const { training, nutrition, recovery, dayFocus, movementEnabled, nutritionEnabled } = recommendation

  return (
    <div>
      <h2 className="font-display text-lg text-ink mb-1">Vandaag voor jou</h2>
      {dayFocus && <p className="text-sm text-ink-soft mb-3">{dayFocus}</p>}
      <div className="flex flex-col gap-3">
        {movementEnabled && (
          <div className="rounded-2xl border border-line/70 p-3.5">
            <p className="text-xs font-medium text-sage-dark mb-1 inline-flex items-center gap-1">
              <Dumbbell className="h-3.5 w-3.5" strokeWidth={1.75} />
              Beweging
            </p>
            {training.workout ? (
              <>
                <p className="font-display text-lg text-ink">{training.workout.title}</p>
                <p className="text-sm text-ink-soft mt-0.5">{training.workout.duration} minuten</p>
                <p className="text-sm text-ink-soft mt-1.5">{training.reason}</p>
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
            <p className="text-xs font-medium text-sage-dark mb-1 inline-flex items-center gap-1">
              <Salad className="h-3.5 w-3.5" strokeWidth={1.75} />
              Voeding
            </p>
            {nutrition.recipe ? (
              <>
                <p className="font-display text-lg text-ink">{nutrition.recipe.title}</p>
                <p className="text-sm text-ink-soft mt-1.5">{nutrition.reason}</p>
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
        </div>
      </div>
    </div>
  )
}
