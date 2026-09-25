"use client"

import { useMemo, useState } from "react"
import { Salad } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { RecipeCard } from "./recipe-card"
import { EmptyState } from "@/components/ui/empty-state"
import { RECIPE_CATEGORIES } from "@/lib/constants"
import type { Tables } from "@/types/database"

const BUDGET_FILTER = "Budget"
const LOW_CARB_FILTER = "Koolhydraatarm"

function isLowCarb(recipe: Tables<"recipes">): boolean {
  const value = recipe.nutrition_information
  if (!value || typeof value !== "object") return false
  const koolhydraten = (value as Record<string, unknown>).koolhydraten
  if (typeof koolhydraten !== "string") return false
  const match = koolhydraten.match(/[\d.]+/)
  return match ? Number(match[0]) <= 20 : false
}

export function RecipeLibrary({ recipes }: { recipes: Tables<"recipes">[] }) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!activeFilter) return recipes
    if (activeFilter === BUDGET_FILTER) return recipes.filter((r) => r.is_budget)
    if (activeFilter === LOW_CARB_FILTER) return recipes.filter(isLowCarb)
    return recipes.filter((r) => r.category.includes(activeFilter))
  }, [recipes, activeFilter])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <Chip selected={activeFilter === null} onClick={() => setActiveFilter(null)}>
          Alles
        </Chip>
        <Chip
          selected={activeFilter === BUDGET_FILTER}
          onClick={() => setActiveFilter(BUDGET_FILTER)}
        >
          {BUDGET_FILTER}
        </Chip>
        <Chip
          selected={activeFilter === LOW_CARB_FILTER}
          onClick={() => setActiveFilter(LOW_CARB_FILTER)}
        >
          {LOW_CARB_FILTER}
        </Chip>
        {RECIPE_CATEGORIES.map((category) => (
          <Chip
            key={category}
            selected={activeFilter === category}
            onClick={() => setActiveFilter(category)}
          >
            {category}
          </Chip>
        ))}
      </div>

      {filtered.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <EmptyState icon={<Salad className="h-6 w-6" />} title="Geen recepten in deze categorie." />
      )}
    </div>
  )
}
