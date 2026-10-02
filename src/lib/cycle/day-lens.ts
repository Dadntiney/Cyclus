import type { CyclePhase } from "@/lib/cycle/estimate"

/**
 * Two small "lenses" that decide whose story leads on a given day:
 *
 * 1. `isLowDay` — her own check-in says tired / in need of rest. Then her
 *    signal wins over the phase's generic "more energy" framing, everywhere
 *    on Vandaag (roadmap, phase line, buddy quote) and in Jouw verhaal.
 * 2. `usesChangingCycleLens` — for women 40+ with an irregular cycle or
 *    overgang-signals, a calendar phase (e.g. "Ovulatie") is a rough guess at
 *    best. Then copy leads with "your cycle is changing" instead of a confident
 *    phase claim.
 *
 * Both are derived at render time — nothing is written to her profile.
 */

/** Symptoms that make "more energy in this phase" read as tone-deaf. */
const TIRING_SYMPTOMS = new Set([
  "Vermoeidheid",
  "Slecht slapen",
  "Nachtelijk zweten",
  "Hoofdpijn",
  "Krampen",
  "Buikpijn",
  "Brain fog",
  "Overprikkeld",
])

const OVERGANG_SYMPTOMS = new Set(["Opvliegers", "Nachtelijk zweten"])

export interface DayCheckinSignal {
  energy?: number | null
  mood?: number | null
  stress?: number | null
  symptoms?: string[] | null
  needs?: string[] | null
}

export function isLowDay(checkin: DayCheckinSignal | null | undefined): boolean {
  if (!checkin) return false
  const needs = checkin.needs ?? []
  if (needs.includes("rust") || needs.includes("mezelf")) return true
  if (checkin.energy != null && checkin.energy <= 2) return true
  if (checkin.mood != null && checkin.mood <= 2) return true
  if (checkin.stress != null && checkin.stress >= 4) return true
  return (checkin.symptoms ?? []).some((s) => TIRING_SYMPTOMS.has(s))
}

/**
 * Low-day majority over her recent check-ins (e.g. the last week) — used by
 * Jouw verhaal, which looks a few days ahead rather than at one day.
 */
export function mostlyLowRecently(
  checkins: DayCheckinSignal[],
  minCheckins = 1,
): boolean {
  if (checkins.length < minCheckins) return false
  const low = checkins.filter((c) => isLowDay(c)).length
  return low * 2 >= checkins.length
}

export interface ChangingCycleInput {
  lifeStage?: string | null
  age?: number | null
  regularity?: string | null
  perimenopauseInfo?: string | null
  /** Symptoms from recent check-ins (any order, duplicates fine). */
  recentSymptoms?: string[] | null
}

export function usesChangingCycleLens(input: ChangingCycleInput): boolean {
  const { lifeStage, age, regularity, perimenopauseInfo, recentSymptoms } = input
  if (lifeStage === "veranderend" || lifeStage === "perimenopauze") return true
  // She told us explicitly — respect it.
  if (lifeStage === "regelmatig" || lifeStage === "menopauze") return false
  if (age == null || age < 40) return false
  return (
    regularity === "onregelmatig" ||
    Boolean(perimenopauseInfo?.trim()) ||
    (recentSymptoms ?? []).some((s) => OVERGANG_SYMPTOMS.has(s))
  )
}

/** Short phase line under the phase name on Vandaag. */
export function phaseTagline(
  phase: CyclePhase,
  opts: { lowDay?: boolean; changingCycle?: boolean } = {},
): string {
  if (opts.lowDay) return "Hoe jij je voelt, telt vandaag het zwaarst."
  if (opts.changingCycle) {
    return "Bij een wisselende cyclus is de fase een ruwe schatting."
  }
  return PHASE_TAGLINE[phase]
}

const PHASE_TAGLINE: Record<CyclePhase, string> = {
  menstruatie: "Een moment om het rustiger aan te doen.",
  folliculair: "Je energie bouwt zich vaak op in deze fase.",
  ovulatie: "Voor veel vrouwen een piek in energie.",
  luteaal: "Je lichaam bouwt rustig toe naar rust.",
}

/** One short "why" per phase for the roadmap card when there's no check-in. */
export const PHASE_SHORT_WHY: Record<CyclePhase, string> = {
  menstruatie: "Tijdens je menstruatie zijn je hormonen op hun laagst; veel vrouwen hebben dan meer behoefte aan rust.",
  folliculair: "Na je menstruatie stijgt oestrogeen weer; veel vrouwen merken dat hun energie langzaam terugkomt.",
  ovulatie: "Rond de eisprong voelen veel vrouwen zich wat energieker, al verschilt dat sterk per persoon.",
  luteaal: "In deze fase stijgt progesteron; sommige vrouwen merken meer behoefte aan rust en regelmaat.",
}

export const CHANGING_CYCLE_WHY =
  "Rond de overgang schommelen hormonen vaak grilliger, dus je dag kan anders voelen dan de fase doet vermoeden."
