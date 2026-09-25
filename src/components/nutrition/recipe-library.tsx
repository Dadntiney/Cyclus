"use client"

import { useMemo, useState } from "react"
import { Salad } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { RecipeCard } from "./recipe-card"
import { EmptyState } from "@/components/ui/empty-state"
import { RECIPE_CATEGORIES } from "@/lib/constants"
import type { Tables } from "@/types/database"

export function RecipeLibrary({ recipes }: { recipes: Tables<"recipes">[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!activeCategory) return recipes
    return recipes.filter((r) => r.category.includes(activeCategory))
  }, [recipes, activeCategory])

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <Chip selected={activeCategory === null} onClick={() => setActiveCategory(null)}>
          Alles
        </Chip>
        {RECIPE_CATEGORIES.map((category) => (
          <Chip
            key={category}
            selected={activeCategory === category}
            onClick={() => setActiveCategory(category)}
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
