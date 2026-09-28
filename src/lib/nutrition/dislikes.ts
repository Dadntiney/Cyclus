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
  const terms = (dislikedFoods ?? []).map(normalizeIngredientName).filter(Boolean)
  if (!terms.length) return recipes

  const filtered = recipes.filter((recipe) => !matchesAnyDislike(recipe, terms))
  return filtered.length ? filtered : recipes
}

function matchesAnyDislike(recipe: { title: string; ingredients?: unknown }, normalizedTerms: string[]): boolean {
  const haystacks = [recipe.title, ...parseIngredientList(recipe.ingredients)].map(normalizeIngredientName)
  return normalizedTerms.some((term) => haystacks.some((haystack) => haystack.includes(term)))
}
