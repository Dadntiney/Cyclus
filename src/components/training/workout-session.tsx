"use client"

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Sparkles, X } from "lucide-react"
import { AppBarConfig } from "@/components/nav/app-bar-context"
import { PageFill } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Button, textActionClass } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import { Disclosure } from "@/components/ui/disclosure"
import { StickyActionBar } from "@/components/ui/sticky-action-bar"
import { toast } from "@/components/ui/toast"
import { ExerciseFavoriteButton } from "@/components/training/exercise-favorite-button"
import { ExerciseDemo } from "@/components/training/exercise-demo"
import { ExerciseInstructionPlayer } from "@/components/training/exercise-instruction-player"
import {
  difficultyLabel,
  muscleGroupLabel,
  workoutDisplayTitle,
  workoutMeta,
} from "@/components/training/workout-format"
import { completeWorkoutSession, fetchAlternativeExercise } from "@/lib/actions/training"
import { runAction } from "@/lib/client/run-action"
import { leaveFlow } from "@/lib/client/navigation-depth"
import { useImmersive } from "@/lib/hooks/use-immersive"
import { FEATURES } from "@/lib/navigation/features"
import { useBackTarget } from "@/lib/navigation/hooks"
import { lookupExerciseInstruction } from "@/lib/training/exercise-instructions"
import { formatExercisePrescription } from "@/lib/training/prescription"
import { workoutTypeLabel } from "@/lib/constants"
import { triggerHaptic } from "@/lib/platform"
import { ICON, iconProps } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"
import type { Tables } from "@/types/database"

type Exercise = Tables<"exercises">
type Workout = Tables<"workouts">

function parseSteps(steps: Exercise["steps"]): string[] {
  return Array.isArray(steps) ? steps.filter((s): s is string => typeof s === "string") : []
}

/** Self-hosted photo/video wins; otherwise the Cyclus instruction figure. */
function hasSelfHostedMedia(ex: Exercise) {
  return Boolean(ex.demo_video_url || ex.demo_image_url)
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/** "Core · 3 sets · 20-30 sec" */
function exerciseMeta(workoutType: string, ex: Exercise) {
  return [muscleGroupLabel(ex.muscle_group), formatExercisePrescription(workoutType, ex.sets, ex.reps)]
    .filter(Boolean)
    .join(" · ")
}

/**
 * A training in three screens (ontwerpvisie §7.5):
 * - Intro: the page header (title, "7 min · 3 oefeningen"), one card with
 *   the description and the exercises, and "Start training" in the thumb zone.
 * - Session (immersive: no tab bar): "✕ Stoppen" and "1 van 3" in the app
 *   bar, a segmented progress line, then per exercise its name, media,
 *   prescription, steps and one "Waarom & aandachtspunten". The next
 *   exercise starts at the top with focus on its name.
 * - Done: "Training afronden" saves it and goes back to where she came from.
 */
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
  const pathname = usePathname()
  const backTarget = useBackTarget(pathname, { href: FEATURES.beweging.href, label: FEATURES.beweging.label })
  const leaveLabel =
    backTarget && backTarget.label !== "Terug" ? `Terug naar ${backTarget.label}` : "Terug"
  const [started, setStarted] = useState(false)
  const [exercises, setExercises] = useState(initialExercises)
  const [index, setIndex] = useState(0)
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set())
  const [finished, setFinished] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isSwapping, setIsSwapping] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [finishError, setFinishError] = useState<string | null>(null)
  const [confirmingStop, setConfirmingStop] = useState(false)
  const exerciseHeadingRef = useRef<HTMLHeadingElement>(null)
  const doneTitleId = useId()

  // The tab bar steps aside from "Start" until she leaves the flow.
  useImmersive(started)

  const title = workoutDisplayTitle(workout.title)
  const current = exercises[index]
  const total = exercises.length
  const onLastExercise = index + 1 >= total

  // Every new exercise (and the start) begins at the top, with focus on its
  // name so a screen reader announces it.
  const stepKey = started && !finished && current ? `${index}:${current.id}` : null
  useEffect(() => {
    if (!stepKey) return
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })
    exerciseHeadingRef.current?.focus({ preventScroll: true })
  }, [stepKey])

  useEffect(() => {
    if (!finished) return
    window.scrollTo({ top: 0, behavior: "auto" })
    document.getElementById(doneTitleId)?.focus({ preventScroll: true })
  }, [finished, doneTitleId])

  const stopControl = useMemo(
    () => (
      <Button variant="ghost" size="sm" className="px-3" onClick={() => setConfirmingStop(true)}>
        <X {...ICON.md} aria-hidden />
        Stoppen
      </Button>
    ),
    [],
  )

  function advance(markDone: boolean) {
    if (markDone && current) {
      void triggerHaptic("light")
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
      } else {
        toast.show({ title: "Er is nu geen andere oefening voor deze spiergroep." })
      }
    } catch {
      toast.show({ title: "Vervangen lukte even niet. Probeer het zo nog eens." })
    } finally {
      setIsSwapping(false)
    }
  }

  function handleFinishWorkout() {
    setFinishError(null)
    startTransition(async () => {
      const result = await runAction(() => completeWorkoutSession(workout.id))
      if (result?.error) {
        setFinishError(result.error)
        return
      }
      void triggerHaptic("medium")
      leaveFlow(router, "/training")
    })
  }

  function stop() {
    setConfirmingStop(false)
    leaveFlow(router, "/training")
  }

  if (!started) {
    const eyebrow = [workoutTypeLabel(workout.type), difficultyLabel(workout.difficulty)].filter(Boolean).join(" · ")
    return (
      <>
        <PageHeader eyebrow={eyebrow} title={title} subtitle={workoutMeta(workout.duration, total)} />

        {(workout.description || total > 0) && (
          <Card className="flex flex-col gap-4">
            {workout.description && <p className="text-base text-ink">{workout.description}</p>}
            {total > 0 && (
              <div className="flex flex-col gap-3">
                <CardTitle as="h2">Wat ga je doen?</CardTitle>
                <ol className="flex flex-col gap-4">
                  {exercises.map((ex, i) => {
                    const selfHosted = hasSelfHostedMedia(ex)
                    const instruction = selfHosted ? null : lookupExerciseInstruction(ex.name)
                    const expanded = previewId === ex.id
                    const meta = exerciseMeta(workout.type, ex)
                    return (
                      <li key={ex.id} className="flex items-start gap-3">
                        <span
                          aria-hidden
                          className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-soft text-xs font-semibold text-sage-dark"
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-medium text-ink">{ex.name}</p>
                          {meta && <p className="text-sm text-ink-soft">{meta}</p>}
                          {(selfHosted || instruction) && (
                            <Disclosure
                              label="Bekijk uitvoering"
                              openLabel="Verberg uitvoering"
                              open={expanded}
                              onOpenChange={(open) => setPreviewId(open ? ex.id : null)}
                              contentClassName="pt-2"
                            >
                              {/* Only the open preview is mounted: the figure animates every frame. */}
                              {expanded &&
                                (selfHosted ? (
                                  <ExerciseDemo
                                    name={ex.name}
                                    muscleGroup={ex.muscle_group}
                                    videoUrl={ex.demo_video_url}
                                    imageUrl={ex.demo_image_url}
                                    className="aspect-video w-full rounded-inset"
                                  />
                                ) : instruction ? (
                                  <ExerciseInstructionPlayer instruction={instruction} compact />
                                ) : null)}
                            </Disclosure>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            )}
          </Card>
        )}

        <StickyActionBar className="mt-6">
          <Button className="w-full" onClick={() => setStarted(true)} disabled={total === 0}>
            Start training
          </Button>
        </StickyActionBar>
      </>
    )
  }

  if (finished) {
    const doneCount = doneIds.size
    // Everything skipped: no praise and no "klaar" for what did not happen.
    // Leaving without saving is the main action; saving it as done stays
    // possible (she may have done the exercises without tapping Klaar).
    const skippedAll = doneCount === 0
    return (
      <PageFill>
        <PageHeader
          titleId={doneTitleId}
          eyebrow={skippedAll ? undefined : "Training klaar"}
          title={skippedAll ? "Vandaag was het even niet het moment" : `Mooi gedaan${name ? `, ${name}` : ""}.`}
          compactTitle={skippedAll ? title : "Training klaar"}
          subtitle={
            skippedAll
              ? "Dat mag ook. Je lichaam vraagt niet elke dag hetzelfde; deze training staat er een andere keer gewoon weer."
              : `Je hebt ${doneCount} van de ${total} oefeningen afgerond. Je hebt vandaag weer iets voor jezelf gedaan.`
          }
        />
        <StickyActionBar>
          {finishError && (
            <p role="alert" className="text-sm text-danger">
              {finishError}
            </p>
          )}
          {skippedAll ? (
            <>
              <Button className="w-full" onClick={stop} disabled={isPending}>
                {leaveLabel}
              </Button>
              <div className="flex justify-center">
                <button type="button" className={textActionClass()} onClick={handleFinishWorkout} disabled={isPending}>
                  {isPending ? "Bezig…" : "Toch als gedaan opslaan"}
                </button>
              </div>
            </>
          ) : (
            <Button className="w-full" onClick={handleFinishWorkout} disabled={isPending}>
              {isPending ? "Bezig…" : "Training afronden"}
            </Button>
          )}
        </StickyActionBar>
      </PageFill>
    )
  }

  if (!current) return null

  const steps = parseSteps(current.steps)
  const currentSelfHosted = hasSelfHostedMedia(current)
  const currentInstruction = currentSelfHosted ? null : lookupExerciseInstruction(current.name)
  const prescription = formatExercisePrescription(workout.type, current.sets, current.reps)
  const muscle = muscleGroupLabel(current.muscle_group)
  const hasBackground = Boolean(current.why_it_helps || current.common_mistakes || current.fun_fact)
  const position = `Oefening ${index + 1} van ${total}`

  return (
    <>
      <AppBarConfig leading={stopControl} title={`${index + 1} van ${total}`} alwaysShowTitle />
      <h1 className="sr-only">{title}</h1>

      {/* Desktop has no app bar: the same stop and position live here. */}
      <div className="mb-4 hidden items-center justify-between gap-3 md:flex">
        <p className="type-eyebrow text-sage-dark">
          {title} · {position}
        </p>
        {stopControl}
      </div>

      <div
        role="progressbar"
        aria-label="Voortgang"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        aria-valuetext={position}
        className="mb-6 flex gap-1"
      >
        {exercises.map((ex, i) => (
          <span
            key={ex.id}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-slow ease-standard",
              i < index ? "bg-sage-fill" : i === index ? "bg-sage" : "bg-line",
            )}
          />
        ))}
      </div>

      {/* Keyed per exercise: a short crossfade, a fresh favourite and a closed disclosure. */}
      <div key={`${index}:${current.id}`} className="flex flex-col gap-4 animate-fade-in">
        <div className="flex items-start justify-between gap-3">
          <h2
            ref={exerciseHeadingRef}
            tabIndex={-1}
            data-focus-target=""
            className="type-section-title min-w-0 text-ink"
          >
            <span className="sr-only">{position}: </span>
            {current.name}
          </h2>
          <ExerciseFavoriteButton
            exerciseId={current.id}
            initialFavorited={favoriteExerciseIds.includes(current.id)}
            className="-my-2 -mr-2"
          />
        </div>

        {currentInstruction ? (
          <ExerciseInstructionPlayer instruction={currentInstruction} />
        ) : currentSelfHosted ? (
          <ExerciseDemo
            name={current.name}
            muscleGroup={current.muscle_group}
            videoUrl={current.demo_video_url}
            imageUrl={current.demo_image_url}
            className="aspect-video w-full rounded-card"
          />
        ) : null}

        {(prescription || muscle) && (
          <p className="text-base font-medium text-sage-dark">
            {[prescription, muscle].filter(Boolean).join(" · ")}
          </p>
        )}

        {steps.length > 0 ? (
          <ol className="flex flex-col gap-3">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-base text-ink">
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cream-soft text-xs font-semibold text-ink"
                >
                  {i + 1}
                </span>
                <span className="min-w-0">{step}</span>
              </li>
            ))}
          </ol>
        ) : (
          current.instructions && <p className="text-base text-ink">{current.instructions}</p>
        )}

        {hasBackground && (
          <Disclosure label="Waarom & aandachtspunten">
            <div className="flex flex-col gap-4">
              {current.why_it_helps && (
                <div>
                  <h3 className="text-sm font-semibold text-ink">Waarom deze oefening</h3>
                  <p className="mt-1 text-sm text-ink-soft">{current.why_it_helps}</p>
                </div>
              )}
              {current.common_mistakes && (
                <div>
                  <h3 className="text-sm font-semibold text-ink">Let op</h3>
                  <p className="mt-1 text-sm text-ink-soft">{current.common_mistakes}</p>
                </div>
              )}
              {current.fun_fact && (
                <p className="flex gap-2 text-sm text-ink-soft">
                  <Sparkles {...iconProps("sm", "mt-0.5 text-sage-dark")} aria-hidden />
                  <span className="min-w-0">{current.fun_fact}</span>
                </p>
              )}
            </div>
          </Disclosure>
        )}
      </div>

      <StickyActionBar className="mt-6">
        <Button className="w-full" onClick={() => advance(true)}>
          {onLastExercise ? "Klaar" : "Klaar, volgende"}
        </Button>
        <div className="flex justify-center gap-6">
          <button type="button" className={textActionClass()} onClick={() => advance(false)}>
            Overslaan
          </button>
          <button
            type="button"
            className={textActionClass("disabled:opacity-50 disabled:no-underline")}
            onClick={handleReplace}
            disabled={isSwapping || !current.muscle_group}
          >
            {isSwapping ? "Bezig…" : "Vervangen"}
          </button>
        </div>
      </StickyActionBar>

      <BottomSheet
        open={confirmingStop}
        onClose={() => setConfirmingStop(false)}
        title="Wil je stoppen?"
        footer={
          <div className="flex flex-col gap-2">
            <Button className="w-full" onClick={() => setConfirmingStop(false)}>
              Doorgaan
            </Button>
            <Button variant="ghost" className="w-full" onClick={stop}>
              Stoppen
            </Button>
          </div>
        }
      >
        <p className="text-sm text-ink-soft">
          Wat je al deed, was de moeite waard. Deze training wordt dan niet als afgerond bewaard.
        </p>
      </BottomSheet>
    </>
  )
}
