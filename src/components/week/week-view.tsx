"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { nl } from "date-fns/locale"
import { ShoppingCart, ChevronRight, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { getPhaseContent } from "@/lib/cycle/phase-content"
import {
  formatPresentedCycleHeadline,
  softMenstruationNote,
  PREDICTED_MENSTRUATION_NOTE,
} from "@/lib/cycle/presented-estimate"
import { PhaseNutritionBasics } from "@/components/cycle/phase-nutrition-basics"
import { PhaseSnackTipCard } from "@/components/cycle/phase-snack-tip-card"
import { PhaseHydrationTipCard } from "@/components/cycle/phase-hydration-tip-card"
import type { WeekDayPlan, WeekPlanRecipe, WeekPlanWorkout, MealSlot } from "@/lib/recommendations/week-plan"
import { TodayMovementCard } from "@/components/today/today-movement-card"
import {
  TodayMealsRows,
  type TodayMealAlternative,
} from "@/components/today/today-meals-rows"
import type { MealSlotKey } from "@/lib/client/week-plan-storage"
import type { CompletedWorkoutInfo } from "@/lib/data/week-plan-context"

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
}: WeekViewProps) {
  const todayIndex = Math.max(
    0,
    days.findIndex((d) => d.isToday),
  )
  const [selectedIndex, setSelectedIndex] = useState(todayIndex)

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

  if (!day) return null

  const completed = completedWorkoutsByDate[day.date] ?? null
  const showMeals = nutritionEnabled && day.meals.length > 0
  const showMovement = movementEnabled
  const showGrocery = nutritionEnabled
  const hasPlan = showMovement || showMeals || showGrocery

  return (
    <div className="flex flex-col gap-5">
      {/* Thin phase context — Week is for planning, not re-explaining the phase */}
      {phaseContent && day.cycleEstimate && (
        <p className={cn("text-sm leading-relaxed px-0.5", phaseContent.colors.text)}>
          <span className="font-medium">
            {formatPresentedCycleHeadline(
              day.cycleEstimate,
              day.date,
              activePeriodStart,
              day.predictedMenstruation,
              day.menstruationSoftHint,
            )}
          </span>
          <span className="text-ink-soft">
            {" — "}
            {day.predictedMenstruation
              ? (day.anticipationNote ??
                  softMenstruationNote(day.menstruationSoftHint) ??
                  PREDICTED_MENSTRUATION_NOTE)
              : (day.anticipationNote ?? phaseContent.shortDescription)}
          </span>
        </p>
      )}

      {phaseContent && nutritionEnabled && (
        <section>
          <p className="text-xs font-medium text-ink-soft mb-2">Voeding in deze fase</p>
          <PhaseNutritionBasics nutrition={phaseContent.nutrition} compact />
        </section>
      )}

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {days.map((d, i) => {
          const dPhase = d.cycleEstimate ? getPhaseContent(d.cycleEstimate.phase) : null
          const selected = i === selectedIndex
          const anticipated = Boolean(d.anticipationNote)
          const predicted = d.predictedMenstruation
          return (
            <button
              key={d.date}
              type="button"
              onClick={() => setSelectedIndex(i)}
              aria-pressed={selected}
              aria-label={`${d.weekday} ${format(parseISO(d.date), "d MMMM", { locale: nl })}${d.isToday ? ", vandaag" : ""}${predicted ? ", menstruatie kan komen" : ""}${anticipated ? ", bij jou vaak zwaarder" : ""}`}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl border px-1 py-2.5 min-h-14 touch-manipulation transition-colors",
                selected ? "bg-sage-fill border-sage-fill text-white" : "bg-surface border-line text-ink",
                (anticipated || predicted) && !selected && "border-sage-dark/50",
                d.isToday && !selected && "border-2 border-sage-dark",
              )}
            >
              <span className="text-xs font-medium opacity-80">{d.weekdayShort}</span>
              <span className="text-base font-semibold tabular-nums">{format(parseISO(d.date), "d")}</span>
              {/* A slice of the Ritmeband: the phase colour for this day. */}
              <span
                aria-hidden
                className={cn(
                  "h-1 w-5 rounded-full",
                  dPhase ? (selected ? "bg-white/80" : dPhase.colors.dot) : "bg-transparent",
                )}
              />
            </button>
          )
        })}
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <h2 className="font-display text-xl text-ink capitalize">{day.weekday}</h2>
          <span className="text-xs text-ink-soft">
            {format(parseISO(day.date), "d MMMM", { locale: nl })}
          </span>
        </div>
        {day.anticipationNote ? (
          <p className="text-xs text-ink-soft mb-2.5 leading-relaxed">
            {day.predictedMenstruation
              ? day.anticipationNote
              : "Bij jou vaak een zwaardere dag — plan staat iets zachter."}
          </p>
        ) : (
          <div className="mb-2.5" />
        )}

        {hasPlan ? (
          <div className="rounded-[1.25rem] bg-surface border border-line overflow-hidden">
            {showMovement && (
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

            {(showMeals || showGrocery) && (
              <div
                className={cn(
                  "divide-y divide-line",
                  showMovement && "border-t border-sage/15",
                )}
              >
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

                {showGrocery && (
                  <div className="flex items-center justify-between gap-3 px-4 py-2.5 min-h-11">
                    <Link
                      href="/deze-week/boodschappen"
                      className="inline-flex items-center gap-2 text-sm font-medium text-ink touch-manipulation min-h-11"
                    >
                      <ShoppingCart className="h-4 w-4 text-sage-dark shrink-0" strokeWidth={1.75} />
                      Boodschappen
                      {groceryItemCount > 0 && (
                        <span className="text-xs text-ink-soft font-normal">({groceryItemCount})</span>
                      )}
                    </Link>
                    {day.isToday ? (
                      <Link
                        href="/deze-week/boodschappen?modus=dag"
                        className="text-xs font-medium text-sage-dark touch-manipulation min-h-11 inline-flex items-center shrink-0"
                      >
                        Voor vandaag
                      </Link>
                    ) : (
                      <Link
                        href="/deze-week/boodschappen"
                        aria-label="Open boodschappenlijst"
                        className="min-h-11 inline-flex items-center shrink-0 touch-manipulation"
                      >
                        <ChevronRight className="h-4 w-4 text-ink-soft" strokeWidth={1.75} />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}

        {nutritionEnabled && day.snackTip && (
          <div className="mt-4">
            <PhaseSnackTipCard tip={day.snackTip} compact />
          </div>
        )}

        {day.hydrationTip && (
          <div className={nutritionEnabled && day.snackTip ? "mt-2.5" : "mt-4"}>
            <PhaseHydrationTipCard tip={day.hydrationTip} compact />
          </div>
        )}

        {day.focusTips[0] && (
          <p className="text-sm text-ink-soft leading-relaxed px-0.5 mt-4 inline-flex gap-2">
            <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5 text-sage-dark" strokeWidth={1.75} aria-hidden />
            <span>{day.focusTips[0]}</span>
          </p>
        )}
      </div>

      {phaseContent && (
        <p className="text-xs text-ink-soft px-0.5 leading-relaxed">{phaseContent.whyText}</p>
      )}
    </div>
  )
}
