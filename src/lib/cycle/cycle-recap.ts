import { addDays, differenceInCalendarDays, parseISO } from "date-fns"
import { classifyPhase, type CyclePhase } from "@/lib/cycle/estimate"
import type { CycleHistoryEntry } from "@/lib/cycle/history"
import { symptomLabel } from "@/lib/constants"
import { formatDateRange } from "@/lib/dates/format"

/**
 * Makes the payoff of tracking visible on the Cyclus hub:
 *
 * - `composeInsightProgress`: before any personal pattern exists, show how
 *   close she is to her first one ("nog 1 cyclus, nog 6 check-ins"), so the
 *   daily check-in has a visible purpose from day one.
 * - `composeCycleRecap`: after each completed cycle, a short look back —
 *   how long it was, what she noted most, when she felt most energetic.
 *
 * Both only describe what she logged; no predictions, no diagnosis.
 */

export const PATTERN_MIN_CYCLES = 2
export const PATTERN_TARGET_CHECKINS = 10

export interface RecapCheckin {
  date: string
  energy?: number | null
  symptoms?: string[] | null
}

export interface InsightProgress {
  title: string
  body: string
  steps: { label: string; done: number; total: number }[]
}

export function composeInsightProgress(input: {
  hasCycle: boolean
  completedCycles: number
  checkinCount: number
  /** A real personal pattern is already shown — then no progress card. */
  hasPersonalPattern: boolean
}): InsightProgress | null {
  const { hasCycle, completedCycles, checkinCount, hasPersonalPattern } = input
  if (hasPersonalPattern) return null

  const cyclesDone = Math.min(completedCycles, PATTERN_MIN_CYCLES)
  const checkinsDone = Math.min(checkinCount, PATTERN_TARGET_CHECKINS)
  const cyclesReady = !hasCycle || cyclesDone >= PATTERN_MIN_CYCLES
  const checkinsReady = checkinsDone >= PATTERN_TARGET_CHECKINS
  if (cyclesReady && checkinsReady) return null

  const steps: InsightProgress["steps"] = []
  if (hasCycle) {
    steps.push({ label: "Afgeronde cycli", done: cyclesDone, total: PATTERN_MIN_CYCLES })
  }
  steps.push({ label: "Check-ins", done: checkinsDone, total: PATTERN_TARGET_CHECKINS })

  const body = hasCycle
    ? "Na 2 afgeronde cycli en ongeveer 10 check-ins zie je hier wat bij jou terugkomt, bijvoorbeeld dat je vaker moe bent vlak voor je menstruatie."
    : "Na ongeveer 10 check-ins zie je hier wat bij jou terugkomt en wat je helpt."

  return { title: "Op weg naar jouw patronen", body, steps }
}

export interface CycleRecap {
  /** e.g. "22 sep. – 18 okt." */
  rangeLabel: string
  lines: string[]
}

const PHASE_WHEN: Record<CyclePhase, string> = {
  menstruatie: "tijdens je menstruatie",
  folliculair: "in de folliculaire fase",
  ovulatie: "rond de eisprong",
  luteaal: "in de luteale fase",
}

const IGNORED = new Set(["Geen klachten", "Anders"])
const MIN_RECAP_CHECKINS = 3
const MIN_PHASE_ENERGY_DAYS = 2

/** Look back on her most recent completed cycle. Null when there's too little to say. */
export function composeCycleRecap(
  history: CycleHistoryEntry[],
  checkins: RecapCheckin[],
): CycleRecap | null {
  const completed = history.filter(
    (p): p is CycleHistoryEntry & { cycleLength: number } => p.cycleLength !== null,
  )
  const cycle = completed[completed.length - 1]
  if (!cycle) return null

  const start = parseISO(cycle.start)
  const inCycle = checkins
    .map((c) => ({ ...c, day: differenceInCalendarDays(parseISO(c.date), start) + 1 }))
    .filter((c) => c.day >= 1 && c.day <= cycle.cycleLength)
  if (inCycle.length < MIN_RECAP_CHECKINS) return null

  const lines: string[] = [
    `Je cyclus duurde ${cycle.cycleLength} dagen. Je vulde ${inCycle.length} keer een check-in in.`,
  ]

  const counts = new Map<string, number>()
  for (const c of inCycle) {
    for (const s of new Set(c.symptoms ?? [])) {
      if (IGNORED.has(s)) continue
      counts.set(s, (counts.get(s) ?? 0) + 1)
    }
  }
  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 2)
    .map(([s, n]) => `${symptomLabel(s).toLowerCase()} (${n}×)`)
  if (top.length) {
    lines.push(`Vaakst genoteerd: ${top.join(" en ")}.`)
  }

  const energyByPhase = new Map<CyclePhase, number[]>()
  for (const c of inCycle) {
    if (c.energy == null) continue
    const phase = classifyPhase(c.day, cycle.cycleLength)
    const list = energyByPhase.get(phase) ?? []
    list.push(c.energy)
    energyByPhase.set(phase, list)
  }
  const phaseAverages = [...energyByPhase.entries()]
    .filter(([, values]) => values.length >= MIN_PHASE_ENERGY_DAYS)
    .map(([phase, values]) => ({
      phase,
      avg: values.reduce((sum, v) => sum + v, 0) / values.length,
    }))
    .sort((a, b) => b.avg - a.avg)
  // Only worth saying when there's a real difference between phases.
  if (phaseAverages.length >= 2 && phaseAverages[0].avg - phaseAverages[phaseAverages.length - 1].avg >= 0.75) {
    lines.push(`Je energie was het hoogst ${PHASE_WHEN[phaseAverages[0].phase]}.`)
  }

  const end = addDays(start, cycle.cycleLength - 1)
  const rangeLabel = formatDateRange(start, end)

  return { rangeLabel, lines }
}
