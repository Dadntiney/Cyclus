"use client"

import { useState } from "react"
import Link from "next/link"
import { Moon, Repeat, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DayFocus } from "@/lib/recommendations/weekly-program"
import type { WeekPlanWorkout } from "@/lib/recommendations/week-plan"
import type { DayOverride } from "@/lib/client/week-plan-storage"

const FOCUS_LABELS: Record<DayFocus, string> = {
  kracht: "Kracht",
  cardio: "Cardio",
  mobiliteit: "Mobiliteit",
  herstel: "Herstel",
  rust: "Rustdag",
}

interface WorkoutSlotCardProps {
  focus: DayFocus
  workout: WeekPlanWorkout | null
  reason: string
  alternatives: WeekPlanWorkout[]
  override: DayOverride | null
  onOverride: (override: DayOverride | null) => void
}

export function WorkoutSlotCard({ focus, workout, reason, alternatives, override, onOverride }: WorkoutSlotCardProps) {
  const [swapping, setSwapping] = useState(false)

  const skipped = override?.type === "skip-workout"
  const swapped = override?.type === "swap-workout" ? override : null

  if (focus === "rust" && !swapped) {
    return (
      <div className="rounded-2xl bg-cream-soft p-3.5 flex items-center gap-2.5 text-ink-soft">
        <Moon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <p className="text-sm">Rustdag — geen beweging gepland.</p>
      </div>
    )
  }

  const effectiveWorkout = swapped ? { id: swapped.workoutId, title: swapped.title, duration: swapped.duration } : workout

  return (
    <div className="rounded-2xl border border-line/70 p-3.5">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-medium text-ink-soft">{FOCUS_LABELS[focus]}</p>
        {(skipped || swapped) && (
          <button
            type="button"
            onClick={() => onOverride(null)}
            className="text-[11px] font-medium text-sage-dark touch-manipulation"
          >
            Herstel voorstel
          </button>
        )}
      </div>

      {skipped ? (
        <p className="text-sm text-ink-soft italic">Overgeslagen</p>
      ) : effectiveWorkout ? (
        <>
          {swapped || !workout ? (
            <p className="text-sm font-medium text-ink">{effectiveWorkout.title}</p>
          ) : (
            <Link href={`/training/${workout.id}`} className="block group touch-manipulation">
              <p className="text-sm font-medium text-ink group-hover:text-sage-dark transition-colors">
                {workout.title}
              </p>
            </Link>
          )}
          <p className="text-xs text-ink-soft mt-0.5">
            {effectiveWorkout.duration} min
            {!swapped && ` · ${reason}`}
          </p>
        </>
      ) : (
        <p className="text-sm text-ink-soft">Geen training gevonden voor deze focus.</p>
      )}

      {!skipped && (
        <div className="flex gap-3 mt-2.5">
          {alternatives.length > 0 && (
            <button
              type="button"
              onClick={() => setSwapping((s) => !s)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
            >
              <Repeat className="h-3 w-3" strokeWidth={1.75} />
              Vervangen
            </button>
          )}
          <button
            type="button"
            onClick={() => onOverride({ type: "skip-workout" })}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
          >
            <X className="h-3 w-3" strokeWidth={1.75} />
            Overslaan
          </button>
        </div>
      )}

      {swapping && (
        <div className="mt-3 flex flex-col gap-1.5">
          <p className="text-[11px] text-ink-soft mb-0.5">Vervang door:</p>
          {alternatives.map((alt) => (
            <button
              key={alt.id}
              type="button"
              onClick={() => {
                onOverride({ type: "swap-workout", workoutId: alt.id, title: alt.title, duration: alt.duration })
                setSwapping(false)
              }}
              className={cn(
                "text-left text-sm text-ink rounded-xl px-3 py-2 bg-cream-soft hover:bg-sage-soft transition-colors touch-manipulation flex items-center justify-between gap-2",
              )}
            >
              <span>{alt.title}</span>
              <span className="text-xs text-ink-soft shrink-0">{alt.duration} min</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSwapping(false)}
            className="text-[11px] font-medium text-ink-soft self-start mt-0.5 touch-manipulation"
          >
            Annuleren
          </button>
        </div>
      )}
    </div>
  )
}
