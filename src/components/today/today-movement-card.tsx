"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Dumbbell, Repeat, X, Check } from "lucide-react"
import { WorkoutImage } from "@/components/training/workout-image"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  loadWeekOverrides,
  setDayOverride,
  type DayOverride,
} from "@/lib/client/week-plan-storage"

export type TodayWorkoutOption = {
  id: string
  title: string
  type: string
  duration: number
  image_url: string | null
}

export function TodayMovementCard({
  userId,
  date,
  weekStartISO,
  suggested,
  reason,
  alternatives,
  completed,
}: {
  userId: string
  date: string
  weekStartISO: string
  suggested: TodayWorkoutOption | null
  reason: string
  alternatives: TodayWorkoutOption[]
  completed: { workoutId: string; title: string; duration: number } | null
}) {
  const [override, setOverride] = useState<DayOverride | null>(null)
  const [swapping, setSwapping] = useState(false)

  useEffect(() => {
    const overrides = loadWeekOverrides(userId, weekStartISO)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOverride(overrides[`${date}:workout`] ?? null)
  }, [userId, weekStartISO, date])

  function applyOverride(next: DayOverride | null) {
    setDayOverride(userId, weekStartISO, date, "workout", next)
    setOverride(next)
    setSwapping(false)
  }

  if (completed) {
    return (
      <div className="rounded-2xl border border-line/70 p-3.5">
        <p className="text-xs font-medium text-sage-dark mb-2 inline-flex items-center gap-1">
          <Dumbbell className="h-3.5 w-3.5" strokeWidth={1.75} />
          Beweging
        </p>
        <div className="flex items-start gap-3">
          <span className="h-10 w-10 rounded-full bg-sage-soft flex items-center justify-center shrink-0">
            <Check className="h-5 w-5 text-sage-dark" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">Afgerond: {completed.title}</p>
            <p className="text-xs text-ink-soft mt-0.5">{completed.duration} minuten</p>
            {suggested && completed.workoutId !== suggested.id && (
              <p className="text-xs text-ink-soft mt-1">
                Advies was {suggested.title} — fijn dat je koos wat bij je paste.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const skipped = override?.type === "skip-workout"
  const swapped = override?.type === "swap-workout" ? override : null
  const effective = swapped
    ? {
        id: swapped.workoutId,
        title: swapped.title,
        duration: swapped.duration,
        type: alternatives.find((a) => a.id === swapped.workoutId)?.type ?? suggested?.type ?? "mobiliteit",
        image_url: alternatives.find((a) => a.id === swapped.workoutId)?.image_url ?? null,
      }
    : suggested

  return (
    <div className="rounded-2xl border border-line/70 p-3.5">
      <p className="text-xs font-medium text-sage-dark mb-2 inline-flex items-center gap-1">
        <Dumbbell className="h-3.5 w-3.5" strokeWidth={1.75} />
        Beweging
      </p>

      {skipped ? (
        <div>
          <p className="text-sm text-ink-soft italic">Vandaag overgeslagen</p>
          <button
            type="button"
            onClick={() => applyOverride(null)}
            className="mt-2 text-xs font-medium text-sage-dark min-h-11 touch-manipulation"
          >
            Herstel voorstel
          </button>
        </div>
      ) : effective ? (
        <>
          <div className="flex items-start gap-3">
            <WorkoutImage
              type={effective.type}
              title={effective.title}
              imageUrl={effective.image_url}
              className="h-16 w-16 rounded-xl shrink-0"
              sizes="64px"
              priority
            />
            <div className="min-w-0">
              <p className="font-display text-lg text-ink leading-snug">{effective.title}</p>
              <p className="text-sm text-ink-soft mt-0.5">{effective.duration} minuten</p>
              {swapped && suggested && (
                <p className="text-xs text-ink-soft mt-1">
                  Jouw keuze · advies was {suggested.title}
                </p>
              )}
            </div>
          </div>
          {!swapped && <p className="text-sm text-ink-soft mt-2">{reason}</p>}
          <Link href={`/training/${effective.id}`} className={cn(buttonVariants(), "mt-3")}>
            Start training
          </Link>
          <div className="flex flex-wrap gap-1 mt-1">
            {alternatives.length > 0 && (
              <button
                type="button"
                onClick={() => setSwapping((s) => !s)}
                className="inline-flex items-center gap-1 min-h-11 px-2 text-xs font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
              >
                <Repeat className="h-3.5 w-3.5" strokeWidth={1.75} />
                Andere oefening
              </button>
            )}
            <button
              type="button"
              onClick={() => applyOverride({ type: "skip-workout" })}
              className="inline-flex items-center gap-1 min-h-11 px-2 text-xs font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              Overslaan
            </button>
            {swapped && (
              <button
                type="button"
                onClick={() => applyOverride(null)}
                className="inline-flex items-center min-h-11 px-2 text-xs font-medium text-sage-dark touch-manipulation"
              >
                Herstel advies
              </button>
            )}
          </div>
          {swapping && (
            <div className="mt-3 flex flex-col gap-1.5">
              <p className="text-[11px] text-ink-soft mb-0.5">Wat ga je doen?</p>
              {alternatives.map((alt) => (
                <button
                  key={alt.id}
                  type="button"
                  onClick={() =>
                    applyOverride({
                      type: "swap-workout",
                      workoutId: alt.id,
                      title: alt.title,
                      duration: alt.duration,
                    })
                  }
                  className="text-left text-sm text-ink rounded-xl px-3 py-2.5 min-h-11 bg-cream-soft hover:bg-sage-soft transition-colors touch-manipulation flex items-center justify-between gap-2"
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
                Annuleren
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-ink-soft mt-1">{reason || "Geen training voorgesteld vandaag."}</p>
      )}
    </div>
  )
}
