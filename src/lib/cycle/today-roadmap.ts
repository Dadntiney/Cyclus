import { symptomLabel } from "@/lib/constants"
import type { CyclePhase } from "@/lib/cycle/estimate"
import { getPhaseContent } from "@/lib/cycle/phase-content"
import { getPhaseKnowledge } from "@/lib/cycle/phase-knowledge"
import type { BodyRecognition } from "@/lib/cycle/body-translator"
import {
  type WhatHelpedInsight,
  whatHelpedSupportWhy,
  whatHelpedTitle,
} from "@/lib/cycle/what-helped"

/**
 * Hormone-roadmap for Vandaag: phase physiology + today's lived symptoms/
 * needs → a short "why now" and 1–3 practical support points.
 *
 * Deliberately hedged and educational — never diagnoses or "this fixes X".
 * Keeps Vandaag as one calm composition: understand → then act on the plan.
 */

export type RoadmapSupportKind = "beweging" | "voeding" | "rust" | "tip" | "helped"

export interface RoadmapSupport {
  kind: RoadmapSupportKind
  title: string
  why: string
}

export interface TodayRoadmap {
  phaseLabel: string
  /** Why her body may feel this way today (phase + optional symptom nod). */
  whyNow: string
  supports: RoadmapSupport[]
}

const IGNORED = new Set(["Geen klachten", "Anders"])

/** Symptom → soft support angle when she logged it today. */
const SYMPTOM_SUPPORT: Record<
  string,
  { kind: RoadmapSupportKind; title: string; why: string }
> = {
  Krampen: {
    kind: "rust",
    title: "Warmte & zachte rust",
    why: "Bij krampen kan warmte of even vertragen prettig aanvoelen — geen must, wel een zachte optie.",
  },
  Buikpijn: {
    kind: "rust",
    title: "Even zachter voor je buik",
    why: "Buikpijn vraagt vaak om minder prikkels: warmte, rustigere beweging en lichte maaltijden.",
  },
  Vermoeidheid: {
    kind: "beweging",
    title: "Beweging op jouw tempo",
    why: "Bij vermoeidheid past zachtere beweging vaak beter — wandelen of mobiliteit in plaats van forceren.",
  },
  "Slecht slapen": {
    kind: "rust",
    title: "Avondrust eerst",
    why: "Na een slechte nacht helpt het vaak om vandaag iets minder van jezelf te vragen en eerder naar rust toe te werken.",
  },
  Opvliegers: {
    kind: "tip",
    title: "Koeler en rustiger",
    why: "Bij opvliegers helpen lichte kleding, koelte en korte pauzes soms al — elke vrouw merkt iets anders.",
  },
  "Nachtelijk zweten": {
    kind: "rust",
    title: "Slaap & herstel",
    why: "Na nachtelijk zweten kan je lichaam vandaag extra herstel vragen — een zachtere planning is oké.",
  },
  Hoofdpijn: {
    kind: "rust",
    title: "Prikkels temperen",
    why: "Bij hoofdpijn helpen vaak rust, vocht en minder intense training — luister vooral naar wat verzacht.",
  },
  Bloating: {
    kind: "voeding",
    title: "Lichte, warme voeding",
    why: "Bij een opgeblazen gevoel voelen lichtere of warmere maaltijden vaak prettiger dan zware of gassige gerechten.",
  },
  Cravings: {
    kind: "voeding",
    title: "Stabiele energie",
    why: "Trek in eten kan samenhangen met schommelende energie — eiwit, vezels en regelmaat kunnen helpen het wat rustiger te houden.",
  },
  Stemmingswisselingen: {
    kind: "rust",
    title: "Ruimte voor jezelf",
    why: "Bij wisselende stemming helpt vaak een klein moment zonder druk — dat mag rust, beweging of even niets zijn.",
  },
  Emotioneel: {
    kind: "rust",
    title: "Zachte aandacht",
    why: "Als je emotioneel bent, is dat geen falen — een kort moment voor jezelf kan al iets verzachten.",
  },
  "Brain fog": {
    kind: "tip",
    title: "Eenvoud vandaag",
    why: "Bij concentratieproblemen helpt het soms om taken kleiner te maken en voldoende water en rust in te plannen.",
  },
  Gespannen: {
    kind: "rust",
    title: "Spanning loslaten",
    why: "Spanning vraagt vaak om adem, zachte beweging of even uit de drukte — niet om harder doorzetten.",
  },
  Overprikkeld: {
    kind: "rust",
    title: "Minder prikkels",
    why: "Als alles te veel voelt, helpt een korte terugtrek — stilte, dim licht, of een korte wandeling alleen.",
  },
  Prikkelbaar: {
    kind: "rust",
    title: "Even afstand",
    why: "Prikkelbaarheid mag er zijn — een korte pauze voor je reageert kan al verschil maken.",
  },
}

function seededIndex(seed: string, length: number): number {
  if (length <= 0) return 0
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % length
}

function cleanSymptoms(symptoms: string[]): string[] {
  return symptoms.filter((s) => s && !IGNORED.has(s))
}

function firstSentence(text: string): string {
  const trimmed = text.trim()
  const match = trimmed.match(/^(.+?[.!?])(?:\s|$)/)
  return match ? match[1] : trimmed
}

export interface ComposeTodayRoadmapInput {
  phase: CyclePhase
  phaseLabel: string
  seed: string
  symptoms?: string[] | null
  needs?: string[] | null
  energy?: number | null
  stress?: number | null
  bodyRecognition?: BodyRecognition | null
  /** Personal “wat hielp eerder” signal, if strong enough. */
  whatHelped?: WhatHelpedInsight | null
  /** Optional personalized tip from daily_tips (goals/symptoms). */
  dailyTip?: { title: string; short_explanation: string } | null
  movementEnabled?: boolean
  nutritionEnabled?: boolean
}

/**
 * Builds today's hormone roadmap. Always returns content when she has a
 * cycle phase — even without a check-in (phase-only baseline).
 */
export function composeTodayRoadmap(input: ComposeTodayRoadmapInput): TodayRoadmap {
  const {
    phase,
    phaseLabel,
    seed,
    symptoms = [],
    needs = [],
    energy = null,
    stress = null,
    bodyRecognition = null,
    whatHelped = null,
    dailyTip = null,
    movementEnabled = true,
    nutritionEnabled = true,
  } = input

  const knowledge = getPhaseKnowledge(phase)
  const content = getPhaseContent(phase)
  const todaySymptoms = cleanSymptoms(symptoms ?? [])
  const todayNeeds = needs ?? []

  const hormonalWhy = firstSentence(knowledge.whyExplainer)
  const whyNow = bodyRecognition
    ? `${bodyRecognition.text} ${hormonalWhy}`
    : todaySymptoms.length
      ? `Je noteerde vandaag o.a. ${symptomLabel(todaySymptoms[0]).toLowerCase()}. ${hormonalWhy}`
      : hormonalWhy

  const supports: RoadmapSupport[] = []
  const usedKinds = new Set<RoadmapSupportKind>()

  // 0) What helped before — personal signal before generic phase support
  if (whatHelped) {
    supports.push({
      kind: "helped",
      title: whatHelpedTitle(whatHelped),
      why: whatHelpedSupportWhy(whatHelped),
    })
    usedKinds.add("helped")
  }

  // 1) Symptom-specific support (highest personal signal)
  for (const symptom of todaySymptoms) {
    const support = SYMPTOM_SUPPORT[symptom]
    if (!support || usedKinds.has(support.kind)) continue
    supports.push(support)
    usedKinds.add(support.kind)
    if (supports.length >= 2) break
  }

  // 2) Movement — always give a phase-aware movement why when enabled,
  // tilted gentler when her check-in asks for rest.
  const wantsRest =
    todayNeeds.includes("rust") ||
    todayNeeds.includes("mezelf") ||
    (energy !== null && energy <= 2) ||
    (stress !== null && stress >= 4) ||
    content.movement.preferGentler

  if (movementEnabled && !usedKinds.has("beweging")) {
    supports.push({
      kind: "beweging",
      title: wantsRest ? "Zachtere beweging" : content.movement.intensityLabel,
      why: firstSentence(content.movement.focusText),
    })
    usedKinds.add("beweging")
  }

  if (nutritionEnabled && !usedKinds.has("voeding")) {
    supports.push({
      kind: "voeding",
      title: content.nutrition.focusLabel,
      why: firstSentence(content.nutrition.focusText),
    })
    usedKinds.add("voeding")
  }

  // 3) Tip: symptom-matched daily tip, else phase lifestyle tip
  if (!usedKinds.has("tip") && supports.length < 3) {
    if (dailyTip) {
      supports.push({
        kind: "tip",
        title: dailyTip.title,
        why: firstSentence(dailyTip.short_explanation),
      })
      usedKinds.add("tip")
    } else {
      const tip = content.lifestyleTips[seededIndex(`${seed}-roadmap-tip`, content.lifestyleTips.length)]
      supports.push({
        kind: "tip",
        title: tip.title,
        why: tip.text,
      })
    }
  }

  return {
    phaseLabel,
    whyNow,
    supports: supports.slice(0, 3),
  }
}
