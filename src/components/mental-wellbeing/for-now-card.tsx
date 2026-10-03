import Link from "next/link"
import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { mindfulExerciseMeta } from "@/components/mental-wellbeing/mindful-exercise-card"
import type { MindfulExercise } from "@/lib/data/mindful-exercises"

/**
 * "Voor nu": one calm suggestion right under the header, with Start in
 * reach (WB-5). Picked on the server (Amsterdam time), so it is there
 * from the first paint and nothing below it shifts.
 */
export function ForNowCard({ exercise, evening }: { exercise: MindfulExercise; evening: boolean }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="type-eyebrow text-sage-dark">{evening ? "Voor vanavond" : "Voor nu"}</p>
        <h2 className="type-card-title text-ink">{exercise.title}</h2>
        <p className="text-sm text-ink-soft">{mindfulExerciseMeta(exercise)}</p>
      </div>
      <Link
        href={`/mentale-rust/${exercise.id}`}
        className={buttonVariants({ variant: "primary", size: "sm", className: "shrink-0" })}
      >
        Start<span className="sr-only">: {exercise.title}</span>
      </Link>
    </Card>
  )
}
