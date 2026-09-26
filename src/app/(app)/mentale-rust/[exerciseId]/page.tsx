import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { getMindfulExercise } from "@/lib/data/mindful-exercises"
import { GuidedExercise } from "@/components/mental-wellbeing/guided-exercise"

export default async function MindfulExercisePage({
  params,
}: {
  params: Promise<{ exerciseId: string }>
}) {
  const { exerciseId } = await params
  const exercise = getMindfulExercise(exerciseId)
  if (!exercise) notFound()

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      <Link
        href="/mentale-rust"
        className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft mb-4 touch-manipulation"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        Mijn mentale rust
      </Link>
      <h1 className="font-display text-2xl text-ink mb-1">{exercise.title}</h1>
      <p className="text-sm text-ink-soft mb-6">
        {exercise.kind === "meditatie" ? "Meditatie" : "Mindfulness"} · {exercise.durationMinutes} min
      </p>
      <GuidedExercise exercise={exercise} />
    </div>
  )
}
