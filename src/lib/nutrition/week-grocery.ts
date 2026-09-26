import type { WeekDayPlan, WeekPlanRecipe } from "@/lib/recommendations/week-plan"
import type { WeekOverrides } from "@/lib/client/week-plan-storage"
import { buildGroceryList, type GroceryCategory } from "@/lib/nutrition/grocery-list"

/**
 * Same grocery aggregation as `buildGroceryList`, but first resolves each
 * day's meal slots against the user's local overrides (swapped/skipped/
 * custom meals) so a swapped-out salmon dinner doesn't still show up on the
 * shopping list. Swapped-in recipes are resolved via `recipesById` since an
 * override only stores the id + title (see week-plan-storage) — anything it
 * can't resolve (a custom, free-text meal, or a skipped one) is simply left
 * out of the list rather than guessed at.
 */
export function buildWeekGroceryList(
  days: WeekDayPlan[],
  overrides: WeekOverrides,
  recipesById: Map<string, WeekPlanRecipe>,
): GroceryCategory[] {
  const ingredientLists: unknown[] = []

  for (const day of days) {
    for (const meal of day.meals) {
      const override = overrides[`${day.date}:${meal.slot}`]
      if (override?.type === "skip-meal" || override?.type === "custom-meal") continue

      const recipe =
        override?.type === "swap-meal" ? (recipesById.get(override.recipeId) ?? null) : meal.recipe
      if (recipe) ingredientLists.push(recipe.ingredients)
    }
  }

  return buildGroceryList(ingredientLists)
}

export type { GroceryCategory }
