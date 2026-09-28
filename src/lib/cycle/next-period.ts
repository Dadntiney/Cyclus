import { addDays, differenceInCalendarDays, format } from "date-fns"
import type { CycleHistoryEntry } from "@/lib/cycle/history"

export type PeriodEstimateConfidence = "laag" | "middel" | "hoog"

export interface NextPeriodEstimate {
  /** Inclusive ISO date of the estimated next period start. */
  estimatedStart: string
  /** Days from today until estimatedStart (0 = today, negative = overdue vs estimate). */
  daysUntil: number
  confidence: PeriodEstimateConfidence
  /** Half-width of the uncertainty window in days (±window). */
  windowDays: number
  windowStart: string
  windowEnd: string
  basedOnCycles: number
  isIrregularFriendly: boolean
}

/**
 * Estimates the next period start from the last known start + average length,
 * optionally refined by recent completed cycle lengths. Always returns an
 * uncertainty window — especially important when cycles are changing —
 * and never claims medical precision.
 */
export function estimateNextPeriod(input: {
  lastPeriodStart: string | null
  averageCycleLength: number | null
  hasCycle: boolean
  regularity?: string | null
  lifeStage?: string | null
  history?: CycleHistoryEntry[]
  today?: Date
}): NextPeriodEstimate | null {
  const {
    lastPeriodStart,
    averageCycleLength,
    hasCycle,
    regularity = null,
    lifeStage = null,
    history = [],
    today = new Date(),
  } = input

  if (!hasCycle || !lastPeriodStart || !averageCycleLength) return null
  if (lifeStage === "menopauze") return null

  const completedLengths = history
    .filter((p): p is CycleHistoryEntry & { cycleLength: number } => p.cycleLength !== null)
    .slice(-6)
    .map((p) => p.cycleLength)

  const recentMean =
    completedLengths.length >= 2
      ? Math.round(completedLengths.reduce((a, b) => a + b, 0) / completedLengths.length)
      : averageCycleLength

  const cycleLength = Math.min(60, Math.max(15, recentMean))
  const start = new Date(`${lastPeriodStart}T12:00:00`)
  const daysSince = differenceInCalendarDays(today, start)
  if (daysSince < 0) return null

  const cyclesElapsed = Math.floor(daysSince / cycleLength)
  const nextStart = addDays(start, (cyclesElapsed + 1) * cycleLength)
  const estimatedStart = format(nextStart, "yyyy-MM-dd")
  const daysUntil = differenceInCalendarDays(nextStart, today)

  const swing =
    completedLengths.length >= 3
      ? averageAbsoluteSwing(completedLengths)
      : regularity === "onregelmatig" || lifeStage === "veranderend" || lifeStage === "perimenopauze"
        ? 5
        : 2

  const irregularFriendly =
    regularity === "onregelmatig" ||
    lifeStage === "veranderend" ||
    lifeStage === "perimenopauze" ||
    swing >= 4

  let confidence: PeriodEstimateConfidence = "hoog"
  let windowDays = 2
  if (irregularFriendly || completedLengths.length < 2) {
    confidence = "laag"
    windowDays = Math.min(7, Math.max(3, Math.round(swing + 1)))
  } else if (swing >= 2.5 || completedLengths.length < 4) {
    confidence = "middel"
    windowDays = Math.min(5, Math.max(2, Math.round(swing)))
  }

  return {
    estimatedStart,
    daysUntil,
    confidence,
    windowDays,
    windowStart: format(addDays(nextStart, -windowDays), "yyyy-MM-dd"),
    windowEnd: format(addDays(nextStart, windowDays), "yyyy-MM-dd"),
    basedOnCycles: completedLengths.length,
    isIrregularFriendly: irregularFriendly,
  }
}

function averageAbsoluteSwing(lengths: number[]): number {
  if (lengths.length < 2) return 0
  let total = 0
  for (let i = 1; i < lengths.length; i++) {
    total += Math.abs(lengths[i] - lengths[i - 1])
  }
  return total / (lengths.length - 1)
}

export function formatNextPeriodEstimate(estimate: NextPeriodEstimate): string {
  const when =
    estimate.daysUntil === 0
      ? "Rond vandaag"
      : estimate.daysUntil > 0
        ? `Over ±${estimate.daysUntil} dag${estimate.daysUntil === 1 ? "" : "en"}`
        : `±${Math.abs(estimate.daysUntil)} dag${Math.abs(estimate.daysUntil) === 1 ? "" : "en"} geleden`

  const confidenceLabel =
    estimate.confidence === "hoog"
      ? "Redelijk zeker"
      : estimate.confidence === "middel"
        ? "Voorzichtige schatting"
        : "Ruime schatting"

  return `${when} · venster ±${estimate.windowDays} d · ${confidenceLabel.toLowerCase()}`
}
