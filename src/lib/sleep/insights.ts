import { computeSleepDurationMinutes } from "@/lib/sleep/duration"

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
  const isShortNight = durationMinutes !== null && durationMinutes < 6 * 60
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
