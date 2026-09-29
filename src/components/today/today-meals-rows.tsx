"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { RecipeImage } from "@/components/nutrition/recipe-image"
import {
  loadWeekOverrides,
  WEEK_OVERRIDES_CHANGED_EVENT,
  type DayOverride,
  type MealSlotKey,
} from "@/lib/client/week-plan-storage"

export type TodayMeal = {
  slot: MealSlotKey
  label: string
  recipe: {
    id: string
    title: string
    image_url: string | null
    preparation_time: number | null
  } | null
}

/**
 * Shows today's week-plan meals (ontbijt → lunch → diner) and respects the
 * same localStorage overrides as Deze week, so both pages stay in sync.
 */
export function TodayMealsRows({
  userId,
  date,
  weekStartISO,
  meals,
  recipeImageById = {},
}: {
  userId: string
  date: string
  weekStartISO: string
  meals: TodayMeal[]
  recipeImageById?: Record<string, string | null>
}) {
  const [overrides, setOverrides] = useState<Record<string, DayOverride>>({})

  useEffect(() => {
    function refresh() {
      setOverrides(loadWeekOverrides(userId, weekStartISO))
    }
    refresh()
    window.addEventListener(WEEK_OVERRIDES_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(WEEK_OVERRIDES_CHANGED_EVENT, refresh)
  }, [userId, weekStartISO])

  if (!meals.length) return null

  return (
    <>
      {meals.map((meal) => {
        const override = overrides[`${date}:${meal.slot}`] ?? null
        const skipped = override?.type === "skip-meal"
        const swapped = override?.type === "swap-meal" ? override : null
        const custom = override?.type === "custom-meal" ? override : null

        if (skipped) {
          return (
            <div key={meal.slot} className="px-4 py-3">
              <p className="text-[11px] font-medium text-sage-dark">{meal.label}</p>
              <p className="text-sm text-ink-soft italic">Overgeslagen</p>
            </div>
          )
        }

        if (custom) {
          return (
            <div key={meal.slot} className="px-4 py-3">
              <p className="text-[11px] font-medium text-sage-dark">{meal.label}</p>
              <p className="text-sm font-medium text-ink">{custom.text}</p>
            </div>
          )
        }

        const title = swapped?.title ?? meal.recipe?.title
        const recipeId = swapped?.recipeId ?? meal.recipe?.id
        if (!title || !recipeId) {
          return (
            <div key={meal.slot} className="px-4 py-3">
              <p className="text-[11px] font-medium text-sage-dark">{meal.label}</p>
              <p className="text-sm text-ink-soft">Nog geen voorstel</p>
            </div>
          )
        }

        const imageUrl = swapped
          ? (recipeImageById[recipeId] ?? null)
          : (meal.recipe?.image_url ?? recipeImageById[recipeId] ?? null)

        return (
          <Link
            key={meal.slot}
            href={`/voeding/${recipeId}`}
            className="flex items-center gap-3 px-4 py-3 touch-manipulation motion-safe:active:bg-sage-soft/80 transition-colors"
          >
            <RecipeImage
              title={title}
              imageUrl={imageUrl}
              className="h-11 w-11 rounded-xl shrink-0"
              sizes="44px"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-sage-dark">{meal.label}</p>
              <p className="text-sm font-medium text-ink leading-snug truncate">{title}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={2} aria-hidden />
          </Link>
        )
      })}
    </>
  )
}
