"use client"

import { Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { hasIngredientInfo, IngredientList } from "@/components/nutrition/ingredient-info-sheet"
import { ServingsStepper } from "@/components/nutrition/servings-stepper"
import { useRecipeServings } from "@/components/nutrition/use-recipe-servings"
import { scaleIngredientListForCooking } from "@/lib/nutrition/scale-ingredient"
import { ICON } from "@/lib/ui/icon"

function portiesLabel(n: number) {
  return `${n} ${n === 1 ? "portie" : "porties"}`
}

/**
 * Recipe ingredients with a live porties stepper. Changing porties scales
 * amounts (rounded the way you'd measure them) and remembers a per-recipe
 * choice, falling back to her household default (shared with Boodschappen).
 */
export function RecipeIngredientsWithServings({
  userId,
  recipeId,
  recipeServings,
  ingredients,
  optionalIngredients = [],
}: {
  userId: string
  recipeId: string
  recipeServings: number | null
  ingredients: string[]
  optionalIngredients?: string[]
}) {
  const { base, chosen, factor, setChosen } = useRecipeServings(userId, recipeId, recipeServings)

  const scaled = scaleIngredientListForCooking(ingredients, factor)
  const scaledOptional = scaleIngredientListForCooking(optionalIngredients, factor)
  const showHint = hasIngredientInfo(ingredients) || hasIngredientInfo(optionalIngredients)

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-medium text-ink">
            Porties
          </p>
          <p className="text-sm text-ink-soft">
            {chosen === base ? "Zoals in het recept" : `Aangepast van ${base}`}
          </p>
        </div>
        <ServingsStepper value={chosen} onChange={setChosen} size="sm" />
      </div>

      {showHint && (
        <p className="mt-4 text-sm text-ink-soft">Tik op een onderstreept ingrediënt om te lezen waarom het past.</p>
      )}

      <IngredientList ingredients={scaled} className={showHint ? "mt-2" : "mt-3"} />

      {scaledOptional.length > 0 && (
        <>
          <h3 className="mt-4 text-base font-medium text-ink">Optioneel toevoegen</h3>
          <IngredientList ingredients={scaledOptional} bulletClassName="text-peach" className="mt-1" />
        </>
      )}
    </Card>
  )
}

/** "{n} porties" in the recipe's meta line: the same number as the stepper. */
export function RecipeServingsMeta({
  userId,
  recipeId,
  recipeServings,
}: {
  userId: string
  recipeId: string
  recipeServings: number | null
}) {
  const { chosen } = useRecipeServings(userId, recipeId, recipeServings)
  return (
    <span className="inline-flex items-center gap-1.5">
      <Users {...ICON.sm} aria-hidden />
      {portiesLabel(chosen)}
    </span>
  )
}
