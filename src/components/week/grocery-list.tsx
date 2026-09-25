"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { groceryItemSubtitle, type GroceryCategory } from "@/lib/nutrition/grocery-list"
import { buildWeekGroceryList } from "@/lib/nutrition/week-grocery"
import { loadCheckedGroceryIds, loadWeekOverrides, saveCheckedGroceryIds } from "@/lib/client/week-plan-storage"
import type { WeekDayPlan, WeekPlanRecipe } from "@/lib/recommendations/week-plan"

export function GroceryList({
  userId,
  weekStartISO,
  baseCategories,
  days,
  recipesById,
}: {
  userId: string
  weekStartISO: string
  /** Server-computed, override-free list — shown until overrides load client-side. */
  baseCategories: GroceryCategory[]
  days: WeekDayPlan[]
  recipesById: Record<string, WeekPlanRecipe>
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [categories, setCategories] = useState(baseCategories)

  useEffect(() => {
    // Reads localStorage, which isn't available during SSR — deliberately
    // deferred to an effect so the first client render matches the
    // server-rendered (override-free) HTML, then updates once mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChecked(loadCheckedGroceryIds(userId, weekStartISO))
    const overrides = loadWeekOverrides(userId, weekStartISO)
    if (Object.keys(overrides).length) {
      const byId = new Map(Object.entries(recipesById))
      setCategories(buildWeekGroceryList(days, overrides, byId))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- days/recipesById are stable per page load
  }, [userId, weekStartISO])

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveCheckedGroceryIds(userId, weekStartISO, next)
      return next
    })
  }

  if (!categories.length) {
    return (
      <p className="text-sm text-ink-soft">
        Nog geen boodschappen — zodra je weekplanning maaltijden bevat, verschijnen ze hier automatisch.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {categories.map((cat) => (
        <div key={cat.category}>
          <h2 className="font-display text-base text-ink mb-2">{cat.category}</h2>
          <div className="rounded-3xl bg-white border border-line/70 divide-y divide-line overflow-hidden">
            {cat.items.map((item) => {
              const isChecked = checked.has(item.id)
              const subtitle = groceryItemSubtitle(item)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left touch-manipulation"
                >
                  <span
                    className={cn(
                      "shrink-0 h-5 w-5 rounded-md border flex items-center justify-center transition-colors",
                      isChecked ? "bg-sage-dark border-sage-dark" : "border-line",
                    )}
                  >
                    {isChecked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-sm font-medium",
                        isChecked ? "text-ink-soft/60 line-through" : "text-ink",
                      )}
                    >
                      {item.name}
                    </span>
                    {subtitle && (
                      <span className="block text-xs text-ink-soft mt-0.5">{subtitle}</span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
