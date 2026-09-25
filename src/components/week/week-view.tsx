"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { nl } from "date-fns/locale"
import { ShoppingCart, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
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
}

export function WeekView({
  userId,
  weekStartISO,
  days,
  recipePoolBySlot,
  workoutPool,
  groceryItemCount,
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
    return workoutPool.filter((w) => w.id !== day.workout.workout?.id).slice(0, 4)
  }, [workoutPool, day])

  if (!day) return null

  return (
    <div className="flex flex-col gap-5">
      {phaseContent && (
        <div className={cn("rounded-3xl p-5", phaseContent.colors.bg)}>
          <p className={cn("text-sm font-semibold", phaseContent.colors.text)}>
            {phaseContent.label}
            {day.cycleEstimate && ` · cyclusdag ${day.cycleEstimate.cycleDay}`}
          </p>
          <p className="text-sm text-ink-soft mt-1">{phaseContent.shortDescription}</p>
        </div>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
        {days.map((d, i) => {
          const dPhase = d.cycleEstimate ? getPhaseContent(d.cycleEstimate.phase) : null
          const selected = i === selectedIndex
          return (
            <button
              key={d.date}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "shrink-0 snap-start flex flex-col items-center gap-1.5 rounded-2xl px-3.5 py-2.5 min-w-[52px] touch-manipulation transition-colors",
                selected ? "bg-sage-dark text-white" : "bg-white border border-line text-ink",
              )}
            >
              <span className="text-[10px] font-medium uppercase opacity-80">{d.weekdayShort}</span>
              <span className="text-sm font-semibold">{format(parseISO(d.date), "d")}</span>
              {dPhase && (
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    selected ? "bg-white/80" : dPhase.colors.dot,
                  )}
                />
              )}
            </button>
          )
        })}
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2.5">
          <h2 className="font-display text-lg text-ink capitalize">
            {day.isToday ? "Vandaag" : day.weekday}
          </h2>
          <span className="text-xs text-ink-soft">
            {format(parseISO(day.date), "d MMMM", { locale: nl })}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <section>
            <p className="text-xs font-medium text-ink-soft mb-2 inline-flex items-center gap-1.5">
              🥗 Voeding
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

          <section>
            <p className="text-xs font-medium text-ink-soft mb-2 inline-flex items-center gap-1.5">
              🏃 Beweging
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

          {day.focusTips.length > 0 && (
            <section>
              <p className="text-xs font-medium text-ink-soft mb-2 inline-flex items-center gap-1.5">
                💡 Focus
              </p>
              <Card className="p-3.5">
                <ul className="flex flex-col gap-1.5">
                  {day.focusTips.map((tip, i) => (
                    <li key={i} className="text-sm text-ink-soft leading-relaxed">
                      {tip}
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}
        </div>
      </div>

      <Link
        href="/deze-week/boodschappen"
        className="flex items-center justify-between rounded-2xl bg-white border border-line/70 px-4 py-3.5 touch-manipulation"
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

      {phaseContent && <p className="text-xs text-ink-soft px-1">{phaseContent.whyText}</p>}
    </div>
  )
}
