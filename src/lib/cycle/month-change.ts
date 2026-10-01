import { symptomLabel } from "@/lib/constants"

export interface MonthChangeCheckin {
  date: string
  energy: number | null
  mood: number | null
  sleep: number | null
  stress: number | null
  symptoms: string[]
}

export interface MonthChangeInsight {
  title: string
  body: string
  kind: "up" | "down" | "same" | "new"
}

const IGNORED = new Set(["Geen klachten", "Anders"])

/**
 * Compares the last ~28 days of check-ins to the 28 days before that.
 * Small, readable diffs — a "wat veranderde deze maand?" card.
 */
export function computeMonthChangeInsights(
  checkins: MonthChangeCheckin[],
  today: Date = new Date(),
): MonthChangeInsight[] {
  const todayMs = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const day = 24 * 60 * 60 * 1000

  const recent: MonthChangeCheckin[] = []
  const previous: MonthChangeCheckin[] = []

  for (const c of checkins) {
    const [y, m, d] = c.date.split("-").map(Number)
    const ms = Date.UTC(y, m - 1, d)
    const ageDays = Math.floor((todayMs - ms) / day)
    if (ageDays < 0) continue
    if (ageDays < 28) recent.push(c)
    else if (ageDays < 56) previous.push(c)
  }

  if (recent.length < 4 || previous.length < 4) return []

  const insights: MonthChangeInsight[] = []

  pushMetricDiff(insights, "energie", avg(recent.map((c) => c.energy)), avg(previous.map((c) => c.energy)), true)
  pushMetricDiff(insights, "stemming", avg(recent.map((c) => c.mood)), avg(previous.map((c) => c.mood)), true)
  pushMetricDiff(insights, "slaap", avg(recent.map((c) => c.sleep)), avg(previous.map((c) => c.sleep)), true)
  pushMetricDiff(insights, "stress", avg(recent.map((c) => c.stress)), avg(previous.map((c) => c.stress)), false)

  const recentCounts = countSymptoms(recent)
  const previousCounts = countSymptoms(previous)
  const rising = [...recentCounts.entries()]
    .map(([symptom, count]) => ({
      symptom,
      count,
      prev: previousCounts.get(symptom) ?? 0,
      delta: count - (previousCounts.get(symptom) ?? 0),
    }))
    .filter((row) => row.delta >= 2 && row.count >= 3)
    .sort((a, b) => b.delta - a.delta)

  for (const row of rising.slice(0, 2)) {
    insights.push({
      kind: row.prev === 0 ? "new" : "up",
      title:
        row.prev === 0
          ? `Nieuw: ${symptomLabel(row.symptom)}`
          : `Vaker: ${symptomLabel(row.symptom)}`,
      body:
        row.prev === 0
          ? `De afgelopen maand noteerde je “${symptomLabel(row.symptom).toLowerCase()}” ${row.count}× — de maand ervoor speelde dat nauwelijks.`
          : `Je noteerde “${symptomLabel(row.symptom).toLowerCase()}” ${row.count}× (was ${row.prev}×).`,
    })
  }

  return insights.slice(0, 5)
}

function avg(values: Array<number | null>): number | null {
  const nums = values.filter((v): v is number => v != null)
  if (!nums.length) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function countSymptoms(checkins: MonthChangeCheckin[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const c of checkins) {
    for (const s of c.symptoms) {
      if (IGNORED.has(s)) continue
      map.set(s, (map.get(s) ?? 0) + 1)
    }
  }
  return map
}

function pushMetricDiff(
  insights: MonthChangeInsight[],
  label: string,
  recent: number | null,
  previous: number | null,
  higherIsBetter: boolean,
) {
  if (recent === null || previous === null) return
  const delta = recent - previous
  if (Math.abs(delta) < 0.4) return
  const better = higherIsBetter ? delta > 0 : delta < 0
  const worseTitle = higherIsBetter
    ? `${capitalize(label)} iets lager`
    : `${capitalize(label)} iets hoger`
  insights.push({
    kind: better ? "up" : "down",
    title: better ? `${capitalize(label)} iets beter` : worseTitle,
    body: `Gemiddelde ${label} de afgelopen maand: ${recent.toFixed(1)} (was ${previous.toFixed(1)}).`,
  })
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
