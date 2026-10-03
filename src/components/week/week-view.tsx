"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { CalendarDays, ChevronRight, Lightbulb, ShoppingCart } from "lucide-react"
import { getPhaseContent } from "@/lib/cycle/phase-content"
import { phaseTagline } from "@/lib/cycle/day-lens"
import {
  formatPresentedCycleHeadline,
  softMenstruationNote,
  PREDICTED_MENSTRUATION_NOTE,
} from "@/lib/cycle/presented-estimate"
import type { WeekDayPlan, WeekPlanRecipe, WeekPlanWorkout, MealSlot } from "@/lib/recommendations/week-plan"
import { TodayMovementCard } from "@/components/today/today-movement-card"
import {
  TodayMealsRows,
  type TodayMealAlternative,
} from "@/components/today/today-meals-rows"
import { DayStrip } from "@/components/week/day-strip"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { formatWeekdayDate } from "@/lib/dates/format"
import type { MealSlotKey } from "@/lib/client/week-plan-storage"
import type { CompletedWorkoutInfo } from "@/lib/data/week-plan-context"
import { FEATURES } from "@/lib/navigation/features"
import { ICON, iconProps } from "@/lib/ui/icon"

interface WeekViewProps {
  userId: string
  weekStartISO: string
  activePeriodStart?: string | null
  days: WeekDayPlan[]
  recipePoolBySlot: Record<MealSlot, WeekPlanRecipe[]>
  workoutPool: WeekPlanWorkout[]
  groceryItemCount: number
  movementEnabled: boolean
  nutritionEnabled: boolean
  completedWorkoutsByDate?: Record<string, CompletedWorkoutInfo>
  /** 40+ / irregular / overgang signals — phase is only a rough guess. */
  changingCycle?: boolean
  /** Today's check-in says tired / in need of rest. */
  todayLow?: boolean
  /** `?dag=yyyy-MM-dd` — open on that day when it is in this week. */
  initialDate?: string | null
}

/** `?dag=` → that day; otherwise tomorrow (today when it is the week's last day). */
function initialIndex(days: WeekDayPlan[], initialDate: string | null) {
  const requested = initialDate ? days.findIndex((d) => d.date === initialDate) : -1
  if (requested >= 0) return requested
  const today = days.findIndex((d) => d.isToday)
  if (today < 0) return 0
  return today + 1 < days.length ? today + 1 : today
}

export function WeekView({
  userId,
  weekStartISO,
  activePeriodStart = null,
  days,
  recipePoolBySlot,
  workoutPool,
  groceryItemCount,
  movementEnabled,
  nutritionEnabled,
  completedWorkoutsByDate = {},
  changingCycle = false,
  todayLow = false,
  initialDate = null,
}: WeekViewProps) {
  const [selectedIndex, setSelectedIndex] = useState(() => initialIndex(days, initialDate))

  const day = days[selectedIndex]
  const phaseContent = day?.cycleEstimate ? getPhaseContent(day.cycleEstimate.phase) : null

  const alternativesBySlot = useMemo(() => {
    const next: Partial<Record<MealSlotKey, TodayMealAlternative[]>> = {}
    for (const slot of ["ontbijt", "lunch", "diner"] as const) {
      next[slot] = (recipePoolBySlot[slot] ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        image_url: r.image_url,
        preparation_time: r.preparation_time,
      }))
    }
    return next
  }, [recipePoolBySlot])

  const recipeImageById = useMemo(() => {
    const map: Record<string, string | null> = {}
    for (const slot of Object.keys(recipePoolBySlot) as MealSlot[]) {
      for (const r of recipePoolBySlot[slot] ?? []) {
        map[r.id] = r.image_url
      }
    }
    if (day) {
      for (const meal of day.meals) {
        if (meal.recipe) map[meal.recipe.id] = meal.recipe.image_url
      }
    }
    return map
  }, [recipePoolBySlot, day])

  const workoutAlternatives = useMemo(() => {
    if (!day) return []
    const currentId = day.workout.workout?.id
    const pool = workoutPool.filter((w) => w.id !== currentId)
    const byType = new Map<string, typeof pool>()
    for (const w of pool) {
      const list = byType.get(w.type) ?? []
      if (list.length < 3) {
        list.push(w)
        byType.set(w.type, list)
      }
    }
    return Array.from(byType.values()).flat().map((w) => ({
      id: w.id,
      title: w.title,
      type: w.type,
      duration: w.duration,
      image_url: w.image_url,
    }))
  }, [workoutPool, day])

  const stripDays = useMemo(
    () =>
      days.map((d) => ({
        date: d.date,
        weekdayShort: d.weekdayShort,
        isToday: d.isToday,
        isPast: d.isPast,
        phase: d.cycleEstimate?.phase ?? null,
        highlight: Boolean(d.anticipationNote) || d.predictedMenstruation,
        note: d.predictedMenstruation
          ? "menstruatie kan komen"
          : d.anticipationNote
            ? "bij jou vaak zwaarder"
            : undefined,
      })),
    [days],
  )

  if (!movementEnabled && !nutritionEnabled) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Je weekplan is leeg"
        description="Voeding en beweging staan uit. Zet ze aan als je je week wilt plannen."
        action={
          <Link href={FEATURES.gebruik.href} className={buttonVariants({ variant: "tonal" })}>
            {FEATURES.gebruik.label}
          </Link>
        }
      />
    )
  }

  if (!day) return null

  const completed = completedWorkoutsByDate[day.date] ?? null
  const showMeals = nutritionEnabled && day.meals.length > 0
  const softHint = day.menstruationSoftHint ?? (day.predictedMenstruation ? "predicted" : null)

  // "Zaterdag 3 okt · Ovulatie (schatting)": the phase as a badge, never a
  // cycle-day claim for a period that has not started.
  let phaseBadge: string | null = null
  if (day.cycleEstimate) {
    if (softHint) {
      phaseBadge = formatPresentedCycleHeadline(day.cycleEstimate, day.date, activePeriodStart, day.predictedMenstruation, day.menstruationSoftHint)
    } else if (day.cycleEstimate.phase === "menstruatie" && activePeriodStart && day.date >= activePeriodStart) {
      phaseBadge = formatPresentedCycleHeadline(day.cycleEstimate, day.date, activePeriodStart)
    } else {
      phaseBadge = `${day.cycleEstimate.phaseLabel} (${changingCycle ? "ruwe schatting" : "schatting"})`
    }
  }

  // One line under the day: her own anticipation, a soft period note, or —
  // not for today, the page already says what today asks — the phase.
  const anticipated = Boolean(day.anticipationNote) && !day.predictedMenstruation
  const description = anticipated
    ? "Bij jou vaak een zwaardere dag, het plan staat iets zachter."
    : day.anticipationNote
      ? day.anticipationNote
      : softHint
        ? (softMenstruationNote(softHint) ?? PREDICTED_MENSTRUATION_NOTE)
        : day.isToday || !day.cycleEstimate || !phaseContent
          ? null
          : changingCycle
            ? phaseTagline(day.cycleEstimate.phase, { changingCycle: true })
            : phaseContent.shortDescription

  // A phase "use your energy" tip never contradicts a tired check-in.
  const focusTip =
    day.focusTips[0] && !(day.isToday && todayLow) && day.focusTips[0] !== description ? day.focusTips[0] : null

  return (
    <div className="flex flex-col gap-6">
      <DayStrip days={stripDays} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />

      <section aria-labelledby="week-dag-heading">
        <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <h2 id="week-dag-heading" className="type-card-title text-ink">
            {formatWeekdayDate(day.date, { capitalize: true })}
          </h2>
          {phaseBadge && day.cycleEstimate && (
            <Badge tone="phase" phase={day.cycleEstimate.phase}>
              <span className="sr-only">, </span>
              {phaseBadge}
            </Badge>
          )}
        </div>
        {description && <p className="text-sm text-ink-soft">{description}</p>}

        <Card padding="none" className="mt-3 divide-y divide-line overflow-hidden">
          {movementEnabled && (
            <TodayMovementCard
              userId={userId}
              date={day.date}
              weekStartISO={weekStartISO}
              suggested={
                day.workout.workout
                  ? {
                      id: day.workout.workout.id,
                      title: day.workout.workout.title,
                      type: day.workout.workout.type,
                      duration: day.workout.workout.duration,
                      image_url: day.workout.workout.image_url,
                    }
                  : null
              }
              reason={day.workout.reason}
              alternatives={workoutAlternatives}
              completed={
                completed
                  ? {
                      workoutId: completed.workoutId,
                      title: completed.title,
                      duration: completed.duration,
                    }
                  : null
              }
              emphasis="primary"
              embedded
              canUndoCompleted={Boolean(day.isToday && completed)}
              restDay={day.workout.focus === "rust"}
            />
          )}

          {showMeals && (
            <TodayMealsRows
              userId={userId}
              date={day.date}
              weekStartISO={weekStartISO}
              recipeImageById={recipeImageById}
              alternativesBySlot={alternativesBySlot}
              meals={day.meals.map((m) => ({
                slot: m.slot,
                label: m.label,
                recipe: m.recipe
                  ? {
                      id: m.recipe.id,
                      title: m.recipe.title,
                      image_url: m.recipe.image_url,
                      preparation_time: m.recipe.preparation_time,
                    }
                  : null,
              }))}
            />
          )}

          {nutritionEnabled && (
            <Link
              href={FEATURES.boodschappen.href}
              className="flex min-h-14 items-center gap-3 px-4 py-3 touch-manipulation -outline-offset-2 transition-colors duration-fast ease-standard hover:bg-cream-soft/60 active:bg-cream-soft"
            >
              <span
                aria-hidden
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-inset bg-sage-soft text-sage-dark"
              >
                <ShoppingCart {...ICON.sm} />
              </span>
              <span className="min-w-0 flex-1 text-base font-medium text-ink">
                {FEATURES.boodschappen.label}
                <span className="sr-only"> voor de hele week</span>
              </span>
              {groceryItemCount > 0 && <span className="text-sm text-ink-soft">{groceryItemCount}</span>}
              <ChevronRight {...iconProps("sm", "text-ink-soft")} aria-hidden />
            </Link>
          )}
        </Card>

        {focusTip && (
          <p className="mt-4 flex gap-2 text-sm text-ink-soft">
            <Lightbulb {...iconProps("sm", "mt-0.5 text-sage-dark")} aria-hidden />
            <span>{focusTip}</span>
          </p>
        )}
      </section>

      {/* Snack/hydration tips live on Vandaag and phase nutrition on Jouw
          fase — Week stays the plan only (usertest: the same tips showed
          up three times). */}
      {phaseContent && <p className="text-xs text-ink-soft">{phaseContent.whyText}</p>}
    </div>
  )
}
