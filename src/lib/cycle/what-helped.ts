import { NEED_OPTIONS, workoutTypeLabel } from "@/lib/constants"

/**
 * "Wat hielp jou eerder?" — correlates declared needs / completed workouts
 * with better energy or mood days. Hedged and threshold-gated so ordinary
 * coincidence stays silent (same philosophy as co-occurrence / phase patterns).
 *
 * Not causal proof — a soft personal signal for Vandaag, Buddy, and Cyclus.
 */

export interface WhatHelpedCheckin {
  date: string
  needs: string[] | null
  energy: number | null
  mood: number | null
}

export interface WhatHelpedSession {
  date: string
  /** `workouts.type` when known. */
  workoutType?: string | null
}

export type WhatHelpedKind = "need" | "workout"

export interface WhatHelpedInsight {
  kind: WhatHelpedKind
  /** Need value (rust/…) or workout type / "beweging". */
  intervention: string
  /** Dutch label for UI. */
  label: string
  betterDays: number
  interventionDays: number
  rate: number
  /** How much higher than days without this intervention. */
  lift: number
}

const MIN_INTERVENTION_DAYS = 4
const MIN_BETTER_DAYS = 3
const MIN_RATE = 0.5
const MIN_LIFT = 0.12

const NEED_LABEL: Record<string, string> = Object.fromEntries(
  NEED_OPTIONS.map((o) => [o.value, o.label.toLowerCase()]),
)

function hasOutcome(c: WhatHelpedCheckin): boolean {
  return c.energy != null || c.mood != null
}

/** Soft "better day": energy or mood at least 4/5. */
export function isBetterCheckinDay(c: WhatHelpedCheckin): boolean {
  return (c.energy != null && c.energy >= 4) || (c.mood != null && c.mood >= 4)
}

function needLabel(value: string): string {
  return NEED_LABEL[value] ?? value
}

function workoutLabel(type: string | null | undefined): string {
  if (!type) return "beweging"
  return workoutTypeLabel(type).toLowerCase()
}

/**
 * @param checkins Daily check-ins with needs + energy/mood (any order).
 * @param sessions Optional completed workout sessions (date + type).
 */
export function computeWhatHelpedInsights(
  checkins: WhatHelpedCheckin[],
  sessions: WhatHelpedSession[] = [],
): WhatHelpedInsight[] {
  const withOutcome = checkins.filter(hasOutcome)
  if (withOutcome.length < MIN_INTERVENTION_DAYS + 2) return []

  const results: WhatHelpedInsight[] = []

  // --- Needs ---
  const needValues = new Set<string>()
  for (const c of withOutcome) {
    for (const n of c.needs ?? []) {
      if (n && NEED_LABEL[n]) needValues.add(n)
    }
  }

  for (const need of needValues) {
    const withNeed = withOutcome.filter((c) => (c.needs ?? []).includes(need))
    const withoutNeed = withOutcome.filter((c) => !(c.needs ?? []).includes(need))
    if (withNeed.length < MIN_INTERVENTION_DAYS || withoutNeed.length < 2) continue

    const betterDays = withNeed.filter(isBetterCheckinDay).length
    if (betterDays < MIN_BETTER_DAYS) continue

    const rate = betterDays / withNeed.length
    const baseline = withoutNeed.filter(isBetterCheckinDay).length / withoutNeed.length
    const lift = rate - baseline
    if (rate < MIN_RATE || lift < MIN_LIFT) continue

    results.push({
      kind: "need",
      intervention: need,
      label: needLabel(need),
      betterDays,
      interventionDays: withNeed.length,
      rate,
      lift,
    })
  }

  // --- Workouts (same-day check-in) ---
  if (sessions.length) {
    const typeByDate = new Map<string, string | null>()
    for (const s of sessions) {
      if (!typeByDate.has(s.date)) typeByDate.set(s.date, s.workoutType ?? null)
    }

    const byType = new Map<string, { dates: Set<string>; label: string }>()
    // Aggregate all movement as one bucket, plus per-type when enough data.
    byType.set("beweging", { dates: new Set(typeByDate.keys()), label: "beweging" })
    for (const [date, type] of typeByDate) {
      if (!type) continue
      const key = `type:${type}`
      let bucket = byType.get(key)
      if (!bucket) {
        bucket = { dates: new Set(), label: workoutLabel(type) }
        byType.set(key, bucket)
      }
      bucket.dates.add(date)
    }

    for (const [key, bucket] of byType) {
      const withW = withOutcome.filter((c) => bucket.dates.has(c.date))
      const withoutW = withOutcome.filter((c) => !bucket.dates.has(c.date))
      if (withW.length < MIN_INTERVENTION_DAYS || withoutW.length < 2) continue

      const betterDays = withW.filter(isBetterCheckinDay).length
      if (betterDays < MIN_BETTER_DAYS) continue

      const rate = betterDays / withW.length
      const baseline = withoutW.filter(isBetterCheckinDay).length / withoutW.length
      const lift = rate - baseline
      if (rate < MIN_RATE || lift < MIN_LIFT) continue

      results.push({
        kind: "workout",
        intervention: key === "beweging" ? "beweging" : key.replace(/^type:/, ""),
        label: bucket.label,
        betterDays,
        interventionDays: withW.length,
        rate,
        lift,
      })
    }
  }

  // Prefer stronger lift, then rate; drop redundant generic "beweging" if a
  // typed workout insight already wins with similar coverage.
  results.sort((a, b) => b.lift - a.lift || b.rate - a.rate || b.betterDays - a.betterDays)

  const typedWorkout = results.find((r) => r.kind === "workout" && r.intervention !== "beweging")
  if (typedWorkout) {
    return results.filter(
      (r) => !(r.kind === "workout" && r.intervention === "beweging"),
    )
  }

  return results
}

/** Prefer an insight that matches today’s needs; else strongest overall. */
export function getWhatHelpedForToday(
  insights: WhatHelpedInsight[],
  todayNeeds: string[] | null | undefined,
): WhatHelpedInsight | null {
  if (!insights.length) return null
  const needs = todayNeeds ?? []
  const matchingNeed = insights.find(
    (i) => i.kind === "need" && needs.includes(i.intervention),
  )
  if (matchingNeed) return matchingNeed
  if (needs.includes("beweging") || needs.includes("energie")) {
    const workout = insights.find((i) => i.kind === "workout")
    if (workout) return workout
  }
  return insights[0] ?? null
}

export function formatWhatHelpedInsight(insight: WhatHelpedInsight): string {
  if (insight.kind === "need") {
    return `Op dagen waarop je "${insight.label}" koos, noteerde je vaker een betere energie of stemming.`
  }
  return `Op dagen met ${insight.label}, noteerde je vaker een betere energie of stemming.`
}

/** Short title for roadmap / story cards. */
export function whatHelpedTitle(insight: WhatHelpedInsight): string {
  if (insight.kind === "need") {
    return `Eerder hielp: ${insight.label}`
  }
  return `Eerder hielp: ${insight.label}`
}

export function whatHelpedSupportWhy(insight: WhatHelpedInsight): string {
  return formatWhatHelpedInsight(insight)
}
