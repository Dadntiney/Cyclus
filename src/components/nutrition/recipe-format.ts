import type { RecipeCardData } from "@/lib/data/nutrition"

/**
 * Display helpers shared by the recipe card, the recipe page and the
 * library: one way to write time, meta and nutrition values everywhere.
 */

export const MEAL_MOMENTS = ["Ontbijt", "Lunch", "Diner", "Snack"] as const
export type MealMoment = (typeof MEAL_MOMENTS)[number]

/** The one Favorieten page with recipes shown (header action, toast "Bekijk"). */
export const RECIPE_FAVORITES_HREF = "/favorieten?soort=recepten"

/** The single label for budget recipes (cards, detail and filters). */
export const BUDGET_LABEL = "Budget"

export const DIFFICULTY_LABELS: Record<string, string> = {
  makkelijk: "Makkelijk",
  gemiddeld: "Gemiddeld",
  pittig: "Uitdagend",
}

/** "25 min", "1 uur", "2½ uur", "1 uur 15 min". */
export function formatPrepTime(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return ""
  const total = Math.round(minutes)
  if (total < 60) return `${total} min`
  const hours = Math.floor(total / 60)
  const rest = total % 60
  if (rest === 0) return `${hours} uur`
  if (rest === 30) return `${hours}½ uur`
  return `${hours} uur ${rest} min`
}

/**
 * The one category a card names: the meal moment when there is one,
 * otherwise the first category ("Snel" is said by the time already).
 */
export function primaryCategory(categories: readonly string[] | null | undefined): string | null {
  const list = categories ?? []
  return (
    list.find((c) => (MEAL_MOMENTS as readonly string[]).includes(c)) ??
    list.find((c) => c !== "Snel") ??
    null
  )
}

/** One quiet meta line: "25 min · Ontbijt · Budget". */
export function recipeMetaLine(
  recipe: Pick<RecipeCardData, "preparation_time" | "category" | "is_budget">,
): string {
  return [
    recipe.preparation_time ? formatPrepTime(recipe.preparation_time) : null,
    primaryCategory(recipe.category),
    recipe.is_budget ? BUDGET_LABEL : null,
  ]
    .filter(Boolean)
    .join(" · ")
}

/** Stored keys are plain ASCII ("calorieen"); show proper Dutch. */
const NUTRITION_FIELDS: Record<string, { label: string; unit: string }> = {
  calorieen: { label: "Energie", unit: "kcal" },
  eiwit: { label: "Eiwit", unit: "g" },
  koolhydraten: { label: "Koolhydraten", unit: "g" },
  vet: { label: "Vet", unit: "g" },
}

const NUTRITION_ORDER = Object.keys(NUTRITION_FIELDS)

function fieldOf(key: string) {
  return Object.prototype.hasOwnProperty.call(NUTRITION_FIELDS, key) ? NUTRITION_FIELDS[key] : undefined
}

export interface NutritionStat {
  key: string
  label: string
  value: string
}

const NBSP = String.fromCharCode(0xa0)

/**
 * "42g" → "42 g", 520 → "520 kcal": a space between number and unit that
 * never wraps, so "Koolhydraten42g" can never happen again.
 */
export function formatNutritionValue(key: string, value: string | number): string {
  const text = String(value).trim()
  const field = fieldOf(key)
  if (/^\d+([.,]\d+)?$/.test(text)) return field ? `${text}${NBSP}${field.unit}` : text
  const withUnit = text.match(/^(\d+(?:[.,]\d+)?)\s*([A-Za-z]+)$/)
  if (withUnit) return `${withUnit[1]}${NBSP}${withUnit[2]}`
  return text
}

/** Energie, Eiwit, Koolhydraten, Vet first; anything else after, as stored. */
export function nutritionStats(info: unknown): NutritionStat[] {
  if (!info || typeof info !== "object" || Array.isArray(info)) return []
  return Object.entries(info as Record<string, unknown>)
    .filter((entry): entry is [string, string | number] => {
      const v = entry[1]
      return (typeof v === "string" && v.trim() !== "") || (typeof v === "number" && Number.isFinite(v))
    })
    .sort(([a], [b]) => orderOf(a) - orderOf(b))
    .map(([key, value]) => ({
      key,
      label: fieldOf(key)?.label ?? key.charAt(0).toUpperCase() + key.slice(1),
      value: formatNutritionValue(key, value),
    }))
}

function orderOf(key: string): number {
  const i = NUTRITION_ORDER.indexOf(key)
  return i === -1 ? NUTRITION_ORDER.length : i
}
