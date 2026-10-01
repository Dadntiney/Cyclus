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

/** Headline for week + Vandaag — same cyclusdag rules everywhere. */
export function formatPresentedCycleHeadline(
  estimate: CycleEstimate,
  dateISO: string,
  activePeriodStart: string | null,
): string {
  const phaseLabel = estimate.phaseLabel
  if (estimate.phase === "menstruatie" && activePeriodStart && dateISO >= activePeriodStart) {
    const menstruationDay =
      differenceInCalendarDays(parseISO(dateISO), parseISO(activePeriodStart)) + 1
    return `${phaseLabel} · dag ${menstruationDay}`
  }
  return `${phaseLabel} · dag ${estimate.cycleDay}`
}
