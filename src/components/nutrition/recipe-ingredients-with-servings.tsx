"use client"

import { useEffect, useState } from "react"
import { IngredientList } from "@/components/nutrition/ingredient-info-sheet"
import { ServingsStepper } from "@/components/nutrition/servings-stepper"
import {
  loadServingsPrefs,
  resolveRecipeServings,
  setRecipeServings,
  SERVINGS_CHANGED_EVENT,
  type ServingsPrefs,
} from "@/lib/client/servings-storage"
import { scaleIngredientList } from "@/lib/nutrition/scale-ingredient"

/**
 * Recipe ingredients with a live porties stepper. Changing porties scales
 * amounts and remembers a per-recipe override (falls back to household default).
 */
export function RecipeIngredientsWithServings({
  userId,
  recipeId,
  recipeServings,
  ingredients,
  optionalIngredients = [],
  isBudget = false,
}: {
  userId: string
  recipeId: string
  recipeServings: number | null
  ingredients: string[]
  optionalIngredients?: string[]
  isBudget?: boolean
}) {
  const [prefs, setPrefs] = useState<ServingsPrefs | null>(null)

  useEffect(() => {
    function refresh() {
      setPrefs(loadServingsPrefs(userId))
    }
    refresh()
    window.addEventListener(SERVINGS_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(SERVINGS_CHANGED_EVENT, refresh)
  }, [userId])

  const resolved = prefs
    ? resolveRecipeServings(recipeId, recipeServings, prefs)
    : { base: recipeServings && recipeServings > 0 ? recipeServings : 2, chosen: recipeServings && recipeServings > 0 ? recipeServings : 2, factor: 1 }

  const scaled = scaleIngredientList(ingredients, resolved.factor)
  const scaledOptional = scaleIngredientList(optionalIngredients, resolved.factor)
  const isCustom = Boolean(prefs?.byRecipeId[recipeId])

  function onChange(next: number) {
    // Setting equal to household default clears the per-recipe override.
    if (prefs && next === prefs.defaultServings) {
      setPrefs(setRecipeServings(userId, recipeId, null))
    } else {
      setPrefs(setRecipeServings(userId, recipeId, next))
    }
  }

  return (
    <div className="rounded-[1.25rem] bg-surface border border-line p-4 lg:p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">
            {isBudget ? "Basis" : "Ingrediënten"}
          </p>
          <p className="text-xs text-ink-soft mt-0.5">
            {resolved.chosen} {resolved.chosen === 1 ? "portie" : "porties"}
            {resolved.base !== resolved.chosen
              ? ` · recept is voor ${resolved.base}`
              : isCustom
                ? " · eigen keuze"
                : " · jouw basis"}
          </p>
        </div>
        <ServingsStepper value={resolved.chosen} onChange={onChange} size="sm" />
      </div>

      <IngredientList ingredients={scaled} />
      {scaledOptional.length > 0 && (
        <>
          <p className="text-sm font-medium text-ink mt-4 mb-3">Optioneel toevoegen</p>
          <IngredientList ingredients={scaledOptional} bulletClassName="text-peach" />
        </>
      )}
    </div>
  )
}
