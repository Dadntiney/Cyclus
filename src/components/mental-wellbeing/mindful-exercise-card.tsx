import Link from "next/link"
import { Flower2, Leaf } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { MindfulExercise } from "@/lib/data/mindful-exercises"

const KIND_ICON: Record<MindfulExercise["kind"], typeof Flower2> = {
  meditatie: Flower2,
  mindfulness: Leaf,
}

export function MindfulExerciseCard({ exercise }: { exercise: MindfulExercise }) {
  const Icon = KIND_ICON[exercise.kind]
  return (
    <Link href={`/mentale-rust/${exercise.id}`} className="block">
      <Card interactive className="p-4">
        <div className="flex items-start gap-3">
          <span className="shrink-0 h-9 w-9 rounded-full bg-surface/70 flex items-center justify-center" aria-hidden>
            <Icon className="h-4.5 w-4.5 text-sage-dark" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="font-medium text-ink text-base">{exercise.title}</p>
            <p className="text-xs text-ink-soft mt-0.5">
              {exercise.kind === "meditatie" ? "Meditatie" : "Mindfulness"} · {exercise.durationMinutes} min
            </p>
          </div>
        </div>
      </Card>
    </Link>
  )
}
