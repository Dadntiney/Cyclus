import type { CyclePhase } from "@/lib/cycle/estimate"
import { getPhaseContent } from "@/lib/cycle/phase-content"
import {
  formatCycleLengthTrendInsight,
  type CycleLengthTrendInsight,
  type PhaseSymptomInsight,
  formatPhaseSymptomInsightShort,
} from "@/lib/cycle/patterns"
import {
  formatCoOccurrenceInsight,
  type SymptomCoOccurrence,
} from "@/lib/cycle/co-occurrence"
import {
  formatWhatHelpedInsight,
  type WhatHelpedInsight,
} from "@/lib/cycle/what-helped"

/**
 * Calm “Jouw verhaal” overview for the Cyclus hub:
 * cyclus in beeld → wat werkt → wat past deze week.
 * Assembles existing pattern engines into one readable composition —
 * no new metrics, just a clearer buddy-shaped narrative.
 */

export interface YourStory {
  /** Where she is in her cycle / life stage right now. */
  cycleInView: string
  /** 1–3 personal signals: what helped, co-occurrence, phase pattern. */
  whatWorks: string[]
  /** Soft guideline for the coming days (phase-aware, optional). */
  whatFitsThisWeek: string | null
}

export interface ComposeYourStoryInput {
  phase: CyclePhase | null
  phaseLabel: string | null
  cycleDay: number | null
  hasCycle: boolean
  lifeStageLabel?: string | null
  cycleLengthTrend?: CycleLengthTrendInsight | null
  phaseInsight?: PhaseSymptomInsight | null
  coOccurrence?: SymptomCoOccurrence | null
  whatHelped?: WhatHelpedInsight[]
  /** Soft week tilt from phase content when she has a cycle. */
  includeWeekGuide?: boolean
}

export function composeYourStory(input: ComposeYourStoryInput): YourStory | null {
  const {
    phase,
    phaseLabel,
    cycleDay,
    hasCycle,
    lifeStageLabel = null,
    cycleLengthTrend = null,
    phaseInsight = null,
    coOccurrence = null,
    whatHelped = [],
    includeWeekGuide = true,
  } = input

  const inViewParts: string[] = []
  if (hasCycle && phaseLabel && cycleDay != null) {
    inViewParts.push(`Je zit rond cyclusdag ${cycleDay} — ${phaseLabel.toLowerCase()}.`)
  } else if (lifeStageLabel) {
    inViewParts.push(`Je levensfase staat genoteerd als ${lifeStageLabel.toLowerCase()}.`)
  } else if (!hasCycle) {
    inViewParts.push("Je volgt Cyclus zonder menstruatiekalender — gericht op klachten en herstel.")
  }

  if (cycleLengthTrend) {
    // Use a shorter cut for the story card; full text lives under Veranderingen.
    if (cycleLengthTrend.direction === "onregelmatiger") {
      inViewParts.push(
        `Je cyclusduur wisselt de laatste ${cycleLengthTrend.cyclesConsidered} cycli wat meer dan daarvoor.`,
      )
    } else {
      inViewParts.push(
        `Je cyclusduur lijkt de laatste ${cycleLengthTrend.cyclesConsidered} cycli wat stabieler.`,
      )
    }
  }

  const whatWorks: string[] = []
  for (const insight of whatHelped.slice(0, 2)) {
    whatWorks.push(formatWhatHelpedInsight(insight))
  }
  if (coOccurrence && whatWorks.length < 2) {
    whatWorks.push(formatCoOccurrenceInsight(coOccurrence))
  }
  if (phaseInsight && phaseLabel && whatWorks.length < 3) {
    whatWorks.push(formatPhaseSymptomInsightShort(phaseInsight, phaseLabel))
  }

  let whatFitsThisWeek: string | null = null
  if (includeWeekGuide && phase && hasCycle) {
    const content = getPhaseContent(phase)
    const movement = content.movement.preferGentler
      ? "Zachtere beweging past vaak beter in deze fase."
      : `Beweging op ${content.movement.intensityLabel.toLowerCase()} past vaak bij deze fase.`
    const nutrition = content.nutrition.focusText.split(".")[0]?.trim()
    whatFitsThisWeek = nutrition
      ? `${movement} Bij voeding: ${nutrition.toLowerCase()}.`
      : movement
  }

  // Need at least one meaningful block beyond empty placeholders.
  if (!inViewParts.length && !whatWorks.length && !whatFitsThisWeek) return null

  return {
    cycleInView: inViewParts.join(" ") || "Nog te weinig cyclusgegevens voor een helder beeld — dat groeit mee.",
    whatWorks,
    whatFitsThisWeek,
  }
}

/** Buddy-context one-liner from the story (optional). */
export function formatYourStoryForBuddy(story: YourStory): string | null {
  const bits: string[] = []
  if (story.whatWorks[0]) bits.push(story.whatWorks[0])
  if (story.whatFitsThisWeek) bits.push(story.whatFitsThisWeek)
  if (!bits.length) return null
  return `Persoonlijke richtlijn: ${bits.join(" ")} — noem dit alleen subtiel als het gesprek ertoe leidt.`
}

// Re-export full trend formatter for pages that want the long form nearby.
export { formatCycleLengthTrendInsight }
