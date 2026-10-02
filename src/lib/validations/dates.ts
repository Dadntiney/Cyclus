import { z } from "zod"
import { todayISO } from "@/lib/dates/amsterdam"

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** True for a real calendar date written as `yyyy-MM-dd` (rejects 2026-02-31). */
export function isValidISODate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false
  const date = new Date(`${value}T12:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

/** A real `yyyy-MM-dd` date that is not after today (Europe/Amsterdam). */
export function isPastOrTodayISODate(value: string, today: string = todayISO()): boolean {
  return isValidISODate(value) && value <= today
}

export const pastOrTodayDateSchema = z
  .string()
  .refine((value) => isPastOrTodayISODate(value), "Kies een datum die niet in de toekomst ligt.")
