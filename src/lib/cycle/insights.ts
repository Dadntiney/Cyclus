import { estimateCycle, type CyclePhase } from "@/lib/cycle/estimate"

export const MIN_CHECKINS_FOR_INSIGHTS = 10
const MIN_GROUP_SIZE = 3
const MIN_RATE_DELTA = 0.25
const MAX_INSIGHTS = 4

export interface InsightCheckin {
  date: string
  sleep: number | null
  energy: number | null
  mood: number | null
  stress: number | null
  symptoms: string[]
}

export interface CycleProfileForInsights {
  has_cycle: boolean
  last_period_start: string | null
  average_cycle_length: number | null
}

export interface PersonalInsight {
  id: string
  text: string
  /** Higher = stronger signal; used for sorting. */
  score: number
  /** Only set for a phase-based insight — lets a caller cross-check it against
   * computePhaseSymptomInsights (patterns.ts), which looks at the same kind of
   * question (symptom vs. phase) but over completed cycles specifically, so
   * the two can otherwise state the same finding twice in different words. */
  phase?: CyclePhase
  symptom?: string
}

interface SplitResult {
  symptom: string
  rateA: number
  rateB: number
  delta: number
  countA: number
  countB: number
}

function cleanSymptoms(symptoms: string[]): string[] {
  return symptoms.filter((s) => s && s !== "Geen klachten" && s !== "Anders")
}

function rateForSymptom(checkins: InsightCheckin[], symptom: string): number {
  if (!checkins.length) return 0
  const hits = checkins.filter((c) => cleanSymptoms(c.symptoms).includes(symptom)).length
  return hits / checkins.length
}

function compareGroups(
  groupA: InsightCheckin[],
  groupB: InsightCheckin[],
): SplitResult[] {
  if (groupA.length < MIN_GROUP_SIZE || groupB.length < MIN_GROUP_SIZE) return []

  const symptoms = new Set<string>()
  for (const c of [...groupA, ...groupB]) {
    for (const s of cleanSymptoms(c.symptoms)) symptoms.add(s)
  }

  const results: SplitResult[] = []
  for (const symptom of symptoms) {
    const rateA = rateForSymptom(groupA, symptom)
    const rateB = rateForSymptom(groupB, symptom)
    const delta = rateA - rateB
    if (delta >= MIN_RATE_DELTA) {
      results.push({
        symptom,
        rateA,
        rateB,
        delta,
        countA: groupA.length,
        countB: groupB.length,
      })
    }
  }
  return results.sort((a, b) => b.delta - a.delta)
}

function phaseForDate(
  date: string,
  cycleProfile: CycleProfileForInsights | null,
): CyclePhase | null {
  if (!cycleProfile?.has_cycle) return null
  const estimate = estimateCycle(
    cycleProfile.last_period_start,
    cycleProfile.average_cycle_length,
    cycleProfile.has_cycle,
    new Date(`${date}T12:00:00`),
  )
  return estimate?.phase ?? null
}

const PHASE_LABELS: Record<CyclePhase, string> = {
  menstruatie: "menstruatie",
  folliculair: "folliculaire fase",
  ovulatie: "ovulatie",
  luteaal: "luteale fase",
}

/**
 * Derives plain-language personal insights from check-in history.
 * Rule-based (no ML): compares symptom rates across sleep/energy/stress/mood
 * and optionally cycle phase. Returns [] when there isn't enough data.
 */
export function computePersonalInsights(
  checkins: InsightCheckin[],
  cycleProfile: CycleProfileForInsights | null = null,
): PersonalInsight[] {
  if (checkins.length < MIN_CHECKINS_FOR_INSIGHTS) return []

  const insights: PersonalInsight[] = []

  const poorSleep = checkins.filter((c) => c.sleep !== null && c.sleep <= 2)
  const goodSleep = checkins.filter((c) => c.sleep !== null && c.sleep >= 4)
  for (const hit of compareGroups(poorSleep, goodSleep).slice(0, 2)) {
    insights.push({
      id: `sleep-${hit.symptom}`,
      score: hit.delta,
      text: `Na nachten met mindere slaap noteer je vaker ${hit.symptom.toLowerCase()}.`,
    })
  }

  const lowEnergy = checkins.filter((c) => c.energy !== null && c.energy <= 2)
  const highEnergy = checkins.filter((c) => c.energy !== null && c.energy >= 4)
  for (const hit of compareGroups(lowEnergy, highEnergy).slice(0, 2)) {
    insights.push({
      id: `energy-${hit.symptom}`,
      score: hit.delta,
      text: `Op dagen met lage energie komt ${hit.symptom.toLowerCase()} vaker voor.`,
    })
  }

  const highStress = checkins.filter((c) => c.stress !== null && c.stress >= 4)
  const lowStress = checkins.filter((c) => c.stress !== null && c.stress <= 2)
  for (const hit of compareGroups(highStress, lowStress).slice(0, 2)) {
    insights.push({
      id: `stress-${hit.symptom}`,
      score: hit.delta,
      text: `Bij hogere stress noteer je vaker ${hit.symptom.toLowerCase()}.`,
    })
  }

  const lowMood = checkins.filter((c) => c.mood !== null && c.mood <= 2)
  const highMood = checkins.filter((c) => c.mood !== null && c.mood >= 4)
  for (const hit of compareGroups(lowMood, highMood).slice(0, 1)) {
    insights.push({
      id: `mood-${hit.symptom}`,
      score: hit.delta,
      text: `Op dagen met een lagere stemming komt ${hit.symptom.toLowerCase()} vaker voor.`,
    })
  }

  if (cycleProfile?.has_cycle) {
    const byPhase = new Map<CyclePhase, InsightCheckin[]>()
    for (const c of checkins) {
      const phase = phaseForDate(c.date, cycleProfile)
      if (!phase) continue
      const list = byPhase.get(phase) ?? []
      list.push(c)
      byPhase.set(phase, list)
    }

    const phases = [...byPhase.entries()].filter(([, list]) => list.length >= MIN_GROUP_SIZE)
    const allPhased = phases.flatMap(([, list]) => list)

    for (const [phase, list] of phases) {
      const others = allPhased.filter((c) => !list.includes(c))
      if (others.length < MIN_GROUP_SIZE) continue
      for (const hit of compareGroups(list, others).slice(0, 1)) {
        insights.push({
          id: `phase-${phase}-${hit.symptom}`,
          score: hit.delta * 0.95,
          text: `In je ${PHASE_LABELS[phase]} noteer je vaker ${hit.symptom.toLowerCase()}.`,
          phase,
          symptom: hit.symptom,
        })
      }
    }
  }

  // Deduplicate by symptom+kind-ish id prefix, keep strongest score.
  const bestByKey = new Map<string, PersonalInsight>()
  for (const insight of insights) {
    const key = insight.id.replace(/^(sleep|energy|stress|mood|phase-[^-]+)-/, "")
    const existing = bestByKey.get(key)
    if (!existing || insight.score > existing.score) {
      bestByKey.set(key, insight)
    }
  }

  return [...bestByKey.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_INSIGHTS)
}
