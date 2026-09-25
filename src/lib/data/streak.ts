import { subDays } from "date-fns"

/** Consecutive days (counting back from today) with a saved check-in. */
export function computeStreak(checkinDates: string[], today: string): number {
  const dates = new Set(checkinDates)
  let streak = 0
  let cursor = new Date(today)
  // If today isn't checked in yet, that's fine — the streak still counts
  // up through yesterday so it doesn't flicker to 0 while the day is young.
  if (!dates.has(today)) {
    cursor = subDays(cursor, 1)
  }
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor = subDays(cursor, 1)
  }
  return streak
}
