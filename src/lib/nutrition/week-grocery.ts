import type { WeekDayPlan, WeekPlanRecipe } from "@/lib/recommendations/week-plan"
import type { WeekOverrides } from "@/lib/client/week-plan-storage"
import type { ServingsPrefs } from "@/lib/client/servings-storage"
import { resolveRecipeServings, DEFAULT_HOUSEHOLD_SERVINGS } from "@/lib/client/servings-storage"
import {
  buildGroceryList,
  type GroceryCategory,
  type GroceryRecipeInput,
} from "@/lib/nutrition/grocery-list"

const FALLBACK_PREFS: ServingsPrefs = {
  defaultServings: DEFAULT_HOUSEHOLD_SERVINGS,
  byRecipeId: {},
}

/**
 * Resolves meal slots against local overrides, then aggregates ingredients
 * scaled to the user’s chosen porties (household default or per-recipe).
 */
function collectRecipeInputs(
  days: WeekDayPlan[],
  overrides: WeekOverrides,
  recipesById: Map<string, WeekPlanRecipe>,
  servingsPrefs: ServingsPrefs = FALLBACK_PREFS,
): GroceryRecipeInput[] {
  const inputs: GroceryRecipeInput[] = []

  for (const day of days) {
    for (const meal of day.meals) {
      const override = overrides[`${day.date}:${meal.slot}`]
      if (override?.type === "skip-meal" || override?.type === "custom-meal") continue

      const recipe =
        override?.type === "swap-meal" ? (recipesById.get(override.recipeId) ?? null) : meal.recipe
      if (!recipe) continue

      const { factor } = resolveRecipeServings(recipe.id, recipe.servings, servingsPrefs)
      inputs.push({ ingredients: recipe.ingredients, factor })
    }
  }

  return inputs
}

/**
 * Same grocery aggregation as `buildGroceryList`, but first resolves each
 * day's meal slots against the user's local overrides (swapped/skipped/
 * custom meals) and scales amounts to chosen porties.
 */
export function buildWeekGroceryList(
  days: WeekDayPlan[],
  overrides: WeekOverrides,
  recipesById: Map<string, WeekPlanRecipe>,
  servingsPrefs?: ServingsPrefs,
): GroceryCategory[] {
  return buildGroceryList(collectRecipeInputs(days, overrides, recipesById, servingsPrefs))
}

/** Grocery list for a single planned day (same override + servings rules). */
export function buildDayGroceryList(
  day: WeekDayPlan,
  overrides: WeekOverrides,
  recipesById: Map<string, WeekPlanRecipe>,
  servingsPrefs?: ServingsPrefs,
): GroceryCategory[] {
  return buildGroceryList(collectRecipeInputs([day], overrides, recipesById, servingsPrefs))
}

export type { GroceryCategory }
