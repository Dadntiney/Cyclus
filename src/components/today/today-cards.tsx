import Link from "next/link"
import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Recommendation } from "@/lib/recommendations/engine"

export function TodayCards({ recommendation }: { recommendation: Recommendation }) {
  const { training, nutrition, recovery, dayFocus, movementEnabled, nutritionEnabled } = recommendation

  return (
    <div>
      <h2 className="font-display text-lg text-ink mb-1">Vandaag voor jou</h2>
      {dayFocus && <p className="text-base text-ink-soft mb-3">{dayFocus}</p>}
      <div className="flex flex-col gap-4">
        {movementEnabled && (
          <Card>
            <p className="text-sm font-medium text-sage-dark mb-1">🏋️ Beweging</p>
            {training.workout ? (
              <>
                <p className="font-display text-xl text-ink">{training.workout.title}</p>
                <p className="text-sm text-ink-soft mt-0.5">{training.workout.duration} minuten</p>
                <p className="text-base text-ink-soft mt-2">{training.reason}</p>
                <Link href={`/training/${training.workout.id}`} className={cn(buttonVariants(), "mt-3")}>
                  Start training
                </Link>
              </>
            ) : (
              <p className="text-base text-ink-soft mt-1">{training.reason}</p>
            )}
          </Card>
        )}

        {nutritionEnabled && (
          <Card>
            <p className="text-sm font-medium text-sage-dark mb-1">🥗 Voeding</p>
            {nutrition.recipe ? (
              <>
                <p className="font-display text-xl text-ink">{nutrition.recipe.title}</p>
                <p className="text-base text-ink-soft mt-2">{nutrition.reason}</p>
                <Link
                  href={`/voeding/${nutrition.recipe.id}`}
                  className={cn(buttonVariants({ variant: "secondary" }), "mt-3")}
                >
                  Bekijk recept
                </Link>
              </>
            ) : (
              <p className="text-base text-ink-soft mt-1">
                Nog geen recepten beschikbaar. Kijk later nog eens terug.
              </p>
            )}
          </Card>
        )}

        <Card>
          <p className="text-sm font-medium text-sage-dark mb-1">🧘 Herstel</p>
          <p className="font-display text-xl text-ink">{recovery.title}</p>
          <p className="text-sm text-ink-soft mt-0.5">{recovery.duration} minuten</p>
          <p className="text-base text-ink-soft mt-2">{recovery.description}</p>
        </Card>
      </div>
    </div>
  )
}
