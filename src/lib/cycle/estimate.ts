import { differenceInCalendarDays } from "date-fns"

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
  today: Date = new Date(),
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

  // Rough, conservative phase boundaries expressed as a ratio of the
  // user's own cycle length rather than fixed day counts, so estimates
  // still make sense for shorter or longer cycles.
  const menstruationLength = Math.min(7, Math.round(averageCycleLength * 0.18))
  const ovulationWindowStart = Math.round(averageCycleLength * 0.42)
  const ovulationWindowEnd = Math.round(averageCycleLength * 0.58)

  let phase: CyclePhase
  if (cycleDay <= menstruationLength) {
    phase = "menstruatie"
  } else if (cycleDay < ovulationWindowStart) {
    phase = "folliculair"
  } else if (cycleDay <= ovulationWindowEnd) {
    phase = "ovulatie"
  } else {
    phase = "luteaal"
  }

  return {
    cycleDay,
    phase,
    phaseLabel: PHASE_LABELS[phase],
    isEstimate: true,
  }
}
