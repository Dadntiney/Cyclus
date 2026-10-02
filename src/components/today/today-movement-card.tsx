"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Repeat, X, Check, ChevronDown, Moon } from "lucide-react"
import { WorkoutImage } from "@/components/training/workout-image"
import { Chip } from "@/components/ui/chip"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { workoutTypeLabel } from "@/lib/constants"
import { undoTodaysWorkoutSession } from "@/lib/actions/training"
import {
  loadWeekOverrides,
  setDayOverride,
  WEEK_OVERRIDES_CHANGED_EVENT,
  type DayOverride,
} from "@/lib/client/week-plan-storage"

export type TodayWorkoutOption = {
  id: string
  title: string
  type: string
  duration: number
  image_url: string | null
}

const GENERIC_REASON = "Gebaseerd op je bewegingsvoorkeuren uit je profiel."

export function TodayMovementCard({
  userId,
  date,
  weekStartISO,
  suggested,
  reason,
  alternatives,
  completed,
  emphasis = "default",
  embedded = false,
  canUndoCompleted = true,
  restDay = false,
}: {
  userId: string
  date: string
  weekStartISO: string
  suggested: TodayWorkoutOption | null
  reason: string
  alternatives: TodayWorkoutOption[]
  completed: { workoutId: string; title: string; duration: number } | null
  emphasis?: "default" | "primary"
  /** Inside TodayCards / Week soft panel — no outer shell. */
  embedded?: boolean
  /** Only today’s completion can be undone via the session action. */
  canUndoCompleted?: boolean
  /** Planned rest day (week program) — soft Moon row unless swapped. */
  restDay?: boolean
}) {
  const router = useRouter()
  const shell = embedded
    ? "px-4 pt-4 pb-3"
    : emphasis === "primary"
      ? "rounded-3xl bg-sage-soft/70 p-4"
      : "rounded-3xl bg-sage-soft/50 p-3.5"

  const [override, setOverride] = useState<DayOverride | null>(null)
  const [swapping, setSwapping] = useState(false)
  const [showAdjust, setShowAdjust] = useState(false)
  const [swapType, setSwapType] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    function refresh() {
      setOverride(loadWeekOverrides(userId, weekStartISO)[`${date}:workout`] ?? null)
    }
    refresh()
    window.addEventListener(WEEK_OVERRIDES_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(WEEK_OVERRIDES_CHANGED_EVENT, refresh)
  }, [userId, weekStartISO, date])

  function applyOverride(next: DayOverride | null) {
    setDayOverride(userId, weekStartISO, date, "workout", next)
    setOverride(next)
    setSwapping(false)
    setShowAdjust(false)
    setSwapType(null)
  }

  const typeOptions = useMemo(() => {
    const types = [...new Set(alternatives.map((a) => a.type))]
    // Prefer types other than today's suggestion first, then the rest.
    const suggestedType = suggested?.type
    return types.sort((a, b) => {
      if (a === suggestedType) return 1
      if (b === suggestedType) return -1
      return workoutTypeLabel(a).localeCompare(workoutTypeLabel(b), "nl")
    })
  }, [alternatives, suggested?.type])

  const filteredAlternatives = useMemo(() => {
    if (!swapType) return alternatives
    return alternatives.filter((a) => a.type === swapType)
  }, [alternatives, swapType])

  if (completed) {
    return (
      <div className={shell}>
        <div className="flex items-start gap-3">
          <span className="h-10 w-10 rounded-full bg-surface/70 flex items-center justify-center shrink-0">
            <Check className="h-5 w-5 text-sage-dark" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-sage-dark mb-0.5">Beweging</p>
            <p className="text-sm font-medium text-ink">Voor jezelf gedaan: {completed.title}</p>
            <p className="text-xs text-ink-soft mt-0.5">{completed.duration} minuten</p>
            {canUndoCompleted && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    await undoTodaysWorkoutSession()
                    router.refresh()
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
  const effective = swapped
    ? {
        id: swapped.workoutId,
        title: swapped.title,
        duration: swapped.duration,
        type: alternatives.find((a) => a.id === swapped.workoutId)?.type ?? suggested?.type ?? "mobiliteit",
        image_url: alternatives.find((a) => a.id === swapped.workoutId)?.image_url ?? null,
      }
    : suggested

  if (restDay && !swapped && !skipped) {
    return (
      <div className={shell}>
        <div className="flex items-center gap-3">
          <span className="h-14 w-14 rounded-xl bg-surface/70 flex items-center justify-center shrink-0">
            <Moon className="h-5 w-5 text-ink-soft" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-sage-dark mb-0.5">Beweging</p>
            <p className="font-display text-lg text-ink leading-snug">Rustdag</p>
            <p className="text-sm text-ink-soft mt-0.5">Geen beweging gepland</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={shell}>
      {skipped ? (
        <div>
          <p className="text-xs font-medium text-sage-dark mb-1">Beweging</p>
          <p className="text-sm text-ink-soft italic">Vandaag geen beweging — ook goed</p>
          <button
            type="button"
            onClick={() => applyOverride(null)}
            className="mt-2 text-sm font-medium text-sage-dark min-h-11 touch-manipulation"
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
              className="h-14 w-14 rounded-xl shrink-0"
              sizes="56px"
              priority
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-sage-dark mb-0.5">Beweging</p>
              <p className="font-display text-lg text-ink leading-snug">{effective.title}</p>
              <p className="text-sm text-ink-soft mt-0.5">
                {workoutTypeLabel(effective.type)} · {effective.duration} minuten
              </p>
              {swapped && suggested && (
                <p className="text-xs text-ink-soft mt-1">Jouw keuze · advies was {suggested.title}</p>
              )}
            </div>
          </div>
          {!swapped && reason && reason !== GENERIC_REASON && (
            <p className="text-sm text-ink-soft mt-2">{reason}</p>
          )}
          <Link href={`/training/${effective.id}`} className={cn(buttonVariants(), "mt-3")}>
            Start training
          </Link>

          <div className="mt-1">
            <button
              type="button"
              onClick={() => {
                setShowAdjust((s) => !s)
                if (showAdjust) {
                  setSwapping(false)
                  setSwapType(null)
                }
              }}
              className="inline-flex items-center gap-1 min-h-11 text-xs font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
              aria-expanded={showAdjust}
            >
              Aanpassen
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", showAdjust && "rotate-180")}
                strokeWidth={2}
              />
            </button>

            {showAdjust && (
              <div className="flex flex-wrap gap-1 -mt-1">
                {alternatives.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSwapping((s) => !s)
                      if (!swapping) {
                        // Default to a different activity type when available.
                        const other = typeOptions.find((t) => t !== effective.type) ?? typeOptions[0] ?? null
                        setSwapType(other)
                      } else {
                        setSwapType(null)
                      }
                    }}
                    className="inline-flex items-center gap-1 min-h-11 px-2 text-xs font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
                  >
                    <Repeat className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Andere beweging
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => applyOverride({ type: "skip-workout" })}
                  className="inline-flex items-center gap-1 min-h-11 px-2 text-xs font-medium text-ink-soft hover:text-sage-dark touch-manipulation"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Vandaag niet
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
            )}
          </div>

          {swapping && (
            <div className="mt-2 flex flex-col gap-2">
              <p className="text-xs text-ink-soft">Kies een soort beweging:</p>
              <div className="flex w-full gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {typeOptions.map((type) => (
                  <Chip
                    key={type}
                    className="shrink-0"
                    selected={swapType === type}
                    onClick={() => setSwapType(type)}
                  >
                    {workoutTypeLabel(type)}
                  </Chip>
                ))}
              </div>
              <p className="text-xs text-ink-soft mb-0.5">
                {swapType ? `${workoutTypeLabel(swapType)} — wat ga je doen?` : "Wat ga je doen?"}
              </p>
              {filteredAlternatives.length ? (
                filteredAlternatives.map((alt) => (
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
                    className="text-left text-sm text-ink rounded-xl px-3 py-2.5 min-h-11 bg-surface/70 hover:bg-surface transition-colors touch-manipulation flex items-center justify-between gap-2"
                  >
                    <span className="truncate">{alt.title}</span>
                    <span className="text-xs text-ink-soft shrink-0">{alt.duration} min</span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-ink-soft">Geen opties in deze categorie.</p>
              )}
              <button
                type="button"
                onClick={() => {
                  setSwapping(false)
                  setSwapType(null)
                }}
                className="text-xs font-medium text-ink-soft self-start touch-manipulation min-h-11"
              >
                Annuleren
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-ink-soft">{reason || "Geen training voorgesteld vandaag."}</p>
      )}
    </div>
  )
}
