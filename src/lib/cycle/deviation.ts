import type { CycleHistoryEntry } from "@/lib/cycle/history"
import type { CycleLengthTrendInsight } from "@/lib/cycle/patterns"

export type CycleDeviationKind =
  | "lengte_wisselender"
  | "lengte_stabieler"
  | "langere_cycli"
  | "kortere_cycli"
  | "langere_menstruatie"
  | "life_stage_hint"

export interface CycleDeviationAlert {
  kind: CycleDeviationKind
  title: string
  body: string
  severity: "info" | "attention"
}

const MIN_CYCLES = 4
const LENGTH_SHIFT_DAYS = 4
const PERIOD_LENGTH_SHIFT_DAYS = 1.5

/**
 * Surfaces concrete "je cyclus verandert"-signals from history + optional
 * length-trend insight. Educational only — mirrors Apple-style deviation
 * framing without claiming a diagnosis.
 */
export function computeCycleDeviationAlerts(input: {
  history: CycleHistoryEntry[]
  lengthTrend: CycleLengthTrendInsight | null
  lifeStage?: string | null
  age?: number | null
}): CycleDeviationAlert[] {
  const { history, lengthTrend, lifeStage = null, age = null } = input
  const completed = history.filter(
    (p): p is CycleHistoryEntry & { cycleLength: number } => p.cycleLength !== null,
  )
  const recent = completed.slice(-6)
  const alerts: CycleDeviationAlert[] = []

  if (lengthTrend?.direction === "onregelmatiger") {
    alerts.push({
      kind: "lengte_wisselender",
      title: "Je cyclusduur wisselt meer",
      body: `Over je laatste ${lengthTrend.cyclesConsidered} cycli wisselt de duur meer dan eerder. Dat komt vaker voor bij stress of een veranderende levensfase — geen diagnose, wel nuttig om te volgen.`,
      severity: "attention",
    })
  } else if (lengthTrend?.direction === "stabieler") {
    alerts.push({
      kind: "lengte_stabieler",
      title: "Je cyclusduur lijkt stabieler",
      body: `Over je laatste ${lengthTrend.cyclesConsidered} cycli wisselt de duur minder dan eerder.`,
      severity: "info",
    })
  }

  if (recent.length >= MIN_CYCLES) {
    const mid = Math.ceil(recent.length / 2)
    const earlier = recent.slice(0, mid)
    const later = recent.slice(mid)
    const earlierAvg = mean(earlier.map((c) => c.cycleLength))
    const laterAvg = mean(later.map((c) => c.cycleLength))
    const delta = laterAvg - earlierAvg

    if (delta >= LENGTH_SHIFT_DAYS) {
      alerts.push({
        kind: "langere_cycli",
        title: "Je cycli lijken langer te worden",
        body: `Je recente cycli zijn gemiddeld ongeveer ${Math.round(delta)} dagen langer dan daarvoor. Bijhouden helpt om dit met een zorgverlener te bespreken als het aanhoudt.`,
        severity: "attention",
      })
    } else if (delta <= -LENGTH_SHIFT_DAYS) {
      alerts.push({
        kind: "kortere_cycli",
        title: "Je cycli lijken korter te worden",
        body: `Je recente cycli zijn gemiddeld ongeveer ${Math.round(Math.abs(delta))} dagen korter dan daarvoor. Dat kan bij een veranderende cyclus horen — bespreek aanhoudende klachten met een zorgverlener.`,
        severity: "attention",
      })
    }

    const earlierBleed = mean(earlier.map((c) => c.days))
    const laterBleed = mean(later.map((c) => c.days))
    if (laterBleed - earlierBleed >= PERIOD_LENGTH_SHIFT_DAYS) {
      alerts.push({
        kind: "langere_menstruatie",
        title: "Je menstruatie lijkt langer te duren",
        body: "De laatste cycli laten gemiddeld meer menstruatiedagen zien dan eerder. Handig om te noteren voor jezelf of je arts.",
        severity: "attention",
      })
    }
  }

  const stageUnset = !lifeStage || lifeStage === "onbekend" || lifeStage === "regelmatig"
  if (stageUnset && (age ?? 0) >= 40 && alerts.some((a) => a.severity === "attention")) {
    alerts.push({
      kind: "life_stage_hint",
      title: "Past een veranderende levensfase bij jou?",
      body: "Je gegevens laten verschuivingen zien. Je kunt in je profiel aangeven of je cyclus verandert of dat je in de overgang denkt te zitten — dan past de app de uitleg beter aan. Dit is géén diagnose.",
      severity: "info",
    })
  }

  return alerts.slice(0, 4)
}

function mean(values: number[]): number {
  if (!values.length) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}
