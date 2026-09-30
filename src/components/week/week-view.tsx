"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { nl } from "date-fns/locale"
import { ShoppingCart, ChevronRight, Salad, Footprints, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { getPhaseContent } from "@/lib/cycle/phase-content"
import type { WeekDayPlan, WeekPlanRecipe, WeekPlanWorkout, MealSlot } from "@/lib/recommendations/week-plan"
import {
  loadWeekOverrides,
  setDayOverride,
  type DayOverride,
  type WeekOverrides,
} from "@/lib/client/week-plan-storage"
import { MealSlotCard } from "@/components/week/meal-slot-card"
import { WorkoutSlotCard } from "@/components/week/workout-slot-card"

interface WeekViewProps {
  userId: string
  weekStartISO: string
  days: WeekDayPlan[]
  recipePoolBySlot: Record<MealSlot, WeekPlanRecipe[]>
  workoutPool: WeekPlanWorkout[]
  groceryItemCount: number
  movementEnabled: boolean
  nutritionEnabled: boolean
}

export function WeekView({
  userId,
  weekStartISO,
  days,
  recipePoolBySlot,
  workoutPool,
  groceryItemCount,
  movementEnabled,
  nutritionEnabled,
}: WeekViewProps) {
  const todayIndex = Math.max(
    0,
    days.findIndex((d) => d.isToday),
  )
  const [selectedIndex, setSelectedIndex] = useState(todayIndex)
  const [overrides, setOverrides] = useState<WeekOverrides>({})

  useEffect(() => {
    // Reads localStorage, which isn't available during SSR — deliberately
    // deferred to an effect so the first client render matches the
    // server-rendered (override-free) HTML, then updates once mounted.
    // Also re-runs if the visible week changes (e.g. future "vorige/volgende
    // week" navigation), since overrides are keyed per week.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOverrides(loadWeekOverrides(userId, weekStartISO))
  }, [userId, weekStartISO])

  const day = days[selectedIndex]
  const phaseContent = day?.cycleEstimate ? getPhaseContent(day.cycleEstimate.phase) : null

  function updateOverride(key: string, override: DayOverride | null) {
    const next = setDayOverride(userId, weekStartISO, day.date, key, override)
    setOverrides(next)
  }

  const alternativesFor = useMemo(() => {
    return (slot: MealSlot, currentId: string | undefined) =>
      (recipePoolBySlot[slot] ?? []).filter((r) => r.id !== currentId).slice(0, 4)
  }, [recipePoolBySlot])

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
    return Array.from(byType.values()).flat()
  }, [workoutPool, day])

  if (!day) return null

  return (
    <div className="flex flex-col gap-5">
      {/* Thin phase context — Week is for planning, not re-explaining the phase */}
      {phaseContent && day.cycleEstimate && (
        <p className={cn("text-sm leading-relaxed px-0.5", phaseContent.colors.text)}>
          <span className="font-medium">
            {phaseContent.label} · dag {day.cycleEstimate.cycleDay}
          </span>
          <span className="text-ink-soft">
            {" — "}
            {day.anticipationNote ?? phaseContent.shortDescription}
          </span>
        </p>
      )}

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {days.map((d, i) => {
          const dPhase = d.cycleEstimate ? getPhaseContent(d.cycleEstimate.phase) : null
          const selected = i === selectedIndex
          const anticipated = Boolean(d.anticipationNote)
          return (
            <button
              key={d.date}
              type="button"
              onClick={() => setSelectedIndex(i)}
              aria-pressed={selected}
              aria-label={`${d.weekday} ${format(parseISO(d.date), "d MMMM", { locale: nl })}${d.isToday ? ", vandaag" : ""}${anticipated ? ", bij jou vaak zwaarder" : ""}`}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl px-1 py-2.5 min-h-11 touch-manipulation transition-colors",
                selected ? "bg-sage-fill text-white" : "bg-sage-soft/50 text-ink",
                anticipated && !selected && "ring-1 ring-sage/40",
              )}
            >
              <span className="text-[10px] font-medium uppercase opacity-80">{d.weekdayShort}</span>
              <span className="text-sm font-semibold">{format(parseISO(d.date), "d")}</span>
              {dPhase && (
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    selected ? "bg-surface/80" : dPhase.colors.dot,
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <h2 className="font-display text-lg text-ink capitalize">{day.weekday}</h2>
          <span className="text-xs text-ink-soft">
            {format(parseISO(day.date), "d MMMM", { locale: nl })}
          </span>
        </div>
        {!day.isToday && day.anticipationNote ? (
          <p className="text-xs text-ink-soft mb-2.5 leading-relaxed">
            Bij jou vaak een zwaardere dag — plan staat iets zachter.
          </p>
        ) : (
          <div className="mb-2.5" />
        )}

        <div className="flex flex-col gap-4">
          {nutritionEnabled && (
            <section>
              <p className="text-xs font-medium text-ink-soft mb-2 inline-flex items-center gap-1.5">
                <Salad className="h-3.5 w-3.5" strokeWidth={1.75} />
                Voeding
              </p>
              <div className="flex flex-col gap-2">
                {day.meals.map((meal) => (
                  <MealSlotCard
                    key={meal.slot}
                    slot={meal.slot}
                    label={meal.label}
                    recipe={meal.recipe}
                    alternatives={alternativesFor(meal.slot, meal.recipe?.id)}
                    override={overrides[`${day.date}:${meal.slot}`] ?? null}
                    onOverride={(o) => updateOverride(meal.slot, o)}
                  />
                ))}
              </div>
            </section>
          )}

          {movementEnabled && (
            <section>
              <p className="text-xs font-medium text-ink-soft mb-2 inline-flex items-center gap-1.5">
                <Footprints className="h-3.5 w-3.5" strokeWidth={1.75} />
                Beweging
              </p>
              <WorkoutSlotCard
                focus={day.workout.focus}
                workout={day.workout.workout}
                reason={day.workout.reason}
                alternatives={workoutAlternatives}
                override={overrides[`${day.date}:workout`] ?? null}
                onOverride={(o) => updateOverride("workout", o)}
              />
            </section>
          )}

          {day.focusTips[0] && (
            <p className="text-sm text-ink-soft leading-relaxed px-0.5 inline-flex gap-2">
              <Lightbulb className="h-3.5 w-3.5 shrink-0 mt-0.5 text-sage-dark" strokeWidth={1.75} aria-hidden />
              <span>{day.focusTips[0]}</span>
            </p>
          )}
        </div>
      </div>

      {nutritionEnabled && (
        <Link
          href="/deze-week/boodschappen"
          className="flex items-center justify-between rounded-3xl bg-sage-soft/50 px-4 py-3.5 touch-manipulation"
        >
          <span className="inline-flex items-center gap-2.5 text-sm font-medium text-ink">
            <ShoppingCart className="h-4 w-4 text-sage-dark" strokeWidth={1.75} />
            Boodschappen voor deze week
            {groceryItemCount > 0 && (
              <span className="text-xs text-ink-soft">({groceryItemCount})</span>
            )}
          </span>
          <ChevronRight className="h-4 w-4 text-ink-soft" strokeWidth={1.75} />
        </Link>
      )}

      {phaseContent && (
        <p className="text-xs text-ink-soft px-0.5 leading-relaxed">{phaseContent.whyText}</p>
      )}
    </div>
  )
}
