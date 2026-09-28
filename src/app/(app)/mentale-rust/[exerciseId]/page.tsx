import { notFound } from "next/navigation"
import { getMindfulExercise } from "@/lib/data/mindful-exercises"
import { GuidedExercise } from "@/components/mental-wellbeing/guided-exercise"
import { BackButton } from "@/components/ui/back-button"

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
      <BackButton href="/mentale-rust" label="Mijn mentale rust" />
      <h1 className="font-display text-2xl text-ink mb-1">{exercise.title}</h1>
      <p className="text-sm text-ink-soft mb-6">
        {exercise.kind === "meditatie" ? "Meditatie" : "Mindfulness"} · {exercise.durationMinutes} min
      </p>
      <GuidedExercise exercise={exercise} />
    </div>
  )
}
