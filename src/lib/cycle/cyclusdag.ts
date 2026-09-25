import type { CycleEstimate, CyclePhase } from "@/lib/cycle/estimate"
import { getPhaseKnowledge, type BodyChangeItem, type PhaseKnowledge } from "@/lib/cycle/phase-knowledge"
import { getPhaseContent, type PhaseColorTokens } from "@/lib/cycle/phase-content"
import { getDailyBuddyQuote } from "@/lib/data/buddy-quotes"
import { formatPhaseSymptomInsight, type PhaseSymptomInsight } from "@/lib/cycle/patterns"

/**
 * Composes the Cyclusdag detail page's content from three sources: the
 * educational body-knowledge copy (phase-knowledge.ts), the app's existing
 * practical phase tips (phase-content.ts, reused rather than duplicated —
 * see phase-knowledge.ts's header comment), and a light personalization
 * pass based on her profile/check-in history. Kept as one pure function so
 * the page component itself stays a thin fetch-and-render shell.
 */

function seededIndex(seed: string, length: number): number {
  if (length <= 0) return 0
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % length
}

// Short, natural noun phrase per training preference, for the personalized
// movement tip. "Zwemmen" and "Andere vorm van bewegen" get a generic
// fallback since there's no dedicated workout content for them yet.
const MOVEMENT_TIP_PHRASING: Record<string, string> = {
  Wandelen: "een wandeling",
  Fietsen: "een fietstochtje",
  Krachttraining: "een krachtsessie",
  Yoga: "een yogasessie",
  Pilates: "een pilatessessie",
  Hardlopen: "een hardloopsessie",
  Mobiliteit: "een mobiliteitsoefening",
}

// Maps a logged symptom (see SYMPTOM_OPTIONS in constants.ts) to the
// BodyChangeItem label it corresponds to, so a symptom she's logged before
// can be gently acknowledged when it's also a known theme of today's phase.
const SYMPTOM_TO_CHANGE_LABEL: Record<string, string> = {
  Hoofdpijn: "Hoofdpijn",
  Vermoeidheid: "Vermoeidheid",
  Bloating: "Buikgevoel",
  Krampen: "Buikgevoel",
  Stemmingswisselingen: "Stemming",
  "Brain fog": "Concentratie",
  Cravings: "Honger/eetlust",
}

export interface BuddyMoment {
  kind: "tip" | "quote"
  title: string
  emoji: string
  text: string
}

export interface CyclusdagView {
  cycleDay: number
  phase: CyclePhase
  phaseLabel: string
  colors: PhaseColorTokens
  knowledge: PhaseKnowledge
  highlightChanges: BodyChangeItem[]
  moreChanges: BodyChangeItem[]
  funFact: string
  buddyMoment: BuddyMoment
  /** A one-line, gentle nod to a symptom she's logged before, when relevant — otherwise null. */
  symptomNote: string | null
}

export interface BuildCyclusdagViewInput {
  cycleEstimate: CycleEstimate
  /** Stable per user+day, e.g. `${userId}-${todayISO}`. */
  seed: string
  movementEnabled: boolean
  trainingPreferences: string[]
  /** Her most frequently logged symptom recently, if any — see computeSymptomFrequency. */
  topSymptom: string | null
  /**
   * The strongest phase-specific pattern for *today's* phase, if her
   * history is rich enough to support one — see computePhaseSymptomInsights.
   * Preferred over `topSymptom` when present: "vaker moe in de luteale
   * fase, je laatste 3 cycli" is a stronger, more personal claim than "je
   * logt vaak moeheid" — this is the app getting more personal as she logs
   * more data, per the product vision.
   */
  phaseInsight: PhaseSymptomInsight | null
}

function buildPersonalizedMovementTip(
  trainingPreferences: string[],
  preferGentler: boolean,
): string | null {
  const pref = trainingPreferences.find((p) => MOVEMENT_TIP_PHRASING[p])
  if (!pref) return null
  const noun = MOVEMENT_TIP_PHRASING[pref]
  const pace = preferGentler ? "in een rustig tempo" : "in het tempo dat vandaag goed voelt"
  return `Je gaf aan dat je ${pref.toLowerCase()} als vorm van bewegen koos — ${noun} ${pace} past daar mooi bij.`
}

function buildSymptomNote(topSymptom: string | null, changes: BodyChangeItem[]): string | null {
  if (!topSymptom) return null
  const changeLabel = SYMPTOM_TO_CHANGE_LABEL[topSymptom]
  if (!changeLabel) return null
  if (!changes.some((c) => c.label === changeLabel)) return null
  return `Je gaf eerder bij je check-ins vaker "${topSymptom.toLowerCase()}" aan — dat is iets wat sommige vrouwen in deze fase vaker herkennen.`
}

export function buildCyclusdagView(input: BuildCyclusdagViewInput): CyclusdagView {
  const { cycleEstimate, seed, movementEnabled, trainingPreferences, topSymptom, phaseInsight } = input
  const { phase, phaseLabel, cycleDay } = cycleEstimate

  const knowledge = getPhaseKnowledge(phase)
  const phaseContent = getPhaseContent(phase)

  const highlightChanges = knowledge.changes.filter((c) => c.highlight)
  const moreChanges = knowledge.changes.filter((c) => !c.highlight)

  const funFact = knowledge.funFacts[seededIndex(`${seed}-funfact`, knowledge.funFacts.length)]

  // Alternates day to day between a practical tip and a warm buddy quote,
  // so this section doesn't feel identical every time she visits.
  const usePersonalTip = seededIndex(`${seed}-moment-gate`, 2) === 0
  let buddyMoment: BuddyMoment
  if (usePersonalTip) {
    const personalTip = movementEnabled
      ? buildPersonalizedMovementTip(trainingPreferences, phaseContent.movement.preferGentler)
      : null
    if (personalTip) {
      buddyMoment = { kind: "tip", title: "Kleine tip voor vandaag", emoji: "💡", text: personalTip }
    } else {
      const phaseTip = phaseContent.lifestyleTips[seededIndex(`${seed}-phasetip`, phaseContent.lifestyleTips.length)]
      buddyMoment = {
        kind: "tip",
        title: "Kleine tip voor vandaag",
        emoji: "💡",
        text: `${phaseTip.title}: ${phaseTip.text}`,
      }
    }
  } else {
    const quote = getDailyBuddyQuote(`${seed}-cyclusdag`, phase)
    buddyMoment = { kind: "quote", title: "Even onthouden 💛", emoji: quote.emoji, text: quote.text }
  }

  return {
    cycleDay,
    phase,
    phaseLabel,
    colors: phaseContent.colors,
    knowledge,
    highlightChanges,
    moreChanges,
    funFact,
    buddyMoment,
    symptomNote: phaseInsight
      ? formatPhaseSymptomInsight(phaseInsight, phaseLabel)
      : buildSymptomNote(topSymptom, knowledge.changes),
  }
}
