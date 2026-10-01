import { differenceInCalendarDays } from "date-fns"
import { todayDate } from "@/lib/dates/amsterdam"

export type CyclePhase = "menstruatie" | "folliculair" | "ovulatie" | "luteaal"

export interface CycleEstimate {
  cycleDay: number
  phase: CyclePhase
  phaseLabel: string
  isEstimate: true
}

const PHASE_LABELS: Record<CyclePhase, string> = {
  menstruatie: "Menstruatie",
  folliculair: "Folliculaire fase",
  ovulatie: "Ovulatie",
  luteaal: "Luteale fase",
}

export function phaseLabel(phase: CyclePhase): string {
  return PHASE_LABELS[phase]
}

/**
 * Classifies a cycle day into a phase, using rough, conservative phase
 * boundaries expressed as a ratio of the cycle length rather than fixed day
 * counts, so it still makes sense for shorter or longer cycles. Pure and
 * exported so `estimateCycle` (today) and the historical pattern analysis
 * in cycle/patterns.ts (past cycles) classify phases identically.
 */
export function classifyPhase(
  cycleDay: number,
  cycleLength: number,
  menstruationLength?: number | null,
): CyclePhase {
  const bleedDays =
    menstruationLength != null && menstruationLength >= 2 && menstruationLength <= 14
      ? Math.round(menstruationLength)
      : Math.min(7, Math.round(cycleLength * 0.18))
  const ovulationWindowStart = Math.round(cycleLength * 0.42)
  const ovulationWindowEnd = Math.round(cycleLength * 0.58)

  if (cycleDay <= bleedDays) return "menstruatie"
  if (cycleDay < ovulationWindowStart) return "folliculair"
  if (cycleDay <= ovulationWindowEnd) return "ovulatie"
  return "luteaal"
}

/**
 * Estimates the current cycle day and phase from the last known period
 * start date and the user's average cycle length. Never assumes a default
 * 28-day cycle — both inputs must come from what the user actually told us.
 * Returns null when there isn't enough data to make a reasonable estimate,
 * e.g. no last period date, or the user doesn't currently have a cycle.
 */
export function estimateCycle(
  lastPeriodStart: string | null,
  averageCycleLength: number | null,
  hasCycle: boolean,
  today: Date = todayDate(),
  averagePeriodLength?: number | null,
): CycleEstimate | null {
  if (!hasCycle || !lastPeriodStart || !averageCycleLength) {
    return null
  }

  const start = new Date(lastPeriodStart)
  const daysSinceStart = differenceInCalendarDays(today, start)

  if (daysSinceStart < 0) {
    return null
  }

  const cycleDay = (daysSinceStart % averageCycleLength) + 1
  const phase = classifyPhase(cycleDay, averageCycleLength, averagePeriodLength)

  return {
    cycleDay,
    phase,
    phaseLabel: PHASE_LABELS[phase],
    isEstimate: true,
  }
}

/**
 * Calendar math may land on menstruatie day 1 before she has actually
 * started. Soft planning may still tilt gently; presentation must not
 * claim menstruatie until she starts (`active_period_start`) or that
 * date is already logged as bleed.
 */
export function isMenstruationConfirmedForDate(
  dateISO: string,
  activePeriodStart: string | null,
  loggedMenstruationDates?: ReadonlySet<string> | null,
): boolean {
  if (loggedMenstruationDates?.has(dateISO)) return true
  if (activePeriodStart && dateISO >= activePeriodStart) return true
  return false
}

/**
 * Turns a raw estimate into what we show / plan as the day's phase.
 * Predicted menstruatie without an active start becomes late luteaal —
 * still an estimate, never "menstruatiedag N".
 */
export function resolvePresentedCycleEstimate(
  estimate: CycleEstimate | null,
  dateISO: string,
  activePeriodStart: string | null,
  averageCycleLength?: number | null,
  loggedMenstruationDates?: ReadonlySet<string> | null,
): CycleEstimate | null {
  if (!estimate) return null
  if (estimate.phase !== "menstruatie") return estimate
  if (isMenstruationConfirmedForDate(dateISO, activePeriodStart, loggedMenstruationDates)) {
    return estimate
  }

  const cycleLength =
    averageCycleLength != null && averageCycleLength >= 21 && averageCycleLength <= 45
      ? averageCycleLength
      : 28

  return {
    // End of cycle — waiting for her to start, not day 1 of a bleed.
    cycleDay: cycleLength,
    phase: "luteaal",
    phaseLabel: PHASE_LABELS.luteaal,
    isEstimate: true,
  }
}
