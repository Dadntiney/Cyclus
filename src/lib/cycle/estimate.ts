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
