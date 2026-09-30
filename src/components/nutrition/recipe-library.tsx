"use client"

import { useMemo, useState } from "react"
import { Salad } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { RecipeCard } from "./recipe-card"
import { EmptyState } from "@/components/ui/empty-state"
import { RECIPE_CATEGORIES } from "@/lib/constants"
import {
  CUISINE_OPTIONS,
  detectRecipeCuisines,
  isWorldCuisineLabel,
  recipeHasWorldCuisine,
} from "@/lib/nutrition/cuisine"
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

const PAGE_SIZE = 12

export function RecipeLibrary({ recipes }: { recipes: RecipeCardData[] }) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [timeFilter, setTimeFilter] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    let result = recipes

    // "Alles" hides optional world cuisines; cuisine chips opt them in.
    if (activeFilter === null) {
      result = result.filter((r) => !recipeHasWorldCuisine(r))
    } else if (isWorldCuisineLabel(activeFilter)) {
      result = result.filter((r) => detectRecipeCuisines(r).includes(activeFilter))
    } else if (activeFilter === BUDGET_FILTER) {
      result = result.filter((r) => r.is_budget)
    } else if (activeFilter === LOW_CARB_FILTER) {
      result = result.filter(isLowCarb)
    } else {
      result = result.filter((r) => r.category.includes(activeFilter))
    }

    if (timeFilter === 30) {
      result = result.filter((r) => r.preparation_time !== null && r.preparation_time >= 30)
    } else if (timeFilter) {
      result = result.filter((r) => r.preparation_time !== null && r.preparation_time <= timeFilter)
    }

    return result
  }, [recipes, activeFilter, timeFilter])

  const visible = filtered.slice(0, visibleCount)
  const hiddenCount = Math.max(0, filtered.length - visible.length)

  return (
    <div>
      <div className="flex w-full gap-2 mb-4 overflow-x-auto safe-x lg:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip
          className="shrink-0"
          selected={activeFilter === null}
          onClick={() => {
            setActiveFilter(null)
            setVisibleCount(PAGE_SIZE)
          }}
        >
          Alles
        </Chip>
        <Chip
          className="shrink-0"
          selected={activeFilter === BUDGET_FILTER}
          onClick={() => {
            setActiveFilter(BUDGET_FILTER)
            setVisibleCount(PAGE_SIZE)
          }}
        >
          {BUDGET_FILTER}
        </Chip>
        <Chip
          className="shrink-0"
          selected={activeFilter === LOW_CARB_FILTER}
          onClick={() => {
            setActiveFilter(LOW_CARB_FILTER)
            setVisibleCount(PAGE_SIZE)
          }}
        >
          {LOW_CARB_FILTER}
        </Chip>
        {RECIPE_CATEGORIES.map((category) => (
          <Chip
            key={category}
            className="shrink-0"
            selected={activeFilter === category}
            onClick={() => {
              setActiveFilter(category)
              setVisibleCount(PAGE_SIZE)
            }}
          >
            {category}
          </Chip>
        ))}
        {CUISINE_OPTIONS.map((cuisine) => (
          <Chip
            key={cuisine}
            className="shrink-0"
            selected={activeFilter === cuisine}
            onClick={() => {
              setActiveFilter(cuisine)
              setVisibleCount(PAGE_SIZE)
            }}
          >
            {cuisine}
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
        <>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="mt-4 w-full inline-flex items-center justify-center min-h-11 rounded-xl border border-line text-sm font-medium text-sage-dark touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
            >
              Toon {Math.min(PAGE_SIZE, hiddenCount)} recepten meer
              {hiddenCount > PAGE_SIZE ? ` (${hiddenCount} resterend)` : ""}
            </button>
          )}
        </>
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
