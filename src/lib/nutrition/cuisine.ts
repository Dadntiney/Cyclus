/**
 * World-cuisine recipes are optional — not part of the default suggestion
 * pool. Users opt in via nutrition preferences (cuisine chips) or by
 * picking a cuisine filter in the recipe library.
 *
 * Markers are title-based and deliberately strict (e.g. “Griekse yoghurt”
 * must NOT count as Griekse wereldkeuken).
 */

export const WORLD_CUISINE_OPTIONS = [
  "Turks",
  "Marokkaans",
  "Libanees",
  "Grieks",
  "Italiaans",
  "Spaans",
  "Portugees",
  "Frans",
  "Japans",
  "Koreaans",
  "Thais",
  "Vietnamees",
  "Indisch",
  "Indonesisch",
  "Mexicaans",
  "Peruaans",
  "Braziliaans",
  "Caribisch",
  "Ethiopisch",
  "Perzisch",
  "West-Afrikaans",
  "Hongaars",
  "Scandinavisch",
] as const

export type WorldCuisine = (typeof WORLD_CUISINE_OPTIONS)[number]

/** @deprecated Prefer WORLD_CUISINE_OPTIONS — kept as alias for existing imports. */
export const CUISINE_OPTIONS = WORLD_CUISINE_OPTIONS

const TITLE_MARKERS: Record<WorldCuisine, RegExp> = {
  Turks: /\bturk(?:s|se)?\b|menemen|mücver|mercimek|\bmezze\b/i,
  Marokkaans: /\bmarokka|\btajine\b|\bharira\b/i,
  Libanees: /\blibane|\btabouleh\b|adas bi hamod|\bmujadara\b/i,
  // Negative lookahead: “Griekse yoghurt …” stays in the default pool.
  Grieks: /\bgriek(?:s|se)?\b(?!\s+yoghurt)|horiatiki|\bfakes\b|\bmoussaka\b/i,
  Italiaans:
    /\bitalia|\bcaprese\b|\bpanzanella\b|pasta e ceci|\btoscaanse\b|\brisotto\b|pasta primavera|spaghetti aglio/i,
  Spaans: /\bspaans|\bgazpacho\b|\bpaella\b|aardappel-tortilla/i,
  Portugees: /\bportuge|\bbacalhau\b|\bsardines\b|sopa de grão/i,
  Frans: /\bfranse?\b|\bratatouille\b|ni[cç]oise/i,
  Japans: /\bjapan|\bgyudon\b|\bmiso|\btamago|\bteriyaki\b|\bedamame\b/i,
  Koreaans: /\bkorea|\bbibim|\bkimchi|\bdak-doritang|\bmiyeok/i,
  Thais: /\bthai|\bsom tam\b/i,
  Vietnamees: /\bvietnam|\bpho\b/i,
  Indisch: /\bindisch|\bdal makhani\b|\bpalak paneer\b|\bdhal\b/i,
  Indonesisch: /\bindones|\bnasi goreng\b|\bgado-gado\b/i,
  Mexicaans: /\bmexica|\btacos\b|\benchilada|\bchili con carne\b/i,
  Peruaans: /\bperua|\bceviche\b/i,
  Braziliaans: /\bbrazil|\baçaí\b|\bacai\b/i,
  Caribisch: /\bcaribisch|rice and peas/i,
  Ethiopisch: /\bethiop|\bmisir wot\b/i,
  Perzisch: /\bperzisch|\bfesenjan\b/i,
  "West-Afrikaans": /\bwest-afrika|\bpindastoof\b/i,
  Hongaars: /\bhongaar|\bgoulash\b/i,
  Scandinavisch: /\bscandinav|\bzweedse?\b/i,
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
