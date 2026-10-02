"use client"

import { syncToAccount } from "@/lib/client/account-sync"

/**
 * The week plan itself is computed server-side (deterministic, like the
 * rest of the recommendation engine) rather than stored in the database —
 * see `buildWeekPlan`. But the user should still be able to adjust it
 * ("dit vervang ik", "deze workout sla ik over") without us standing up a
 * new database table per kind of adjustment. We keep those adjustments —
 * and the grocery checklist — in localStorage, scoped per signed-in user and
 * per ISO week, and mirror them to the account (see account-sync.ts) so they
 * also show up on her other devices.
 * Every accessor is wrapped in try/catch: storage can throw or be
 * unavailable (private browsing, blocked site data), and the plan must
 * still render correctly without it.
 */

export type MealSlotKey = "ontbijt" | "lunch" | "diner"

export type DayOverride =
  | { type: "skip-workout" }
  | { type: "swap-workout"; workoutId: string; title: string; duration: number }
  | { type: "skip-meal"; slot: MealSlotKey }
  | { type: "swap-meal"; slot: MealSlotKey; recipeId: string; title: string }
  | { type: "custom-meal"; slot: MealSlotKey; text: string }

export interface WeekOverrides {
  /** `${date}:${key}` -> override, where key is "workout" or the meal slot. */
  [entryKey: string]: DayOverride
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function overridesKey(userId: string, weekStartISO: string): string {
  return `cyclus:week-overrides:${userId}:${weekStartISO}`
}

export function loadWeekOverrides(userId: string, weekStartISO: string): WeekOverrides {
  try {
    return safeParse(localStorage.getItem(overridesKey(userId, weekStartISO)), {})
  } catch {
    return {}
  }
}

export function saveWeekOverrides(userId: string, weekStartISO: string, overrides: WeekOverrides): void {
  const key = overridesKey(userId, weekStartISO)
  const value = JSON.stringify(overrides)
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage unavailable — the change simply won't persist across reloads.
  }
  syncToAccount(key, value)
}

export const WEEK_OVERRIDES_CHANGED_EVENT = "cyclus:week-overrides-changed"

export function setDayOverride(
  userId: string,
  weekStartISO: string,
  date: string,
  key: string,
  override: DayOverride | null,
): WeekOverrides {
  const current = loadWeekOverrides(userId, weekStartISO)
  const entryKey = `${date}:${key}`
  const next = { ...current }
  if (override) {
    next[entryKey] = override
  } else {
    delete next[entryKey]
  }
  saveWeekOverrides(userId, weekStartISO, next)
  try {
    window.dispatchEvent(new Event(WEEK_OVERRIDES_CHANGED_EVENT))
  } catch {
    /* ignore — non-browser / unavailable */
  }
  return next
}

function groceryKey(userId: string, weekStartISO: string): string {
  return `cyclus:grocery-checked:${userId}:${weekStartISO}`
}

export function loadCheckedGroceryIds(userId: string, weekStartISO: string): Set<string> {
  try {
    const ids = safeParse<string[]>(localStorage.getItem(groceryKey(userId, weekStartISO)), [])
    return new Set(ids)
  } catch {
    return new Set()
  }
}

export function saveCheckedGroceryIds(userId: string, weekStartISO: string, ids: Set<string>): void {
  const key = groceryKey(userId, weekStartISO)
  const value = JSON.stringify([...ids])
  try {
    localStorage.setItem(key, value)
  } catch {
    // Ignore — checklist state just won't persist across reloads.
  }
  syncToAccount(key, value)
}
