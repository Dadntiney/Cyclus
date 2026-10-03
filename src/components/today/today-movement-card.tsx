"use client"

import { ACCOUNT_STATE_APPLIED_EVENT } from "@/lib/client/account-sync"
import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, ChevronLeft, Moon, Repeat, RotateCcw, SlidersHorizontal, X } from "lucide-react"
import { WorkoutImage } from "@/components/training/workout-image"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { buttonVariants, textActionClass } from "@/components/ui/button"
import { ChipRadioGroup } from "@/components/ui/chip-radio-group"
import { IconButton } from "@/components/ui/icon-button"
import { ListGroup, ListRow } from "@/components/ui/list-group"
import { cn } from "@/lib/utils"
import { workoutTypeLabel } from "@/lib/constants"
import { undoTodaysWorkoutSession } from "@/lib/actions/training"
import {
  loadWeekOverrides,
  setDayOverride,
  WEEK_OVERRIDES_CHANGED_EVENT,
  type DayOverride,
} from "@/lib/client/week-plan-storage"
import { runAction } from "@/lib/client/run-action"
import { ICON } from "@/lib/ui/icon"

export type TodayWorkoutOption = {
  id: string
  title: string
  type: string
  duration: number
  image_url: string | null
}

const GENERIC_REASON = "Gebaseerd op je bewegingsvoorkeuren uit je profiel."

/** "Wandelen – 20 min" → "Wandelen": the duration already has its own line. */
function titleWithoutDuration(title: string) {
  const stripped = title.replace(/\s*[-–—]?\s*\d+\s*(min|minuten)\.?$/i, "").trim()
  return stripped || title
}

type SheetMode = "menu" | "swap"

/**
 * Today's (or a week day's) movement, the first row of the plan card:
 * image · "Beweging" · title · type and duration · "Start training".
 * "Aanpassen" is the sliders IconButton: a sheet with Andere beweging ·
 * Vandaag niet · Herstel advies, like the meals.
 */
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
  hideReason = false,
}: {
  userId: string
  date: string
  weekStartISO: string
  suggested: TodayWorkoutOption | null
  reason: string
  alternatives: TodayWorkoutOption[]
  completed: { workoutId: string; title: string; duration: number } | null
  emphasis?: "default" | "primary"
  /** Inside the plan card (Vandaag / Deze week) — no outer shell. */
  embedded?: boolean
  /** Only today’s completion can be undone via the session action. */
  canUndoCompleted?: boolean
  /** Planned rest day (week program) — soft Moon row unless swapped. */
  restDay?: boolean
  /** The day voice above already says why (it came from the check-in). */
  hideReason?: boolean
}) {
  const router = useRouter()
  const shell = embedded
    ? "p-4"
    : cn("rounded-card border border-line bg-surface", emphasis === "primary" ? "p-5" : "p-4")

  const [override, setOverride] = useState<DayOverride | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [mode, setMode] = useState<SheetMode>("menu")
  const [swapType, setSwapType] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const typeLabelId = useId()
  const menuRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const modeChangedRef = useRef(false)
  const shellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function refresh() {
      setOverride(loadWeekOverrides(userId, weekStartISO)[`${date}:workout`] ?? null)
    }
    refresh()
    window.addEventListener(WEEK_OVERRIDES_CHANGED_EVENT, refresh)
    window.addEventListener(ACCOUNT_STATE_APPLIED_EVENT, refresh)
    return () => {
      window.removeEventListener(WEEK_OVERRIDES_CHANGED_EVENT, refresh)
      window.removeEventListener(ACCOUNT_STATE_APPLIED_EVENT, refresh)
    }
  }, [userId, weekStartISO, date])

  // The tapped option disappears when the sheet switches view: keep focus
  // inside the sheet.
  useEffect(() => {
    if (!modeChangedRef.current) return
    modeChangedRef.current = false
    if (mode === "swap") backRef.current?.focus()
    else menuRef.current?.focus()
  }, [mode])

  // After a choice the button that opened the sheet may be gone (e.g. the
  // row now says "Vandaag geen beweging"): focus the row's own control.
  const sheetWasOpenRef = useRef(false)
  useEffect(() => {
    if (sheetOpen) {
      sheetWasOpenRef.current = true
      return
    }
    if (!sheetWasOpenRef.current) return
    sheetWasOpenRef.current = false
    if (document.activeElement && document.activeElement !== document.body) return
    shellRef.current?.querySelector<HTMLElement>("button, a[href]")?.focus({ preventScroll: true })
  }, [sheetOpen])

  function applyOverride(next: DayOverride | null) {
    setDayOverride(userId, weekStartISO, date, "workout", next)
    setOverride(next)
    setSheetOpen(false)
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
          <span
            aria-hidden
            className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-inset bg-sage-soft text-sage-dark"
          >
            <Check {...ICON.md} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="type-eyebrow text-sage-dark">Beweging</p>
            <h3 className="type-card-title text-ink">Voor jezelf gedaan</h3>
            <p className="text-sm text-ink-soft">
              {titleWithoutDuration(completed.title)} · {completed.duration} minuten
            </p>
            {canUndoCompleted && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  startTransition(async () => {
                    await runAction(() => undoTodaysWorkoutSession())
                    router.refresh()
                  })
                }}
                className={textActionClass("-ml-1 px-1 text-ink-soft")}
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
          <span
            aria-hidden
            className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-inset bg-sage-soft text-ink-soft"
          >
            <Moon {...ICON.md} />
          </span>
          <div className="min-w-0">
            <p className="type-eyebrow text-sage-dark">Beweging</p>
            <h3 className="type-card-title text-ink">Rustdag</h3>
            <p className="text-sm text-ink-soft">Geen beweging gepland</p>
          </div>
        </div>
      </div>
    )
  }

  function openSheet() {
    setMode("menu")
    setSwapType(null)
    setSheetOpen(true)
  }

  function openSwap() {
    // Default to a different activity type when available.
    const current = effective?.type
    const other = typeOptions.find((t) => t !== current) ?? typeOptions[0] ?? null
    setSwapType(other)
    modeChangedRef.current = true
    setMode("swap")
  }

  function backToMenu() {
    modeChangedRef.current = true
    setMode("menu")
  }

  return (
    <div ref={shellRef} className={shell}>
      {skipped ? (
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="type-eyebrow text-sage-dark">Beweging</p>
            <p className="text-sm text-ink-soft">Vandaag geen beweging, ook goed</p>
          </div>
          <button type="button" onClick={() => applyOverride(null)} className={textActionClass("shrink-0 px-1")}>
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
              className="h-14 w-14 shrink-0 rounded-inset"
              sizes="56px"
              priority
            />
            <div className="min-w-0 flex-1">
              <p className="type-eyebrow text-sage-dark">Beweging</p>
              <h3 className="type-card-title text-ink">{titleWithoutDuration(effective.title)}</h3>
              <p className="text-sm text-ink-soft">
                {workoutTypeLabel(effective.type)} · {effective.duration} minuten
              </p>
              {swapped && suggested && (
                <p className="text-xs text-ink-soft">
                  Jouw keuze · advies was {titleWithoutDuration(suggested.title)}
                </p>
              )}
            </div>
            <IconButton
              label="Beweging aanpassen"
              icon={SlidersHorizontal}
              aria-haspopup="dialog"
              onClick={openSheet}
              className="-mr-2 -mt-2"
            />
          </div>
          {!swapped && !hideReason && reason && reason !== GENERIC_REASON && (
            <p className="mt-3 text-sm text-ink-soft">{reason}</p>
          )}
          <Link href={`/training/${effective.id}`} className={buttonVariants({ className: "mt-4" })}>
            Start training
          </Link>
        </>
      ) : (
        <p className="text-sm text-ink-soft">{reason || "Geen training voorgesteld vandaag."}</p>
      )}

      {/* Outside the branches above, so it can slide out after "Vandaag niet". */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Beweging aanpassen">
        {mode === "menu" ? (
          <div ref={menuRef} tabIndex={-1} data-focus-target="" className="pb-2">
            <ListGroup>
              {alternatives.length > 0 && (
                <ListRow icon={Repeat} title="Andere beweging" onClick={openSwap} />
              )}
              <ListRow
                icon={X}
                title="Vandaag niet"
                trailing="none"
                onClick={() => applyOverride({ type: "skip-workout" })}
              />
              {swapped && (
                <ListRow
                  icon={RotateCcw}
                  title="Herstel advies"
                  description={suggested ? titleWithoutDuration(suggested.title) : undefined}
                  trailing="none"
                  onClick={() => applyOverride(null)}
                />
              )}
            </ListGroup>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-2">
            <button
              ref={backRef}
              type="button"
              onClick={backToMenu}
              className={textActionClass("-ml-1 self-start px-1")}
            >
              <ChevronLeft {...ICON.sm} aria-hidden />
              Terug
            </button>
            <div className="flex flex-col gap-2">
              <p id={typeLabelId} className="text-sm font-medium text-ink">
                Soort beweging
              </p>
              <ChipRadioGroup
                aria-labelledby={typeLabelId}
                value={swapType}
                onChange={setSwapType}
                options={typeOptions.map((type) => ({ value: type, label: workoutTypeLabel(type) }))}
              />
            </div>
            {filteredAlternatives.length ? (
              <ListGroup label="Wat ga je doen?" labelAs="h3">
                {filteredAlternatives.map((alt) => (
                  <ListRow
                    key={alt.id}
                    title={titleWithoutDuration(alt.title)}
                    value={`${alt.duration} min`}
                    trailing="none"
                    onClick={() =>
                      applyOverride({
                        type: "swap-workout",
                        workoutId: alt.id,
                        title: alt.title,
                        duration: alt.duration,
                      })
                    }
                  />
                ))}
              </ListGroup>
            ) : (
              <p className="text-sm text-ink-soft">Geen opties in deze categorie.</p>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
