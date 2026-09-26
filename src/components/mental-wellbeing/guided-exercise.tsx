"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { MindfulExercise } from "@/lib/data/mindful-exercises"

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

/**
 * Step-by-step guided reading, at her own pace — no forced per-step
 * countdown (that would fight with how fast anyone actually breathes or
 * reads), just a simple elapsed-time counter so there's a sense of "I've
 * taken a moment" without anything ticking down and adding pressure.
 */
export function GuidedExercise({ exercise }: { exercise: MindfulExercise }) {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(-1) // -1 = intro screen
  const [elapsed, setElapsed] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (stepIndex < 0 || done) return
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [stepIndex, done])

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

  if (done) {
    return (
      <Card className="text-center py-8">
        <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-sage-soft flex items-center justify-center">
          <Check className="h-6 w-6 text-sage-dark" strokeWidth={2.5} />
        </div>
        <p className="font-display text-xl text-ink mb-2">Klaar</p>
        <p className="text-sm text-ink-soft mb-1 max-w-sm mx-auto">{exercise.closing}</p>
        <p className="text-xs text-ink-soft mb-5">Je nam {formatElapsed(elapsed)} minuten voor jezelf.</p>
        <div className="flex gap-2 justify-center">
          <Button
            variant="secondary"
            onClick={() => {
              setStepIndex(-1)
              setElapsed(0)
              setDone(false)
            }}
          >
            Nog een keer
          </Button>
          <Button onClick={() => router.push("/mentale-rust")}>Terug naar overzicht</Button>
        </div>
      </Card>
    )
  }

  if (stepIndex === -1) {
    return (
      <Card className="text-center py-8">
        <p className="text-ink-soft text-sm mb-6 max-w-sm mx-auto leading-relaxed">{exercise.intro}</p>
        <Button onClick={() => setStepIndex(0)} className="min-w-40">
          Start ({exercise.durationMinutes} min)
        </Button>
      </Card>
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
          className="h-12 w-12 rounded-full flex items-center justify-center text-ink-soft border border-line disabled:opacity-30 touch-manipulation motion-safe:active:scale-[0.94] transition-transform"
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
