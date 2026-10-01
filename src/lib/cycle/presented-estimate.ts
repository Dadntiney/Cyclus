import { differenceInCalendarDays, parseISO } from "date-fns"
import type { Tables } from "@/types/database"
import {
  estimateCycle,
  resolvePresentedCycleEstimate,
  type CycleEstimate,
} from "@/lib/cycle/estimate"

export type CycleProfileForPresentation = Pick<
  Tables<"cycle_profiles">,
  | "last_period_start"
  | "average_cycle_length"
  | "average_period_length"
  | "has_cycle"
  | "active_period_start"
>

/** Soft copy when the calendar says bleed could start, but she has not. */
export const PREDICTED_MENSTRUATION_NOTE =
  "Menstruatie kan rond nu komen — we gaan er pas vanuit als jij start."

export function loggedMenstruationDateSet(
  logs: ReadonlyArray<{ date: string; menstruation: boolean | null }>,
): Set<string> {
  return new Set(logs.filter((l) => l.menstruation).map((l) => l.date))
}

/**
 * One code path for Deze week, Vandaag, and recommendations: raw calendar
 * estimate, then gate predicted menstruatie until she starts or logs bleed.
 */
export function resolvePresentedForDate(
  dateISO: string,
  cycleProfile: CycleProfileForPresentation | null,
  loggedMenstruationDates?: ReadonlySet<string> | null,
): { estimate: CycleEstimate | null; predictedMenstruation: boolean } {
  if (!cycleProfile) {
    return { estimate: null, predictedMenstruation: false }
  }

  const date = new Date(`${dateISO}T12:00:00`)
  const raw = estimateCycle(
    cycleProfile.last_period_start,
    cycleProfile.average_cycle_length,
    cycleProfile.has_cycle,
    date,
    cycleProfile.average_period_length,
  )
  const estimate = resolvePresentedCycleEstimate(
    raw,
    dateISO,
    cycleProfile.active_period_start ?? null,
    cycleProfile.average_cycle_length,
    loggedMenstruationDates,
  )
  const predictedMenstruation =
    raw?.phase === "menstruatie" && estimate?.phase !== "menstruatie"

  return { estimate, predictedMenstruation }
}

/**
 * Headline for week + Vandaag.
 * Predicted bleed: no hard cyclusdag — “kan komen” until she starts.
 */
export function formatPresentedCycleHeadline(
  estimate: CycleEstimate,
  dateISO: string,
  activePeriodStart: string | null,
  predictedMenstruation = false,
): string {
  const phaseLabel = estimate.phaseLabel
  if (predictedMenstruation) {
    return `${phaseLabel} · kan komen`
  }
  if (estimate.phase === "menstruatie" && activePeriodStart && dateISO >= activePeriodStart) {
    const menstruationDay =
      differenceInCalendarDays(parseISO(dateISO), parseISO(activePeriodStart)) + 1
    return `${phaseLabel} · dag ${menstruationDay}`
  }
  return `${phaseLabel} · dag ${estimate.cycleDay}`
}
