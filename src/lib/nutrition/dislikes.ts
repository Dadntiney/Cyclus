import { normalizeIngredientName, parseIngredientList } from "@/lib/nutrition/ingredient-parse"

/**
 * Excludes recipes that mention one of her disliked foods — matched against
 * the title and the required ingredients (not optional_ingredients, since
 * those can simply be left out). Substring matching on normalized text so
 * "paddenstoel" also catches "paddenstoelen" and ingredient lines like
 * "150g paddenstoelen". If everything would get filtered out, the original
 * list is returned instead of leaving a meal slot empty — same fallback
 * pattern as the other preference filters in this file's callers.
 */
export function filterOutDislikedRecipes<T extends { title: string; ingredients?: unknown }>(
  recipes: T[],
  dislikedFoods: string[] | null | undefined,
): T[] {
  return filterOutAvoidedRecipes(recipes, dislikedFoods, { fallbackToOriginal: true })
}

/**
 * Harder exclusion for allergies: never fall back to allergen-containing
 * recipes. Callers should handle an empty result (empty meal slot / message).
 */
export function filterOutAllergyRecipes<T extends { title: string; ingredients?: unknown }>(
  recipes: T[],
  allergies: string[] | null | undefined,
): T[] {
  return filterOutAvoidedRecipes(recipes, allergies, { fallbackToOriginal: false })
}

/** Apply allergies first (strict), then dislikes (soft fallback). */
export function filterRecipesForNutritionPrefs<T extends { title: string; ingredients?: unknown }>(
  recipes: T[],
  allergies: string[] | null | undefined,
  dislikedFoods: string[] | null | undefined,
): T[] {
  const withoutAllergies = filterOutAllergyRecipes(recipes, allergies)
  return filterOutDislikedRecipes(withoutAllergies, dislikedFoods)
}

function filterOutAvoidedRecipes<T extends { title: string; ingredients?: unknown }>(
  recipes: T[],
  avoided: string[] | null | undefined,
  { fallbackToOriginal }: { fallbackToOriginal: boolean },
): T[] {
  const terms = (avoided ?? []).map(normalizeIngredientName).filter(Boolean)
  if (!terms.length) return recipes

  const filtered = recipes.filter((recipe) => !matchesAnyAvoidance(recipe, terms))
  if (filtered.length) return filtered
  return fallbackToOriginal ? recipes : filtered
}

function matchesAnyAvoidance(
  recipe: { title: string; ingredients?: unknown },
  normalizedTerms: string[],
): boolean {
  const haystacks = [recipe.title, ...parseIngredientList(recipe.ingredients)].map(normalizeIngredientName)
  return normalizedTerms.some((term) => haystacks.some((haystack) => haystack.includes(term)))
}
