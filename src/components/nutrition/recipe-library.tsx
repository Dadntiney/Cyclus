"use client"

import { useMemo, useState } from "react"
import { Salad } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { RecipeCard } from "./recipe-card"
import { EmptyState } from "@/components/ui/empty-state"
import { RECIPE_CATEGORIES } from "@/lib/constants"
import type { RecipeCardData } from "@/lib/data/nutrition"

const BUDGET_FILTER = "Budget"
const LOW_CARB_FILTER = "Koolhydraatarm"

const TIME_OPTIONS = [
  { value: 10, label: "10 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30+ min" },
] as const

function isLowCarb(recipe: RecipeCardData): boolean {
  const value = recipe.nutrition_information
  if (!value || typeof value !== "object") return false
  const koolhydraten = (value as Record<string, unknown>).koolhydraten
  if (typeof koolhydraten !== "string") return false
  const match = koolhydraten.match(/[\d.]+/)
  return match ? Number(match[0]) <= 20 : false
}

export function RecipeLibrary({ recipes }: { recipes: RecipeCardData[] }) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<number | null>(null)

  const filtered = useMemo(() => {
    let result = recipes
    if (activeFilter === BUDGET_FILTER) result = result.filter((r) => r.is_budget)
    else if (activeFilter === LOW_CARB_FILTER) result = result.filter(isLowCarb)
    else if (activeFilter) result = result.filter((r) => r.category.includes(activeFilter))

    if (timeFilter === 30) {
      result = result.filter((r) => r.preparation_time !== null && r.preparation_time >= 30)
    } else if (timeFilter) {
      result = result.filter((r) => r.preparation_time !== null && r.preparation_time <= timeFilter)
    }

    return result
  }, [recipes, activeFilter, timeFilter])

  return (
    <div>
      <div className="flex w-full gap-2 mb-4 overflow-x-auto lg:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip
          className="shrink-0"
          selected={activeFilter === null}
          onClick={() => setActiveFilter(null)}
        >
          Alles
        </Chip>
        <Chip
          className="shrink-0"
          selected={activeFilter === BUDGET_FILTER}
          onClick={() => setActiveFilter(BUDGET_FILTER)}
        >
          {BUDGET_FILTER}
        </Chip>
        <Chip
          className="shrink-0"
          selected={activeFilter === LOW_CARB_FILTER}
          onClick={() => setActiveFilter(LOW_CARB_FILTER)}
        >
          {LOW_CARB_FILTER}
        </Chip>
        {RECIPE_CATEGORIES.map((category) => (
          <Chip
            key={category}
            className="shrink-0"
            selected={activeFilter === category}
            onClick={() => setActiveFilter(category)}
          >
            {category}
          </Chip>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-ink-soft shrink-0">Ik heb tijd:</span>
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TIME_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              className="shrink-0"
              selected={timeFilter === opt.value}
              onClick={() => setTimeFilter((t) => (t === opt.value ? null : opt.value))}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Salad className="h-6 w-6" />}
          title="Geen recepten bij deze filters."
          description="Probeer een andere combinatie, of bekijk alles."
        />
      )}
    </div>
  )
}
