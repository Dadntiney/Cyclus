"use client"

import { useEffect, useId, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
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
import { FEATURES } from "@/lib/navigation/features"
import { useBackTarget } from "@/lib/navigation/hooks"
import { iconProps } from "@/lib/ui/icon"

/**
 * One exercise, two ways to follow it (ontwerpvisie §7.6). It starts right
 * away in the mode she used last (Lezen by default); "Lezen | Luisteren"
 * switches inline. The intro is the page subtitle, so it shows once.
 * - Lezen: one step at a time, "Stap 2 van 6" with dots, no clock.
 * - Luisteren: immersive, play/pause in the thumb zone (ListenMode).
 * Both end on the same calm "Klaar", which goes back to where she came from
 * — and says where that is ("Terug naar Vandaag"), not always "overzicht".
 * Focus never drops to the page: after "Nog een keer" it moves to the first
 * action of the new run, after "Stoppen" to Afspelen.
 */
export function GuidedExercise({ exercise }: { exercise: MindfulExercise }) {
  const router = useRouter()
  const pathname = usePathname()
  const backTarget = useBackTarget(pathname, {
    href: FEATURES.mentaleRust.href,
    label: FEATURES.mentaleRust.label,
  })
  const leaveLabel =
    backTarget && backTarget.label !== "Terug" ? `Terug naar ${backTarget.label}` : "Terug"
  const mode = useExerciseMode()
  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState(false)
  // A fresh ListenMode after "Stoppen" or "Nog een keer".
  const [listenRun, setListenRun] = useState(0)
  const doneTitleId = useId()
  const nextRef = useRef<HTMLButtonElement>(null)
  // The control she used (Nog een keer, Stoppen) is gone after it runs:
  // focus continues on "Volgende" of the first step, or on Afspelen.
  const focusNextOnStart = useRef(false)
  const [focusPlay, setFocusPlay] = useState(false)

  const totalSteps = exercise.steps.length
  const onLastStep = stepIndex >= totalSteps - 1

  useEffect(() => {
    if (!done) return
    window.scrollTo({ top: 0, behavior: "auto" })
    document.getElementById(doneTitleId)?.focus({ preventScroll: true })
  }, [done, doneTitleId])

  useEffect(() => {
    if (done || !focusNextOnStart.current) return
    focusNextOnStart.current = false
    nextRef.current?.focus({ preventScroll: true })
  }, [done, listenRun])

  function next() {
    if (onLastStep) setDone(true)
    else setStepIndex((i) => i + 1)
  }

  function again() {
    setStepIndex(0)
    setListenRun((n) => n + 1)
    setDone(false)
    if (mode === "luisteren") setFocusPlay(true)
    else focusNextOnStart.current = true
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
          <Button className="w-full" onClick={() => leaveFlow(router, FEATURES.mentaleRust.href)}>
            {leaveLabel}
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
          onStop={() => {
            setListenRun((n) => n + 1)
            setFocusPlay(true)
          }}
          focusPlay={focusPlay}
          onPlayFocused={() => setFocusPlay(false)}
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
              {/* aria-disabled, not disabled: on step 1 the button keeps
                  focus instead of dropping it to the page. */}
              <IconButton
                label="Vorige stap"
                icon={ChevronLeft}
                tone="soft"
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                aria-disabled={stepIndex === 0 || undefined}
                className="aria-disabled:opacity-50"
              />
              <Button ref={nextRef} className="flex-1" onClick={next}>
                {onLastStep ? "Afronden" : "Volgende"}
              </Button>
            </div>
          </StickyActionBar>
        </>
      )}
    </>
  )
}
