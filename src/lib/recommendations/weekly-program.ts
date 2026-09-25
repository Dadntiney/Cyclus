import type { Tables } from "@/types/database"

type Workout = Pick<Tables<"workouts">, "id" | "title" | "type" | "duration" | "difficulty">

export type DayFocus = "kracht" | "cardio" | "mobiliteit" | "herstel" | "rust"

export interface ProgramDay {
  weekday: string
  focus: DayFocus
  workout: Workout | null
}

const WEEKDAYS = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"]

// Which weekdays (0=Mon..6=Sun) get an active session for a given weekly
// frequency, spread out rather than clustered together.
const ACTIVE_DAY_SLOTS: Record<number, number[]> = {
  1: [3],
  2: [1, 4],
  3: [0, 2, 4],
  4: [0, 1, 3, 5],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6],
}

type ActiveFocus = Exclude<DayFocus, "rust">

// The sequence of focuses for the active days, per frequency — mixes
// strength, cardio, mobility and recovery instead of repeating one type.
const FOCUS_TEMPLATES: Record<number, ActiveFocus[]> = {
  1: ["kracht"],
  2: ["kracht", "cardio"],
  3: ["kracht", "cardio", "mobiliteit"],
  4: ["kracht", "cardio", "kracht", "mobiliteit"],
  5: ["kracht", "cardio", "kracht", "mobiliteit", "cardio"],
  6: ["kracht", "cardio", "kracht", "mobiliteit", "cardio", "herstel"],
  7: ["kracht", "cardio", "kracht", "mobiliteit", "cardio", "herstel", "kracht"],
}

const FOCUS_TYPES: Record<ActiveFocus, string[]> = {
  kracht: ["krachttraining"],
  cardio: ["wandelen", "fietsen", "hardlopen"],
  mobiliteit: ["mobiliteit", "yoga", "pilates"],
  herstel: ["mobiliteit"],
}

const IMPACT_SENSITIVE_TAGS = [
  "Rugklachten",
  "Knieklachten",
  "Gewrichtsklachten",
  "Verminderde botdichtheid",
  "Kan niet springen of high-impact bewegen",
]

function seededIndex(seed: string, length: number): number {
  if (length <= 0) return 0
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % length
}

export interface BuildWeeklyProgramInput {
  frequency: number
  healthConditions: string[]
  movementLimitations: string[]
  workouts: Workout[]
  seed: string
  /** Prefer short (<=10 min) sessions on more days, for a busier week. */
  preferShort?: boolean
  /**
   * Weekday indexes (0=Mon..6=Sun) to lean toward gentler (`makkelijk`)
   * workouts for — used by the week overview to reflect that many people
   * prefer lower-intensity movement during menstruation/late luteal days.
   * Never turns an active day into a rest day; only tilts which workout
   * within that day's focus gets picked.
   */
  gentlerDayIndexes?: Set<number>
}

/**
 * Builds a full 7-day week: `frequency` days get a matching workout
 * (mixing strength/cardio/mobility/recovery and short/medium/long
 * durations), the rest are explicit rest days.
 */
export function buildWeeklyProgram(input: BuildWeeklyProgramInput): ProgramDay[] {
  const { frequency, healthConditions, movementLimitations, workouts, seed, preferShort, gentlerDayIndexes } = input
  const clampedFrequency = Math.min(7, Math.max(1, Math.round(frequency)))
  const activeDays = new Set(ACTIVE_DAY_SLOTS[clampedFrequency])
  const focusSequence = FOCUS_TEMPLATES[clampedFrequency]

  const impactSensitive =
    healthConditions.some((c) => IMPACT_SENSITIVE_TAGS.includes(c)) ||
    movementLimitations.some((c) => IMPACT_SENSITIVE_TAGS.includes(c))

  const usedIds = new Set<string>()
  let activeIndex = 0

  return WEEKDAYS.map((weekday, dayIdx) => {
    if (!activeDays.has(dayIdx)) {
      return { weekday, focus: "rust" as const, workout: null }
    }

    const focus = focusSequence[activeIndex] ?? "kracht"
    activeIndex += 1

    let candidates = workouts.filter((w) => FOCUS_TYPES[focus].includes(w.type))
    if (impactSensitive) {
      const gentler = candidates.filter((w) => w.type !== "hardlopen" && w.difficulty !== "pittig")
      if (gentler.length) candidates = gentler
    }
    if (focus === "herstel" || preferShort) {
      const short = candidates.filter((w) => w.duration <= 10)
      if (short.length) candidates = short
    }
    if (gentlerDayIndexes?.has(dayIdx)) {
      const gentle = candidates.filter((w) => w.difficulty === "makkelijk")
      if (gentle.length) candidates = gentle
    }

    // Prefer a workout not already used this week, for variety.
    const unused = candidates.filter((w) => !usedIds.has(w.id))
    const pool = unused.length ? unused : candidates
    const workout = pool.length ? pool[seededIndex(`${seed}-${weekday}`, pool.length)] : null
    if (workout) usedIds.add(workout.id)

    return { weekday, focus, workout }
  })
}
