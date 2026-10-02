import { syncToAccount } from "@/lib/client/account-sync"

/**
 * Household + per-recipe servings live in localStorage (same pattern as week
 * overrides / grocery checks) so grocery scaling can read them synchronously
 * on the client; account-sync.ts mirrors them to her account.
 */

export const DEFAULT_HOUSEHOLD_SERVINGS = 2
export const MIN_SERVINGS = 1
export const MAX_SERVINGS = 12

export type ServingsPrefs = {
  /** Default porties for every recipe unless overridden. */
  defaultServings: number
  /** Per-recipe override keyed by recipe id. */
  byRecipeId: Record<string, number>
}

export const SERVINGS_CHANGED_EVENT = "cyclus:servings-changed"

const EMPTY: ServingsPrefs = {
  defaultServings: DEFAULT_HOUSEHOLD_SERVINGS,
  byRecipeId: {},
}

function prefsKey(userId: string): string {
  return `cyclus:servings:${userId}`
}

function clampServings(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_HOUSEHOLD_SERVINGS
  return Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, Math.round(n)))
}

function safeParse(raw: string | null): ServingsPrefs {
  if (!raw) return { ...EMPTY, byRecipeId: {} }
  try {
    const parsed = JSON.parse(raw) as Partial<ServingsPrefs>
    const byRecipeId: Record<string, number> = {}
    if (parsed.byRecipeId && typeof parsed.byRecipeId === "object") {
      for (const [id, value] of Object.entries(parsed.byRecipeId)) {
        if (typeof value === "number") byRecipeId[id] = clampServings(value)
      }
    }
    return {
      defaultServings: clampServings(
        typeof parsed.defaultServings === "number"
          ? parsed.defaultServings
          : DEFAULT_HOUSEHOLD_SERVINGS,
      ),
      byRecipeId,
    }
  } catch {
    return { ...EMPTY, byRecipeId: {} }
  }
}

export function loadServingsPrefs(userId: string): ServingsPrefs {
  try {
    return safeParse(localStorage.getItem(prefsKey(userId)))
  } catch {
    return { ...EMPTY, byRecipeId: {} }
  }
}

export function saveServingsPrefs(userId: string, prefs: ServingsPrefs): void {
  const key = prefsKey(userId)
  const value = JSON.stringify({
    defaultServings: clampServings(prefs.defaultServings),
    byRecipeId: prefs.byRecipeId,
  })
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage unavailable — change won't persist.
  }
  syncToAccount(key, value)
  try {
    window.dispatchEvent(new Event(SERVINGS_CHANGED_EVENT))
  } catch {
    /* ignore */
  }
}

export function setDefaultServings(userId: string, servings: number): ServingsPrefs {
  const current = loadServingsPrefs(userId)
  const next = { ...current, defaultServings: clampServings(servings) }
  saveServingsPrefs(userId, next)
  return next
}

export function setRecipeServings(
  userId: string,
  recipeId: string,
  servings: number | null,
): ServingsPrefs {
  const current = loadServingsPrefs(userId)
  const byRecipeId = { ...current.byRecipeId }
  if (servings == null) {
    delete byRecipeId[recipeId]
  } else {
    byRecipeId[recipeId] = clampServings(servings)
  }
  const next = { ...current, byRecipeId }
  saveServingsPrefs(userId, next)
  return next
}

/** Recipe authoring baseline; missing servings fall back to 2. */
export function recipeBaseServings(recipeServings: number | null | undefined): number {
  if (typeof recipeServings === "number" && recipeServings > 0) {
    return clampServings(recipeServings)
  }
  return DEFAULT_HOUSEHOLD_SERVINGS
}

/**
 * Chosen porties for a recipe: per-recipe override → household default.
 * Factor scales ingredient amounts relative to the recipe’s written baseline.
 */
export function resolveRecipeServings(
  recipeId: string,
  recipeServings: number | null | undefined,
  prefs: ServingsPrefs,
): { base: number; chosen: number; factor: number } {
  const base = recipeBaseServings(recipeServings)
  const chosen = clampServings(prefs.byRecipeId[recipeId] ?? prefs.defaultServings)
  return { base, chosen, factor: chosen / base }
}
