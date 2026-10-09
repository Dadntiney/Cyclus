"use client"

import { useSyncExternalStore } from "react"

/** How she follows a guided exercise; remembered for the next one. */
export type ExerciseMode = "lezen" | "luisteren"

export const EXERCISE_MODE_KEY = "gofiev:oefening-modus"

export const EXERCISE_MODE_OPTIONS = [
  { value: "lezen", label: "Lezen" },
  { value: "luisteren", label: "Luisteren" },
] as const satisfies readonly { value: ExerciseMode; label: string }[]

/** Anything unknown (or nothing) reads as the calm default, Lezen. */
export function parseExerciseMode(value: string | null | undefined): ExerciseMode {
  return value === "luisteren" ? "luisteren" : "lezen"
}

const listeners = new Set<() => void>()
// Kept in memory too, so a blocked localStorage (private mode) still
// remembers the choice for this visit.
let current: ExerciseMode | null = null

function getSnapshot(): ExerciseMode {
  if (current === null) {
    try {
      current = parseExerciseMode(window.localStorage.getItem(EXERCISE_MODE_KEY))
    } catch {
      current = "lezen"
    }
  }
  return current
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setExerciseMode(mode: ExerciseMode) {
  current = mode
  try {
    window.localStorage.setItem(EXERCISE_MODE_KEY, mode)
  } catch {
    // Storage blocked: the in-memory choice still holds for this visit.
  }
  listeners.forEach((listener) => listener())
}

/** The last used mode; Lezen on the server and in the first client render. */
export function useExerciseMode(): ExerciseMode {
  return useSyncExternalStore(subscribe, getSnapshot, () => "lezen")
}
