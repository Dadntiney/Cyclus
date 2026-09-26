import Link from "next/link"
import { Card } from "@/components/ui/card"
import type { MindfulExercise } from "@/lib/data/mindful-exercises"

const KIND_EMOJI: Record<MindfulExercise["kind"], string> = {
  meditatie: "🧘",
  mindfulness: "🌿",
}

export function MindfulExerciseCard({ exercise }: { exercise: MindfulExercise }) {
  return (
    <Link href={`/mentale-rust/${exercise.id}`} className="block">
      <Card interactive className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0" aria-hidden>
            {KIND_EMOJI[exercise.kind]}
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
