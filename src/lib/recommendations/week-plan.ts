import { addDays, format } from "date-fns"
import { nl } from "date-fns/locale"
import type { Tables } from "@/types/database"
import { estimateCycle, type CycleEstimate } from "@/lib/cycle/estimate"
import { getPhaseContent } from "@/lib/cycle/phase-content"
import { buildWeeklyProgram, type DayFocus } from "@/lib/recommendations/weekly-program"

export type WeekPlanWorkout = Pick<Tables<"workouts">, "id" | "title" | "type" | "duration" | "difficulty">
export type WeekPlanRecipe = Pick<
  Tables<"recipes">,
  "id" | "title" | "category" | "preparation_time" | "ingredients" | "nutrition_information"
>
type Workout = WeekPlanWorkout
type Recipe = WeekPlanRecipe
type Profile = Tables<"profiles">
type CycleProfile = Pick<Tables<"cycle_profiles">, "last_period_start" | "average_cycle_length" | "has_cycle">

export type MealSlot = "ontbijt" | "lunch" | "diner"

const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  ontbijt: "Ontbijt",
  lunch: "Lunch",
  diner: "Diner",
}

const MEAL_SLOT_CATEGORY: Record<MealSlot, string> = {
  ontbijt: "Ontbijt",
  lunch: "Lunch",
  diner: "Diner",
}

export interface WeekMealSlot {
  slot: MealSlot
  label: string
  recipe: Recipe | null
}

export interface WeekWorkoutSlot {
  focus: DayFocus
  workout: Workout | null
  reason: string
}

export interface WeekDayPlan {
  date: string
  weekday: string
  weekdayShort: string
  isToday: boolean
  isPast: boolean
  cycleEstimate: CycleEstimate | null
  meals: WeekMealSlot[]
  workout: WeekWorkoutSlot
  focusTips: string[]
}

export interface BuildWeekPlanInput {
  weekStart: Date
  today: Date
  profile: Pick<
    Profile,
    "training_frequency" | "health_conditions" | "movement_limitations" | "nutrition_preferences" | "nutrition_style"
  >
  cycleProfile: CycleProfile | null
  workouts: Workout[]
  recipes: Recipe[]
  seed: string
}

function seededIndex(seed: string, length: number): number {
  if (length <= 0) return 0
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % length
}

function pickMeal(
  slot: MealSlot,
  recipes: Recipe[],
  dietPrefs: string[],
  preferredCategories: string[],
  seed: string,
): Recipe | null {
  let candidates = recipes.filter((r) => r.category.includes(MEAL_SLOT_CATEGORY[slot]))
  if (!candidates.length) candidates = recipes

  if (dietPrefs.length) {
    const dietMatch = candidates.filter((r) => r.category.some((c) => dietPrefs.includes(c)))
    if (dietMatch.length) candidates = dietMatch
  }

  if (preferredCategories.length) {
    const phaseMatch = candidates.filter((r) => r.category.some((c) => preferredCategories.includes(c)))
    if (phaseMatch.length) candidates = phaseMatch
  }

  if (!candidates.length) return null
  return candidates[seededIndex(seed, candidates.length)]
}

/**
 * Builds a full Monday-Sunday plan: per day, the estimated cycle phase (each
 * day gets its own estimate — a week can span a phase change), a suggested
 * breakfast/lunch/dinner, a workout slot (from the existing weekly-program
 * generator, tilted gentler on menstruation days), and 1-2 rotating focus
 * tips drawn from that day's phase content. Nothing here is persisted — like
 * the rest of the recommendation engine, it's a deterministic, seeded
 * computation so the same day always gets the same suggestion until the
 * user's own data (profile, check-ins) changes.
 */
export function buildWeekPlan(input: BuildWeekPlanInput): WeekDayPlan[] {
  const { weekStart, today, profile, cycleProfile, workouts, recipes, seed } = input
  const todayISO = format(today, "yyyy-MM-dd")

  const gentlerDayIndexes = new Set<number>()
  const phaseByIndex: (CycleEstimate | null)[] = []
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i)
    const estimate = cycleProfile
      ? estimateCycle(cycleProfile.last_period_start, cycleProfile.average_cycle_length, cycleProfile.has_cycle, date)
      : null
    phaseByIndex.push(estimate)
    if (estimate && getPhaseContent(estimate.phase).movement.preferGentler) {
      gentlerDayIndexes.add(i)
    }
  }

  const program = buildWeeklyProgram({
    frequency: profile.training_frequency ?? 3,
    healthConditions: profile.health_conditions ?? [],
    movementLimitations: profile.movement_limitations ?? [],
    workouts,
    seed: `${seed}-weekprogram`,
    gentlerDayIndexes,
  })

  const dietPrefs = (profile.nutrition_preferences ?? []).filter((p) => p !== "Geen voorkeur")

  return program.map((day, i) => {
    const date = addDays(weekStart, i)
    const dateISO = format(date, "yyyy-MM-dd")
    const cycleEstimate = phaseByIndex[i]
    const phaseContent = cycleEstimate ? getPhaseContent(cycleEstimate.phase) : null

    const meals: WeekMealSlot[] = (["ontbijt", "lunch", "diner"] as MealSlot[]).map((slot) => ({
      slot,
      label: MEAL_SLOT_LABELS[slot],
      recipe: pickMeal(
        slot,
        recipes,
        dietPrefs,
        phaseContent?.nutrition.recipeCategories ?? [],
        `${seed}-${dateISO}-${slot}`,
      ),
    }))

    let workoutReason = "Onderdeel van je weekprogramma."
    if (day.focus === "rust") {
      workoutReason = "Een geplande rustdag."
    } else if (phaseContent?.movement.preferGentler) {
      workoutReason = `Iets rustiger getild vanwege de ${phaseContent.label.toLowerCase()}.`
    }

    const focusTips: string[] = []
    if (phaseContent) {
      const tips = phaseContent.lifestyleTips
      const first = tips[seededIndex(`${seed}-${dateISO}-tip1`, tips.length)]
      if (first) focusTips.push(`${first.title}: ${first.text}`)
    }

    return {
      date: dateISO,
      weekday: format(date, "EEEE", { locale: nl }),
      weekdayShort: format(date, "EEEEEE", { locale: nl }).toUpperCase(),
      isToday: dateISO === todayISO,
      isPast: dateISO < todayISO,
      cycleEstimate,
      meals,
      workout: { focus: day.focus, workout: day.workout, reason: workoutReason },
      focusTips,
    }
  })
}
