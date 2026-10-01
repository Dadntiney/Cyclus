import { differenceInCalendarDays, parseISO } from "date-fns"
import type { Tables } from "@/types/database"
import {
  estimateCycle,
  resolvePresentedCycleEstimate,
  type CycleEstimate,
} from "@/lib/cycle/estimate"
import { todayISO as amsterdamTodayISO } from "@/lib/dates/amsterdam"

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

/** After stoppen: today may still be logged, but Bezig is off. */
export const ENDED_MENSTRUATION_NOTE =
  "Je hebt gestopt. Start opnieuw wanneer het weer begint."

export type MenstruationSoftHint = "predicted" | "ended" | null

export function loggedMenstruationDateSet(
  logs: ReadonlyArray<{ date: string; menstruation: boolean | null }>,
): Set<string> {
  return new Set(logs.filter((l) => l.menstruation).map((l) => l.date))
}

/**
 * One code path for Deze week, Vandaag, and recommendations: raw calendar
 * estimate, then gate menstruatie until she is Bezig (active start).
 */
export function resolvePresentedForDate(
  dateISO: string,
  cycleProfile: CycleProfileForPresentation | null,
  loggedMenstruationDates?: ReadonlySet<string> | null,
): {
  estimate: CycleEstimate | null
  predictedMenstruation: boolean
  menstruationSoftHint: MenstruationSoftHint
} {
  if (!cycleProfile) {
    return { estimate: null, predictedMenstruation: false, menstruationSoftHint: null }
  }

  const today = amsterdamTodayISO()
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
    today,
  )

  const softUnconfirmed =
    raw?.phase === "menstruatie" && estimate?.phase !== "menstruatie"
  const menstruationSoftHint: MenstruationSoftHint = !softUnconfirmed
    ? null
    : loggedMenstruationDates?.has(dateISO)
      ? "ended"
      : "predicted"

  return {
    estimate,
    // Keep flag for existing week/UI soft mode (no hard day digit).
    predictedMenstruation: softUnconfirmed,
    menstruationSoftHint,
  }
}

export function softMenstruationNote(hint: MenstruationSoftHint): string | null {
  if (hint === "ended") return ENDED_MENSTRUATION_NOTE
  if (hint === "predicted") return PREDICTED_MENSTRUATION_NOTE
  return null
}

/**
 * Headline for week + Vandaag.
 * Soft bleed states: no hard cyclusdag — “kan komen” / ended copy instead.
 */
export function formatPresentedCycleHeadline(
  estimate: CycleEstimate,
  dateISO: string,
  activePeriodStart: string | null,
  predictedMenstruation = false,
  menstruationSoftHint: MenstruationSoftHint = null,
): string {
  const phaseLabel = estimate.phaseLabel
  const hint = menstruationSoftHint ?? (predictedMenstruation ? "predicted" : null)
  if (hint === "ended") {
    return `${phaseLabel}`
  }
  if (hint === "predicted") {
    return `${phaseLabel} · kan komen`
  }
  if (estimate.phase === "menstruatie" && activePeriodStart && dateISO >= activePeriodStart) {
    const menstruationDay =
      differenceInCalendarDays(parseISO(dateISO), parseISO(activePeriodStart)) + 1
    return `${phaseLabel} · dag ${menstruationDay}`
  }
  return `${phaseLabel} · dag ${estimate.cycleDay}`
}
