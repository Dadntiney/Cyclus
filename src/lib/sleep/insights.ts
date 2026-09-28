import { computeSleepDurationMinutes } from "@/lib/sleep/duration"
import { symptomLabel } from "@/lib/constants"

/**
 * Simple, hedged personal insights from her own sleep log — never a
 * diagnosis, never medical causality ("je bent moe omdat..."), and never a
 * conclusion drawn from too little data (see MIN_ENTRIES_* thresholds
 * below, same threshold-gating philosophy as the cycle-length trend and
 * phase/symptom pattern insights elsewhere in the app).
 */

export interface SleepEntryLike {
  date: string
  bedtime: string | null
  wake_time: string | null
  wake_feeling: string | null
}

const RECENT_WINDOW = 7
const MIN_NIGHTS_FOR_AVERAGE = 3
const MIN_NIGHTS_PER_GROUP_FOR_CORRELATION = 2
const MEANINGFUL_DIFFERENCE_MINUTES = 30

const GOOD_FEELINGS = new Set(["uitgerust", "redelijk_uitgerust"])
const BAD_FEELINGS = new Set(["moe", "erg_moe"])

/** A night under this counts as "kort" everywhere sleep/symptom patterns and
 * today's recommendation logic need that same cutoff. */
export const SHORT_NIGHT_MINUTES = 6 * 60

function withDuration(entries: SleepEntryLike[]): (SleepEntryLike & { durationMinutes: number })[] {
  return entries
    .filter((e): e is SleepEntryLike & { bedtime: string; wake_time: string } => Boolean(e.bedtime && e.wake_time))
    .map((e) => ({ ...e, durationMinutes: computeSleepDurationMinutes(e.bedtime, e.wake_time) }))
}

/** @param entries Recent sleep entries, oldest first. */
export function computeAverageSleepDuration(
  entries: SleepEntryLike[],
): { averageMinutes: number; nights: number } | null {
  const recent = withDuration(entries.slice(-RECENT_WINDOW))
  if (recent.length < MIN_NIGHTS_FOR_AVERAGE) return null
  const total = recent.reduce((sum, e) => sum + e.durationMinutes, 0)
  return { averageMinutes: Math.round(total / recent.length), nights: recent.length }
}

/**
 * "Op dagen waarop je langer sliep, gaf je vaker aan dat je uitgerust
 * voelde" — only reported when both groups (goed/slecht wakker geworden)
 * have enough nights AND the gap is large enough to be more than noise.
 */
export function computeSleepWakeFeelingInsight(entries: SleepEntryLike[]): string | null {
  const withFeeling = withDuration(entries).filter((e) => e.wake_feeling)
  const good = withFeeling.filter((e) => GOOD_FEELINGS.has(e.wake_feeling!))
  const bad = withFeeling.filter((e) => BAD_FEELINGS.has(e.wake_feeling!))
  if (good.length < MIN_NIGHTS_PER_GROUP_FOR_CORRELATION || bad.length < MIN_NIGHTS_PER_GROUP_FOR_CORRELATION) {
    return null
  }
  const average = (list: typeof good) => list.reduce((s, e) => s + e.durationMinutes, 0) / list.length
  const goodAverage = average(good)
  const badAverage = average(bad)
  if (goodAverage - badAverage < MEANINGFUL_DIFFERENCE_MINUTES) return null
  return "Op dagen waarop je langer sliep, gaf je in jouw gegevens vaker aan dat je je uitgerust voelde."
}

/**
 * One optional, hedged reflection line combining last night's sleep with
 * today's check-in energy when both are available — the exact "korte nacht
 * + weinig energie" pairing from the product brief — falling back to a
 * sleep-only reflection when there's no check-in (yet) to cross-reference.
 * Never medical causality, always "misschien".
 */
export function pickSleepObservation({
  durationMinutes,
  wakeFeeling,
  energy,
}: {
  durationMinutes: number | null
  wakeFeeling: string | null
  energy: number | null
}): string | null {
  const isShortNight = durationMinutes !== null && durationMinutes < SHORT_NIGHT_MINUTES
  const isTiredWaking = wakeFeeling === "moe" || wakeFeeling === "erg_moe"
  const isLowEnergy = energy !== null && energy <= 2

  if ((isShortNight || isTiredWaking) && isLowEnergy) {
    return "Je gaf vandaag aan weinig energie te hebben, en hebt vannacht relatief kort geslapen. Misschien is extra rust vandaag fijn."
  }
  if (isShortNight || isTiredWaking) {
    return "Je hebt vannacht relatief kort geslapen. Misschien is het vandaag extra fijn om goed naar je energie te luisteren."
  }

  const isLongNight = durationMinutes !== null && durationMinutes >= 7 * 60
  const isRestedWaking = wakeFeeling === "uitgerust" || wakeFeeling === "redelijk_uitgerust"
  if (isLongNight || isRestedWaking) {
    return "Je hebt lekker geslapen. Misschien merk je vandaag wat meer ruimte voor energie."
  }

  return null
}

/**
 * Cross-references her sleep log with her check-in symptoms over the same
 * dates (a sleep_entries row and a daily_checkins row on the same date both
 * describe "last night + today") to surface things like "je gaf vaker
 * hoofdpijn aan na een korte nacht dan na een langere nacht" — the sleep
 * equivalent of the phase/symptom cycle insight. Requires enough nights in
 * BOTH the short and normal-length groups before comparing, so a single
 * rough night can never look like a "pattern".
 */
export interface SleepSymptomCheckinLike {
  date: string
  symptoms: string[]
}

export interface SleepSymptomInsight {
  symptom: string
  shortSleepOccurrences: number
  shortSleepNights: number
  normalSleepOccurrences: number
  normalSleepNights: number
}

const MIN_NIGHTS_PER_SLEEP_GROUP = 4
const MEANINGFUL_RATE_DIFFERENCE = 0.25
const IGNORED_SYMPTOMS = new Set(["Geen klachten", "Anders"])

/**
 * @param entries Sleep log entries, any order.
 * @param checkins Daily check-ins with logged symptoms, any order.
 */
export function computeSleepSymptomInsights(
  entries: SleepEntryLike[],
  checkins: SleepSymptomCheckinLike[],
): SleepSymptomInsight[] {
  const durationByDate = new Map<string, number>()
  for (const e of withDuration(entries)) durationByDate.set(e.date, e.durationMinutes)

  const shortNights = new Set<string>()
  const normalNights = new Set<string>()
  for (const [date, minutes] of durationByDate) {
    if (minutes < SHORT_NIGHT_MINUTES) shortNights.add(date)
    else normalNights.add(date)
  }

  if (shortNights.size < MIN_NIGHTS_PER_SLEEP_GROUP || normalNights.size < MIN_NIGHTS_PER_SLEEP_GROUP) {
    return []
  }

  const shortCounts = new Map<string, number>()
  const normalCounts = new Map<string, number>()
  for (const checkin of checkins) {
    const inShortGroup = shortNights.has(checkin.date)
    const inNormalGroup = normalNights.has(checkin.date)
    if (!inShortGroup && !inNormalGroup) continue
    const counts = inShortGroup ? shortCounts : normalCounts
    for (const symptom of checkin.symptoms) {
      if (IGNORED_SYMPTOMS.has(symptom)) continue
      counts.set(symptom, (counts.get(symptom) ?? 0) + 1)
    }
  }

  const allSymptoms = new Set([...shortCounts.keys(), ...normalCounts.keys()])
  const insights: SleepSymptomInsight[] = []
  for (const symptom of allSymptoms) {
    const shortSleepOccurrences = shortCounts.get(symptom) ?? 0
    const normalSleepOccurrences = normalCounts.get(symptom) ?? 0
    const shortRate = shortSleepOccurrences / shortNights.size
    const normalRate = normalSleepOccurrences / normalNights.size
    if (shortRate - normalRate < MEANINGFUL_RATE_DIFFERENCE) continue
    insights.push({
      symptom,
      shortSleepOccurrences,
      shortSleepNights: shortNights.size,
      normalSleepOccurrences,
      normalSleepNights: normalNights.size,
    })
  }

  return insights.sort(
    (a, b) => b.shortSleepOccurrences / b.shortSleepNights - a.shortSleepOccurrences / a.shortSleepNights,
  )
}

export function formatSleepSymptomInsight(insight: SleepSymptomInsight): string {
  return `In jouw gegevens gaf je "${symptomLabel(insight.symptom).toLowerCase()}" vaker aan na een korte nacht (${insight.shortSleepOccurrences} van ${insight.shortSleepNights} korte nachten) dan na een langere nacht (${insight.normalSleepOccurrences} van ${insight.normalSleepNights}) — mogelijk een patroon dat bij jou past.`
}
