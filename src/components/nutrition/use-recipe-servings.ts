"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"
import { ACCOUNT_STATE_APPLIED_EVENT } from "@/lib/client/account-sync"
import {
  loadServingsPrefs,
  recipeBaseServings,
  resolveRecipeServings,
  setRecipeServings,
  SERVINGS_CHANGED_EVENT,
  type ServingsPrefs,
} from "@/lib/client/servings-storage"

function subscribe(onChange: () => void) {
  window.addEventListener(SERVINGS_CHANGED_EVENT, onChange)
  window.addEventListener(ACCOUNT_STATE_APPLIED_EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(SERVINGS_CHANGED_EVENT, onChange)
    window.removeEventListener(ACCOUNT_STATE_APPLIED_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

/**
 * The porties she cooks a recipe for: per-recipe choice → household
 * default (shared with Boodschappen), stored on this device and synced to
 * her account. One source for the meta line and the ingredients card, so
 * the two can never disagree (NUT-5). Before the stored value is read
 * (server render) it is the recipe's own number.
 */
export function useRecipeServings(userId: string, recipeId: string, recipeServings: number | null) {
  // A string snapshot: stable between reads, so React only re-renders on a real change.
  const snapshot = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(loadServingsPrefs(userId)),
    () => null,
  )
  const prefs = useMemo<ServingsPrefs | null>(() => (snapshot ? (JSON.parse(snapshot) as ServingsPrefs) : null), [snapshot])

  const base = recipeBaseServings(recipeServings)
  const resolved = prefs ? resolveRecipeServings(recipeId, recipeServings, prefs) : { base, chosen: base, factor: 1 }

  const setChosen = useCallback(
    (next: number) => {
      // The household default needs no per-recipe override (as before).
      const current = loadServingsPrefs(userId)
      setRecipeServings(userId, recipeId, next === current.defaultServings ? null : next)
    },
    [userId, recipeId],
  )

  return { ...resolved, setChosen }
}
