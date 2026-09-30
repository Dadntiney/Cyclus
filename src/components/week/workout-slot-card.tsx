"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Moon, Repeat, X, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { WorkoutImage } from "@/components/training/workout-image"
import type { DayFocus } from "@/lib/recommendations/weekly-program"
import type { WeekPlanWorkout } from "@/lib/recommendations/week-plan"
import type { DayOverride } from "@/lib/client/week-plan-storage"
import type { CompletedWorkoutInfo } from "@/lib/data/week-plan-context"
import { undoTodaysWorkoutSession } from "@/lib/actions/training"

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
  completed?: CompletedWorkoutInfo | null
  /** Only today's completion can be undone. */
  canUndoCompleted?: boolean
}

export function WorkoutSlotCard({
  focus,
  workout,
  reason,
  alternatives,
  override,
  onOverride,
  completed = null,
  canUndoCompleted = false,
}: WorkoutSlotCardProps) {
  const [open, setOpen] = useState(false)
  const [swapping, setSwapping] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (completed) {
    return (
      <div className="rounded-3xl bg-sage-soft/50 p-3.5">
        <div className="flex items-start gap-3">
          <span className="h-12 w-12 rounded-xl bg-surface/70 flex items-center justify-center shrink-0">
            <Check className="h-5 w-5 text-sage-dark" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-sage-dark mb-0.5">Afgerond</p>
            <p className="text-sm font-medium text-ink">{completed.title}</p>
            <p className="text-xs text-ink-soft mt-0.5">{completed.duration} min</p>
            {canUndoCompleted && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    await undoTodaysWorkoutSession()
                  })
                }}
                className="mt-1.5 text-xs font-medium text-ink-soft hover:text-sage-dark touch-manipulation min-h-11"
              >
                {isPending ? "Bezig…" : "Ongedaan maken"}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const skipped = override?.type === "skip-workout"
  const swapped = override?.type === "swap-workout" ? override : null

  if (focus === "rust" && !swapped) {
    return (
      <div className="rounded-3xl bg-sage-soft/50 p-3.5 flex items-center gap-2.5 text-ink-soft">
        <Moon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <p className="text-sm">Rustdag — geen beweging gepland.</p>
      </div>
    )
  }

  const effectiveWorkout = swapped
    ? { id: swapped.workoutId, title: swapped.title, duration: swapped.duration }
    : workout
  const swappedWorkout = swapped ? (alternatives.find((a) => a.id === swapped.workoutId) ?? null) : null

  return (
    <div className="rounded-3xl bg-sage-soft/50 p-3.5">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-medium text-ink-soft">{FOCUS_LABELS[focus]}</p>
        {(skipped || swapped) && (
          <button
            type="button"
            onClick={() => onOverride(null)}
            className="inline-flex items-center min-h-11 px-2 text-xs font-medium text-sage-dark touch-manipulation"
          >
            Herstel voorstel
          </button>
        )}
      </div>

      {skipped ? (
        <p className="text-sm text-ink-soft italic">Overgeslagen</p>
      ) : effectiveWorkout ? (
        <div className="flex items-center gap-3">
          <WorkoutImage
            type={swapped ? (swappedWorkout?.type ?? "mobiliteit") : (workout?.type ?? "mobiliteit")}
            title={effectiveWorkout.title}
            imageUrl={swapped ? (swappedWorkout?.image_url ?? null) : (workout?.image_url ?? null)}
            className="h-12 w-12 rounded-xl shrink-0"
            sizes="48px"
          />
          <div className="min-w-0">
            {swapped ? (
              <Link href={`/training/${swapped.workoutId}`} className="block group touch-manipulation">
                <p className="text-sm font-medium text-ink group-hover:text-sage-dark transition-colors">
                  {effectiveWorkout.title}
                </p>
              </Link>
            ) : workout ? (
              <Link href={`/training/${workout.id}`} className="block group touch-manipulation">
                <p className="text-sm font-medium text-ink group-hover:text-sage-dark transition-colors">
                  {workout.title}
                </p>
              </Link>
            ) : (
              <p className="text-sm font-medium text-ink">{effectiveWorkout.title}</p>
            )}
            <p className="text-xs text-ink-soft mt-0.5">
              {effectiveWorkout.duration} min
              {!swapped && ` · ${reason}`}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-ink-soft">
          Geen training voor deze focus.{" "}
          <Link href="/training" className="font-medium text-sage-dark underline-offset-2 hover:underline">
            Open beweging
          </Link>
          .
        </p>
      )}

      {!skipped && (
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v)
            setSwapping(false)
          }}
          className="mt-1.5 inline-flex items-center gap-1 min-h-11 text-xs font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
          aria-expanded={open}
        >
          Aanpassen
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
            strokeWidth={2}
          />
        </button>
      )}

      {open && !skipped && !swapping && (
        <div className="mt-1 flex flex-wrap gap-1">
          {alternatives.length > 0 && (
            <button
              type="button"
              onClick={() => setSwapping(true)}
              className="inline-flex items-center gap-1 min-h-11 px-2 text-xs font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
            >
              <Repeat className="h-3.5 w-3.5" strokeWidth={1.75} />
              Vervangen
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onOverride({ type: "skip-workout" })
              setOpen(false)
            }}
            className="inline-flex items-center gap-1 min-h-11 px-2 text-xs font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            Overslaan
          </button>
        </div>
      )}

      {open && swapping && (
        <div className="mt-2 flex flex-col gap-1.5">
          <p className="text-[11px] text-ink-soft mb-0.5">Vervang door:</p>
          {alternatives.map((alt) => (
            <button
              key={alt.id}
              type="button"
              onClick={() => {
                onOverride({
                  type: "swap-workout",
                  workoutId: alt.id,
                  title: alt.title,
                  duration: alt.duration,
                })
                setOpen(false)
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
            className="text-[11px] font-medium text-ink-soft self-start mt-0.5 touch-manipulation min-h-11"
          >
            Terug
          </button>
        </div>
      )}
    </div>
  )
}
