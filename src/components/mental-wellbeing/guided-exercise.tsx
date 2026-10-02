"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Check, ChevronLeft, ChevronRight, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ListenMode } from "@/components/mental-wellbeing/listen-mode"
import type { MindfulExercise } from "@/lib/data/mindful-exercises"
import { leaveFlow } from "@/lib/client/navigation-depth"

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

type Mode = "choice" | "listen" | "read"

/**
 * Two ways to follow one exercise: "Lezen" is the original step-by-step
 * reading flow (self-paced, no forced per-step countdown), "Luisteren" is
 * audio-only via ListenMode, meant to be started and then left alone with
 * her eyes closed. Both end on the same finished screen regardless of which
 * one she picked.
 */
export function GuidedExercise({ exercise }: { exercise: MindfulExercise }) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("choice")
  const [stepIndex, setStepIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (mode !== "read" || done) return
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [mode, done])

  const totalSteps = exercise.steps.length
  const onLastStep = stepIndex === totalSteps - 1

  function next() {
    if (stepIndex < totalSteps - 1) {
      setStepIndex((i) => i + 1)
    } else {
      setDone(true)
    }
  }

  function back() {
    if (stepIndex > 0) setStepIndex((i) => i - 1)
  }

  function reset() {
    setMode("choice")
    setStepIndex(0)
    setElapsed(0)
    setDone(false)
  }

  if (done) {
    return (
      <Card className="text-center py-8">
        <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-sage-soft flex items-center justify-center">
          <Check className="h-6 w-6 text-sage-dark" strokeWidth={2.5} />
        </div>
        <p className="font-display text-xl text-ink mb-2">Klaar</p>
        <p className="text-sm text-ink-soft mb-1 max-w-sm mx-auto">{exercise.closing}</p>
        <p className="text-xs text-ink-soft mb-5">Je nam {formatElapsed(elapsed)} minuten voor jezelf.</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
          <Button onClick={reset}>Nog een keer</Button>
          <button
            type="button"
            onClick={() => leaveFlow(router, "/mentale-rust")}
            className="text-sm font-medium text-ink-soft min-h-11 px-2 touch-manipulation"
          >
            Terug naar overzicht
          </button>
        </div>
      </Card>
    )
  }

  if (mode === "choice") {
    return (
      <Card className="text-center py-8">
        <p className="text-ink-soft text-sm mb-6 max-w-sm mx-auto leading-relaxed">{exercise.intro}</p>
        <p className="text-xs font-medium text-ink-soft mb-3">Kies hoe je deze oefening wilt volgen</p>
        <div className="flex flex-col gap-2.5 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => setMode("listen")}
            className="flex items-center gap-3 rounded-[1.25rem] bg-surface border border-line px-4 py-4 text-left touch-manipulation transition-colors hover:border-ink/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
          >
            <span className="shrink-0 h-10 w-10 rounded-full bg-sage-soft flex items-center justify-center">
              <Headphones className="h-4.5 w-4.5 text-sage-dark" strokeWidth={1.75} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink">Luisteren</span>
              <span className="block text-xs text-ink-soft mt-0.5">Ogen dicht, telefoon neerleggen</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode("read")}
            className="flex items-center gap-3 rounded-[1.25rem] bg-surface border border-line px-4 py-4 text-left touch-manipulation transition-colors hover:border-ink/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
          >
            <span className="shrink-0 h-10 w-10 rounded-full bg-sage-soft flex items-center justify-center">
              <BookOpen className="h-4.5 w-4.5 text-ink-soft" strokeWidth={1.75} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink">Lezen</span>
              <span className="block text-xs text-ink-soft mt-0.5">Stap voor stap meelezen</span>
            </span>
          </button>
        </div>
        <p className="text-xs text-ink-soft mt-5">{exercise.durationMinutes} minuten</p>
      </Card>
    )
  }

  if (mode === "listen") {
    return (
      <ListenMode
        exercise={exercise}
        onBack={() => setMode("choice")}
        onFinish={(seconds) => {
          setElapsed(seconds)
          setDone(true)
        }}
      />
    )
  }

  return (
    <Card className="text-center py-10">
      <p className="text-xs font-medium text-sage-dark mb-4">
        Stap {stepIndex + 1} van {totalSteps} · {formatElapsed(elapsed)}
      </p>
      <p className="font-display text-xl text-ink leading-relaxed px-2 mb-8 min-h-20 flex items-center justify-center">
        {exercise.steps[stepIndex]}
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={back}
          disabled={stepIndex === 0}
          aria-label="Vorige stap"
          className="h-12 w-12 rounded-full flex items-center justify-center text-ink-soft bg-cream-soft/80 disabled:opacity-30 touch-manipulation motion-safe:active:scale-[0.94] transition-transform"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} />
        </button>
        <Button onClick={next} className="min-w-40">
          {onLastStep ? "Afronden" : "Volgende"}
          {!onLastStep && <ChevronRight className="h-4 w-4" strokeWidth={2} />}
        </Button>
      </div>
    </Card>
  )
}
