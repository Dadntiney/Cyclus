import type { RecipeCardData } from "@/lib/data/nutrition"
import { CUISINE_OPTIONS, detectRecipeCuisines, recipeHasWorldCuisine, type WorldCuisine } from "@/lib/nutrition/cuisine"
import { BUDGET_LABEL, MEAL_MOMENTS, type MealMoment } from "./recipe-format"

/**
 * The recipe library's filter model (ontwerpvisie §7.4, NUT-2/3/18):
 * - one meal moment (or all of them),
 * - wishes that must all hold (Vegetarisch AND Budget …),
 * - a maximum time (≤ 15/30/45 min),
 * - world cuisines, any of them (Grieks OR Thais).
 * Pure functions, so the count, the grid and the URL always agree.
 */

export const WISHES = [BUDGET_LABEL, "Koolhydraatarm", "Eiwitrijk", "Vegetarisch", "Veganistisch", "Voorbereiden"] as const
export type Wish = (typeof WISHES)[number]

export const TIME_LIMITS = [15, 30, 45] as const
export type TimeLimit = (typeof TIME_LIMITS)[number]

export interface RecipeFilters {
  meal: MealMoment | null
  wishes: Wish[]
  maxTime: TimeLimit | null
  cuisines: WorldCuisine[]
}

export const NO_FILTERS: RecipeFilters = { meal: null, wishes: [], maxTime: null, cuisines: [] }

/** Low carb = at most 20 g carbohydrates per portion (as before). */
export function isLowCarb(recipe: Pick<RecipeCardData, "nutrition_information">): boolean {
  const value = recipe.nutrition_information
  if (!value || typeof value !== "object" || Array.isArray(value)) return false
  const carbs = (value as Record<string, unknown>).koolhydraten
  if (typeof carbs === "number") return carbs <= 20
  if (typeof carbs !== "string") return false
  const match = carbs.match(/\d+(?:[.,]\d+)?/)
  return match ? Number(match[0].replace(",", ".")) <= 20 : false
}

function hasWish(recipe: RecipeCardData, wish: Wish): boolean {
  if (wish === BUDGET_LABEL) return Boolean(recipe.is_budget)
  if (wish === "Koolhydraatarm") return isLowCarb(recipe)
  return recipe.category.includes(wish)
}

export function matchesFilters(recipe: RecipeCardData, filters: RecipeFilters): boolean {
  if (filters.meal && !recipe.category.includes(filters.meal)) return false
  if (!filters.wishes.every((wish) => hasWish(recipe, wish))) return false
  if (filters.maxTime !== null) {
    if (recipe.preparation_time === null || recipe.preparation_time > filters.maxTime) return false
  }
  if (filters.cuisines.length) {
    const cuisines = detectRecipeCuisines(recipe)
    if (!filters.cuisines.some((c) => cuisines.includes(c))) return false
  }
  return true
}

/**
 * "Alles" is really all: the everyday recipes first (in their A–Z order),
 * then the world cuisines.
 */
export function orderRecipes<T extends RecipeCardData>(recipes: readonly T[]): T[] {
  const everyday: T[] = []
  const world: T[] = []
  for (const recipe of recipes) (recipeHasWorldCuisine(recipe) ? world : everyday).push(recipe)
  return [...everyday, ...world]
}

/** The filters from the bottom sheet that are on (the meal moment has its own row). */
export function sheetFilterCount(filters: RecipeFilters): number {
  return filters.wishes.length + (filters.maxTime === null ? 0 : 1) + filters.cuisines.length
}

export type ActiveFilter =
  | { kind: "wish"; value: Wish; label: string }
  | { kind: "time"; value: TimeLimit; label: string }
  | { kind: "cuisine"; value: WorldCuisine; label: string }

export function timeLimitLabel(limit: TimeLimit): string {
  return `Max. ${limit} min`
}

/** Every sheet filter that is on, as removable chips in the count row. */
export function activeSheetFilters(filters: RecipeFilters): ActiveFilter[] {
  return [
    ...filters.wishes.map((value) => ({ kind: "wish" as const, value, label: value })),
    ...(filters.maxTime === null
      ? []
      : [{ kind: "time" as const, value: filters.maxTime, label: timeLimitLabel(filters.maxTime) }]),
    ...filters.cuisines.map((value) => ({ kind: "cuisine" as const, value, label: value })),
  ]
}

export function removeFilter(filters: RecipeFilters, filter: ActiveFilter): RecipeFilters {
  switch (filter.kind) {
    case "wish":
      return { ...filters, wishes: filters.wishes.filter((w) => w !== filter.value) }
    case "time":
      return { ...filters, maxTime: null }
    case "cuisine":
      return { ...filters, cuisines: filters.cuisines.filter((c) => c !== filter.value) }
  }
}

export function toggleInList<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

// --- URL (?moment=diner&wens=vegetarisch,budget&tijd=30&keuken=grieks) ----

const slug = (value: string) => value.toLowerCase()

function fromSlugs<T extends string>(raw: string | null, options: readonly T[]): T[] {
  if (!raw) return []
  const wanted = new Set(raw.split(",").map((part) => part.trim().toLowerCase()))
  // Keep the options' own order, so the URL and the chips never disagree.
  return options.filter((option) => wanted.has(slug(option)))
}

/** Read filters from the URL; anything unknown is ignored. */
export function parseRecipeFilters(params: { get(name: string): string | null }): RecipeFilters {
  const meal = MEAL_MOMENTS.find((m) => slug(m) === params.get("moment")?.toLowerCase()) ?? null
  const time = Number(params.get("tijd"))
  return {
    meal,
    wishes: fromSlugs(params.get("wens"), WISHES),
    maxTime: (TIME_LIMITS as readonly number[]).includes(time) ? (time as TimeLimit) : null,
    cuisines: fromSlugs(params.get("keuken"), CUISINE_OPTIONS),
  }
}

/** The query string for these filters ("" when nothing is on). */
export function recipeFiltersQuery(filters: RecipeFilters): string {
  const params = new URLSearchParams()
  if (filters.meal) params.set("moment", slug(filters.meal))
  if (filters.wishes.length) params.set("wens", WISHES.filter((w) => filters.wishes.includes(w)).map(slug).join(","))
  if (filters.maxTime !== null) params.set("tijd", String(filters.maxTime))
  if (filters.cuisines.length) {
    params.set("keuken", CUISINE_OPTIONS.filter((c) => filters.cuisines.includes(c)).map(slug).join(","))
  }
  const query = params.toString()
  return query ? `?${query}` : ""
}
