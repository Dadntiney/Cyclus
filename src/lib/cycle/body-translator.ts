import { symptomLabel } from "@/lib/constants"
import type { CyclePhase } from "@/lib/cycle/estimate"
import {
  type CycleLengthTrendInsight,
  type PhaseSymptomInsight,
} from "@/lib/cycle/patterns"
import {
  formatCoOccurrenceInsight,
  getCoOccurrenceForToday,
  type SymptomCoOccurrence,
} from "@/lib/cycle/co-occurrence"

/**
 * Composes the single personal recognition line for Vandaag — "één zin die
 * klopt". Prefer today's lived experience matched to her history; fall back
 * to a calm phase pattern or cycle-length nod. Never diagnoses. Returns null
 * when nothing clears the bar, so the UI keeps the generic phase tagline.
 */

export type BodyRecognitionKind =
  | "phase_today"
  | "phase_pattern"
  | "co_occurrence"
  | "cycle_length"

export interface BodyRecognition {
  text: string
  kind: BodyRecognitionKind
}

export interface ComposeBodyRecognitionInput {
  phase: CyclePhase | null
  phaseLabel: string | null
  /** Strongest phase/symptom pattern for *today's* phase, if any. */
  phaseInsight: PhaseSymptomInsight | null
  cycleLengthTrend: CycleLengthTrendInsight | null
  coOccurrences: SymptomCoOccurrence[]
  todaySymptoms: string[]
}

const IGNORED = new Set(["Geen klachten", "Anders"])

function cleanToday(symptoms: string[]): string[] {
  return symptoms.filter((s) => s && !IGNORED.has(s))
}

function shortPhasePattern(insight: PhaseSymptomInsight, phaseLabel: string): string {
  const symptom = symptomLabel(insight.symptom).toLowerCase()
  const phase = phaseLabel.toLowerCase()
  if (insight.cyclesWithSymptom === insight.cyclesConsidered) {
    return `Bij jou komt "${symptom}" vaker terug rond de ${phase} — zo ook in je laatste cycli.`
  }
  return `Bij jou komt "${symptom}" vaker terug rond de ${phase} — in ${insight.cyclesWithSymptom} van je laatste ${insight.cyclesConsidered} cycli.`
}

function phaseTodayMatch(symptom: string, phaseLabel: string): string {
  return `Je noteerde vandaag "${symptomLabel(symptom).toLowerCase()}" — dat zie je bij jou vaker rond de ${phaseLabel.toLowerCase()}.`
}

function shortCycleLength(insight: CycleLengthTrendInsight): string | null {
  // Only the "onregelmatiger" direction earns a Vandaag nod — that's the
  // peri-relevant recognition ("mijn lichaam voelt anders"). Stabilizing
  // lives on the cyclus page; it doesn't need to interrupt the day.
  if (insight.direction !== "onregelmatiger") return null
  return `Je cyclusduur wisselt de laatste tijd wat meer — dat kan bij jouw levensfase horen, en is de moeite waard om zacht te volgen.`
}

/**
 * Picks at most one recognition line, in priority order:
 * 1. Today’s symptom matches her known pattern for this phase
 * 2. Known phase pattern (no today match needed)
 * 3. Co-occurrence triggered by something she logged today
 * 4. Cycle-length becoming more variable (peri signal)
 */
export function composeBodyRecognition(input: ComposeBodyRecognitionInput): BodyRecognition | null {
  const {
    phaseLabel,
    phaseInsight,
    cycleLengthTrend,
    coOccurrences,
    todaySymptoms,
  } = input

  const today = cleanToday(todaySymptoms)

  if (phaseInsight && phaseLabel) {
    const match = today.find((s) => s === phaseInsight.symptom)
    if (match) {
      return { kind: "phase_today", text: phaseTodayMatch(match, phaseLabel) }
    }
  }

  if (phaseInsight && phaseLabel) {
    return { kind: "phase_pattern", text: shortPhasePattern(phaseInsight, phaseLabel) }
  }

  const coToday = getCoOccurrenceForToday(coOccurrences, today)
  if (coToday) {
    return { kind: "co_occurrence", text: formatCoOccurrenceInsight(coToday) }
  }

  if (cycleLengthTrend) {
    const text = shortCycleLength(cycleLengthTrend)
    if (text) return { kind: "cycle_length", text }
  }

  return null
}
