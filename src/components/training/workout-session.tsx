"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ExerciseFavoriteButton } from "@/components/training/exercise-favorite-button"
import { ExerciseDemo } from "@/components/training/exercise-demo"
import { ExerciseVideoPlayer } from "@/components/training/exercise-video"
import { completeWorkoutSession, fetchAlternativeExercise } from "@/lib/actions/training"
import { lookupExerciseVideo } from "@/lib/data/exercise-videos"
import { triggerHaptic } from "@/lib/platform"
import type { Tables } from "@/types/database"

type Exercise = Tables<"exercises">
type Workout = Tables<"workouts">

function parseSteps(steps: Exercise["steps"]): string[] {
  return Array.isArray(steps) ? steps.filter((s): s is string => typeof s === "string") : []
}

/** Own media (self-hosted, scalable) always wins; the curated YouTube
 * library is only a stand-in for exercises that don't have real media yet. */
function ownDemo(ex: Exercise) {
  return ex.demo_video_url || ex.demo_image_url ? true : false
}

export function WorkoutSession({
  workout,
  exercises: initialExercises,
  favoriteExerciseIds,
  name,
}: {
  workout: Workout
  exercises: Exercise[]
  favoriteExerciseIds: string[]
  name: string | null
}) {
  const router = useRouter()
  const [started, setStarted] = useState(false)
  const [exercises, setExercises] = useState(initialExercises)
  const [index, setIndex] = useState(0)
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set())
  const [finished, setFinished] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isSwapping, setIsSwapping] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)

  const current = exercises[index]

  function advance(markDone: boolean) {
    if (markDone && current) {
      triggerHaptic("medium")
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
      <div className="flex flex-col gap-4">
        <Card>
          <p className="font-display text-xl text-ink mb-1">{workout.title}</p>
          <p className="text-sm text-ink-soft mb-4">
            {workout.duration} minuten · {exercises.length} oefeningen
          </p>
          {workout.description && <p className="text-sm text-ink-soft mb-5">{workout.description}</p>}
          <Button onClick={() => setStarted(true)}>Training starten</Button>
        </Card>

        {exercises.length > 0 && (
          <Card>
            <p className="text-sm font-medium text-ink mb-3">Wat ga je doen?</p>
            <ul className="flex flex-col gap-3">
              {exercises.map((ex, i) => {
                const hasOwnDemo = ownDemo(ex)
                const video = hasOwnDemo ? null : lookupExerciseVideo(ex.name)
                const hasPreview = hasOwnDemo || Boolean(video)
                const expanded = previewId === ex.id
                return (
                  <li key={ex.id} className="flex flex-col gap-2.5">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 h-5 w-5 rounded-full bg-sage-soft text-sage-dark text-[11px] font-semibold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink">{ex.name}</p>
                        <p className="text-xs text-ink-soft">
                          {ex.muscle_group ? `${ex.muscle_group} · ` : ""}
                          {ex.sets ? `${ex.sets} sets` : ""}
                          {ex.sets && ex.reps ? " · " : ""}
                          {ex.reps ?? ""}
                        </p>
                        {hasPreview && (
                          <button
                            type="button"
                            onClick={() => setPreviewId(expanded ? null : ex.id)}
                            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-sage-dark touch-manipulation"
                          >
                            <PlayCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
                            {expanded ? "Verberg uitvoering" : "Bekijk uitvoering"}
                          </button>
                        )}
                      </div>
                    </div>
                    {expanded && hasOwnDemo && (
                      <ExerciseDemo
                        name={ex.name}
                        muscleGroup={ex.muscle_group}
                        videoUrl={ex.demo_video_url}
                        imageUrl={ex.demo_image_url}
                        className="ml-8 aspect-video w-[calc(100%-2rem)] rounded-2xl"
                      />
                    )}
                    {expanded && !hasOwnDemo && video && (
                      <div className="pl-8">
                        <ExerciseVideoPlayer video={video} exerciseName={ex.name} />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </Card>
        )}
      </div>
    )
  }

  if (finished) {
    const doneCount = doneIds.size
    return (
      <Card className="text-center">
        <p className="text-3xl mb-2">🎉</p>
        <p className="font-display text-xl text-ink mb-1">
          Mooi gedaan{name ? `, ${name}` : ""}.
        </p>
        <p className="text-sm text-ink-soft mb-1">
          Je hebt {doneCount} van de {exercises.length} oefeningen afgerond.
        </p>
        <p className="text-sm text-ink-soft mb-5">Je hebt vandaag weer iets voor jezelf gedaan.</p>
        <Button onClick={handleFinishWorkout} disabled={isPending}>
          {isPending ? "Bezig..." : "Training afronden"}
        </Button>
      </Card>
    )
  }

  if (!current) return null

  const steps = parseSteps(current.steps)
  const currentHasOwnDemo = ownDemo(current)
  const currentVideo = currentHasOwnDemo ? null : lookupExerciseVideo(current.name)

  return (
    <Card>
      <p className="text-xs text-ink-soft mb-1">
        Oefening {index + 1} van {exercises.length}
        {current.muscle_group ? ` · ${current.muscle_group}` : ""}
      </p>
      {currentVideo ? (
        <div className="mb-3">
          <ExerciseVideoPlayer video={currentVideo} exerciseName={current.name} />
        </div>
      ) : (
        <ExerciseDemo
          name={current.name}
          muscleGroup={current.muscle_group}
          videoUrl={current.demo_video_url}
          imageUrl={current.demo_image_url}
          className="aspect-video w-full rounded-2xl mb-3"
        />
      )}
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="font-display text-xl text-ink">{current.name}</p>
        <ExerciseFavoriteButton
          exerciseId={current.id}
          initialFavorited={favoriteExerciseIds.includes(current.id)}
        />
      </div>
      {(current.sets || current.reps) && (
        <p className="text-sm text-sage-dark font-medium mb-4">
          {current.sets ? `${current.sets} sets` : ""}
          {current.sets && current.reps ? " · " : ""}
          {current.reps ?? ""}
        </p>
      )}

      {steps.length > 0 ? (
        <ol className="flex flex-col gap-2.5 mb-5">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-2.5 text-[15px] text-ink-soft leading-relaxed">
              <span className="shrink-0 h-5 w-5 rounded-full bg-cream-soft text-ink text-[11px] font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      ) : (
        current.instructions && (
          <p className="text-[15px] text-ink-soft leading-relaxed mb-5">{current.instructions}</p>
        )
      )}

      {current.common_mistakes && (
        <div className="rounded-2xl bg-peach-soft/60 p-3.5 mb-3">
          <p className="text-xs font-medium text-ink mb-1">Let op</p>
          <p className="text-sm text-ink-soft">{current.common_mistakes}</p>
        </div>
      )}

      {current.why_it_helps && (
        <div className="rounded-2xl bg-sage-soft p-3.5 mb-3">
          <p className="text-xs font-medium text-sage-dark mb-1">Waarom deze oefening</p>
          <p className="text-sm text-ink-soft">{current.why_it_helps}</p>
        </div>
      )}

      {current.fun_fact && (
        <div className="flex gap-2 rounded-2xl bg-cream-soft p-3.5 mb-5">
          <Sparkles className="h-4 w-4 text-sage-dark shrink-0 mt-0.5" strokeWidth={1.75} />
          <p className="text-sm text-ink-soft">{current.fun_fact}</p>
        </div>
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
