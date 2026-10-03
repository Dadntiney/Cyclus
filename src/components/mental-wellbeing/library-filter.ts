import type { MentalWellbeingCategory } from "@/lib/constants"
import type { MindfulExercise } from "@/lib/data/mindful-exercises"

/** The time chips: at most this many minutes. One at a time. */
export const TIME_LIMITS = [
  { value: 3, label: "Max. 3 min" },
  { value: 10, label: "Max. 10 min" },
] as const

export type TimeLimit = (typeof TIME_LIMITS)[number]["value"]

/** How many exercises show before "Alle n oefeningen". */
export const FIRST_EXERCISES = 6

export interface LibraryFilter {
  maxMinutes: TimeLimit | null
  topics: readonly MentalWellbeingCategory[]
}

/**
 * Time AND topic: within the time limit, and (when she picked topics) about
 * at least one of them. No filter = everything.
 */
export function filterExercises(exercises: readonly MindfulExercise[], filter: LibraryFilter): MindfulExercise[] {
  return exercises.filter(
    (e) =>
      (filter.maxMinutes == null || e.durationMinutes <= filter.maxMinutes) &&
      (!filter.topics.length || e.categories.some((c) => filter.topics.includes(c))),
  )
}

/** Evening (20:00 to 05:00) leans towards avondrust. */
export function isEvening(hour: number) {
  return hour >= 20 || hour < 5
}

/**
 * One suggestion "voor nu": her own topics (in the evening with avondrust
 * added), the shortest of those, so starting is easy. Without a match the
 * shortest exercise overall.
 */
export function pickForNow(
  exercises: readonly MindfulExercise[],
  preferred: readonly MentalWellbeingCategory[],
  hour: number,
): MindfulExercise | null {
  const wanted: MentalWellbeingCategory[] = isEvening(hour) ? ["slaap", ...preferred] : [...preferred]
  const pool = exercises.filter((e) => e.categories.some((c) => wanted.includes(c)))
  const sorted = [...(pool.length ? pool : exercises)].sort((a, b) => a.durationMinutes - b.durationMinutes)
  return sorted[0] ?? null
}
