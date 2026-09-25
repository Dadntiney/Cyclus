"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { completeWorkoutSession, fetchAlternativeExercise } from "@/lib/actions/training"
import type { Tables } from "@/types/database"

type Exercise = Tables<"exercises">
type Workout = Tables<"workouts">

export function WorkoutSession({
  workout,
  exercises: initialExercises,
}: {
  workout: Workout
  exercises: Exercise[]
}) {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  const [exercises, setExercises] = useState(initialExercises)
  const [index, setIndex] = useState(0)
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set())
  const [finished, setFinished] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isSwapping, setIsSwapping] = useState(false)

  const current = exercises[index]

  function advance(markDone: boolean) {
    if (markDone && current) {
      setDoneIds((prev) => new Set(prev).add(current.id))
    }
    if (index + 1 >= exercises.length) {
      setFinished(true)
    } else {
      setIndex((i) => i + 1)
    }
  }

  async function handleReplace() {
    if (!current) return
    setIsSwapping(true)
    try {
      const replacement = await fetchAlternativeExercise(current.muscle_group, current.id)
      if (replacement && !exercises.some((e) => e.id === replacement.id)) {
        setExercises((prev) => prev.map((e, i) => (i === index ? replacement : e)))
      }
    } finally {
      setIsSwapping(false)
    }
  }

  function handleFinishWorkout() {
    startTransition(async () => {
      await completeWorkoutSession(workout.id)
      router.push("/training")
      router.refresh()
    })
  }

  if (!started) {
    return (
      <Card>
        <p className="font-display text-xl text-ink mb-1">{workout.title}</p>
        <p className="text-sm text-ink-soft mb-4">
          {workout.duration} minuten · {exercises.length} oefeningen
        </p>
        {workout.description && <p className="text-sm text-ink-soft mb-5">{workout.description}</p>}
        <Button onClick={() => setStarted(true)}>Workout starten</Button>
      </Card>
    )
  }

  if (finished) {
    const doneCount = doneIds.size
    return (
      <Card className="text-center">
        <p className="text-3xl mb-2">🎉</p>
        <p className="font-display text-xl text-ink mb-1">Goed gedaan!</p>
        <p className="text-sm text-ink-soft mb-5">
          Je hebt {doneCount} van de {exercises.length} oefeningen afgerond.
        </p>
        <Button onClick={handleFinishWorkout} disabled={isPending}>
          {isPending ? "Bezig..." : "Workout afronden"}
        </Button>
      </Card>
    )
  }

  if (!current) return null

  return (
    <Card>
      <p className="text-xs text-ink-soft mb-1">
        Oefening {index + 1} van {exercises.length}
      </p>
      <p className="font-display text-xl text-ink mb-2">{current.name}</p>
      {(current.sets || current.reps) && (
        <p className="text-sm text-sage-dark font-medium mb-3">
          {current.sets ? `${current.sets} sets` : ""}
          {current.sets && current.reps ? " · " : ""}
          {current.reps ?? ""}
        </p>
      )}
      {current.instructions && (
        <p className="text-sm text-ink-soft mb-6">{current.instructions}</p>
      )}

      <div className="flex flex-col gap-2.5">
        <Button onClick={() => advance(true)}>Oefening afronden</Button>
        <div className="flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={() => advance(false)}>
            Overslaan
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleReplace}
            disabled={isSwapping || !current.muscle_group}
          >
            {isSwapping ? "Bezig..." : "Vervangen"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
