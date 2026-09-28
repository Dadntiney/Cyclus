/**
 * World-cuisine recipes are optional — not part of the default suggestion
 * pool. Users opt in via nutrition preferences (Turks / Marokkaans / Libanees)
 * or by picking a cuisine chip in the recipe library.
 */

export const WORLD_CUISINE_OPTIONS = ["Turks", "Marokkaans", "Libanees"] as const
export type WorldCuisine = (typeof WORLD_CUISINE_OPTIONS)[number]

const TITLE_MARKERS: Record<WorldCuisine, RegExp> = {
  Turks: /\bturk/i,
  Marokkaans: /\bmarokka/i,
  Libanees: /\blibane/i,
}

export function isWorldCuisineLabel(value: string): value is WorldCuisine {
  return (WORLD_CUISINE_OPTIONS as readonly string[]).includes(value)
}

export function detectRecipeCuisines(recipe: {
  title: string
  category?: string[] | null
}): WorldCuisine[] {
  const found = new Set<WorldCuisine>()
  for (const cat of recipe.category ?? []) {
    if (isWorldCuisineLabel(cat)) found.add(cat)
  }
  for (const cuisine of WORLD_CUISINE_OPTIONS) {
    if (TITLE_MARKERS[cuisine].test(recipe.title)) found.add(cuisine)
  }
  return [...found]
}

export function recipeHasWorldCuisine(recipe: {
  title: string
  category?: string[] | null
}): boolean {
  return detectRecipeCuisines(recipe).length > 0
}

/**
 * Default: hide world-cuisine recipes.
 * Opt-in: keep a world recipe only if it matches at least one selected cuisine.
 */
export function filterRecipesByCuisinePrefs<T extends { title: string; category?: string[] | null }>(
  recipes: T[],
  nutritionPreferences: string[] | null | undefined,
): T[] {
  const optedIn = (nutritionPreferences ?? []).filter(isWorldCuisineLabel)
  if (!optedIn.length) {
    return recipes.filter((r) => !recipeHasWorldCuisine(r))
  }
  return recipes.filter((r) => {
    const cuisines = detectRecipeCuisines(r)
    if (!cuisines.length) return true
    return cuisines.some((c) => optedIn.includes(c))
  })
}

/** Strip cuisine + meta prefs before matching recipe.category diet tags. */
export function dietPrefsForCategoryMatch(nutritionPreferences: string[] | null | undefined): string[] {
  return (nutritionPreferences ?? []).filter(
    (p) =>
      p !== "Geen voorkeur" &&
      p !== "Allergieën" &&
      p !== "Dingen die ik niet lust" &&
      !isWorldCuisineLabel(p),
  )
}
