import Link from "next/link"
import { ChevronRight, Flower2, Leaf } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { MindfulExercise } from "@/lib/data/mindful-exercises"
import { MENTAL_WELLBEING_CATEGORY_OPTIONS } from "@/lib/constants"
import { iconProps } from "@/lib/ui/icon"

const KIND_ICON: Record<MindfulExercise["kind"], typeof Flower2> = {
  meditatie: Flower2,
  mindfulness: Leaf,
}

/** "Meditatie · 5 min" */
export function mindfulExerciseMeta(exercise: Pick<MindfulExercise, "kind" | "durationMinutes">) {
  return `${exercise.kind === "meditatie" ? "Meditatie" : "Mindfulness"} · ${exercise.durationMinutes} min`
}

export function MindfulExerciseCard({ exercise }: { exercise: MindfulExercise }) {
  // The topic icon (adem, maan, wolk …) tells exercises apart better than
  // one shared meditation icon on twenty cards.
  const Icon =
    MENTAL_WELLBEING_CATEGORY_OPTIONS.find((opt) => opt.value === exercise.categories[0])?.icon ??
    KIND_ICON[exercise.kind]
  return (
    <Link href={`/mentale-rust/${exercise.id}`} className="block h-full rounded-card touch-manipulation">
      <Card padding="sm" interactive className="flex h-full items-center gap-3">
        <span
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sage-dark"
          aria-hidden
        >
          <Icon {...iconProps("md")} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-base font-medium text-ink">{exercise.title}</span>
          <span className="text-sm text-ink-soft">{mindfulExerciseMeta(exercise)}</span>
        </span>
        <ChevronRight {...iconProps("sm", "text-ink-soft")} aria-hidden />
      </Card>
    </Link>
  )
}
