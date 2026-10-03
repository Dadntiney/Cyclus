"use client"

import { useEffect, useId, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronLeft } from "lucide-react"
import { Button, textActionClass } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { IconButton } from "@/components/ui/icon-button"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { StickyActionBar } from "@/components/ui/sticky-action-bar"
import { ListenMode } from "@/components/mental-wellbeing/listen-mode"
import { StepProgress } from "@/components/mental-wellbeing/guided-parts"
import {
  EXERCISE_MODE_OPTIONS,
  setExerciseMode,
  useExerciseMode,
} from "@/components/mental-wellbeing/exercise-mode"
import type { MindfulExercise } from "@/lib/data/mindful-exercises"
import { leaveFlow } from "@/lib/client/navigation-depth"
import { iconProps } from "@/lib/ui/icon"

/**
 * One exercise, two ways to follow it (ontwerpvisie §7.6). It starts right
 * away in the mode she used last (Lezen by default); "Lezen | Luisteren"
 * switches inline. The intro is the page subtitle, so it shows once.
 * - Lezen: one step at a time, "Stap 2 van 6" with dots, no clock.
 * - Luisteren: immersive, play/pause in the thumb zone (ListenMode).
 * Both end on the same calm "Klaar", which goes back to where she came from.
 */
export function GuidedExercise({ exercise }: { exercise: MindfulExercise }) {
  const router = useRouter()
  const mode = useExerciseMode()
  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState(false)
  // A fresh ListenMode after "Stoppen" or "Nog een keer".
  const [listenRun, setListenRun] = useState(0)
  const doneTitleId = useId()

  const totalSteps = exercise.steps.length
  const onLastStep = stepIndex >= totalSteps - 1

  useEffect(() => {
    if (!done) return
    window.scrollTo({ top: 0, behavior: "auto" })
    document.getElementById(doneTitleId)?.focus({ preventScroll: true })
  }, [done, doneTitleId])

  function next() {
    if (onLastStep) setDone(true)
    else setStepIndex((i) => i + 1)
  }

  function again() {
    setStepIndex(0)
    setListenRun((n) => n + 1)
    setDone(false)
  }

  if (done) {
    return (
      <>
        <Card className="flex flex-col items-center gap-3 py-8 text-center">
          <span
            aria-hidden
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sage-soft text-sage-dark"
          >
            <Check {...iconProps("lg")} />
          </span>
          <h2 id={doneTitleId} tabIndex={-1} data-focus-target="" className="type-section-title text-ink">
            Klaar
          </h2>
          <p className="max-w-sm text-base text-ink">{exercise.closing}</p>
          <p className="text-sm text-ink-soft">Je nam even een moment voor jezelf.</p>
        </Card>
        <StickyActionBar className="mt-6">
          <Button className="w-full" onClick={() => leaveFlow(router, "/mentale-rust")}>
            Terug naar overzicht
          </Button>
          <div className="flex justify-center">
            <button type="button" className={textActionClass()} onClick={again}>
              Nog een keer
            </button>
          </div>
        </StickyActionBar>
      </>
    )
  }

  return (
    <>
      <SegmentedControl
        aria-label="Hoe wil je deze oefening volgen?"
        options={EXERCISE_MODE_OPTIONS}
        value={mode}
        onChange={setExerciseMode}
        fullWidth
        className="mb-4"
      />

      {mode === "luisteren" ? (
        <ListenMode
          key={listenRun}
          exercise={exercise}
          onStop={() => setListenRun((n) => n + 1)}
          onFinish={() => setDone(true)}
          onRead={() => setExerciseMode("lezen")}
        />
      ) : (
        <>
          <Card className="flex flex-col items-center gap-6 py-8 text-center">
            <StepProgress current={stepIndex} total={totalSteps} />
            <div aria-live="polite" className="flex min-h-24 items-center justify-center">
              <p key={stepIndex} className="type-card-title text-ink animate-fade-in">
                {exercise.steps[stepIndex]}
              </p>
            </div>
          </Card>
          <StickyActionBar className="mt-6">
            <div className="flex items-center gap-3">
              <IconButton
                label="Vorige stap"
                icon={ChevronLeft}
                tone="soft"
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                disabled={stepIndex === 0}
              />
              <Button className="flex-1" onClick={next}>
                {onLastStep ? "Afronden" : "Volgende"}
              </Button>
            </div>
          </StickyActionBar>
        </>
      )}
    </>
  )
}
