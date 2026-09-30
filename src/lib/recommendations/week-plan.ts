import { addDays, format } from "date-fns"
import { nl } from "date-fns/locale"
import type { Tables } from "@/types/database"
import { estimateCycle, type CycleEstimate } from "@/lib/cycle/estimate"
import { getPhaseContent, getDailyPhaseSnackTip, getDailyPhaseHydrationTip, type PhaseSnackTip, type PhaseHydrationTip } from "@/lib/cycle/phase-content"
import { buildWeeklyProgram, type DayFocus } from "@/lib/recommendations/weekly-program"
import { filterRecipesForNutritionPrefs } from "@/lib/nutrition/dislikes"
import { dietPrefsForCategoryMatch, filterRecipesByCuisinePrefs } from "@/lib/nutrition/cuisine"

export type WeekPlanWorkout = Pick<
  Tables<"workouts">,
  "id" | "title" | "type" | "duration" | "difficulty" | "image_url"
>
export type WeekPlanRecipe = Pick<
  Tables<"recipes">,
  | "id"
  | "title"
  | "category"
  | "preparation_time"
  | "servings"
  | "ingredients"
  | "nutrition_information"
  | "image_url"
>
type Workout = WeekPlanWorkout
type Recipe = WeekPlanRecipe
type Profile = Tables<"profiles">
type CycleProfile = Pick<
  Tables<"cycle_profiles">,
  "last_period_start" | "average_cycle_length" | "average_period_length" | "has_cycle"
>

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
  /**
   * Personal forward-looking note when this day falls in her anticipated
   * harder stretch — see composeAnticipation. Null on ordinary days.
   */
  anticipationNote: string | null
  /** Phase snack tip for this day — null when no cycle phase known. */
  snackTip: PhaseSnackTip | null
  /** Soft hydration tip for this day — null when no cycle phase known. */
  hydrationTip: PhaseHydrationTip | null
}

export interface BuildWeekPlanInput {
  weekStart: Date
  today: Date
  profile: Pick<
    Profile,
    | "training_frequency"
    | "health_conditions"
    | "movement_limitations"
    | "training_preferences"
    | "nutrition_preferences"
    | "nutrition_style"
    | "disliked_foods"
    | "food_allergies"
  >
  cycleProfile: CycleProfile | null
  workouts: Workout[]
  recipes: Recipe[]
  seed: string
  /**
   * Dates (ISO) from composeAnticipation.softDates — those days get a
   * gentler workout tilt and a personal focus tip.
   */
  anticipationSoftDates?: string[]
  anticipationTip?: string | null
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
  allergies: string[],
  dislikedFoods: string[],
  nutritionPreferences: string[],
  seed: string,
  /**
   * Hard ban — e.g. anything served yesterday. Only ignored when it would
   * empty the pool (tiny breakfast catalogues).
   */
  excludeIds: Set<string> = new Set(),
  /**
   * Soft ban — already used earlier this week. Applied only when enough
   * alternatives remain after the hard exclude.
   */
  softExcludeIds: Set<string> = new Set(),
): Recipe | null {
  const availableRecipes = filterRecipesByCuisinePrefs(
    filterRecipesForNutritionPrefs(recipes, allergies, dislikedFoods),
    nutritionPreferences,
  )

  let candidates = availableRecipes.filter((r) => r.category.includes(MEAL_SLOT_CATEGORY[slot]))
  if (!candidates.length) candidates = availableRecipes

  if (dietPrefs.length) {
    const dietMatch = candidates.filter((r) => r.category.some((c) => dietPrefs.includes(c)))
    if (dietMatch.length) candidates = dietMatch
  }

  if (preferredCategories.length) {
    const phaseMatch = candidates.filter((r) => r.category.some((c) => preferredCategories.includes(c)))
    if (phaseMatch.length) candidates = phaseMatch
  }

  if (!candidates.length) return null

  const withoutYesterday = candidates.filter((r) => !excludeIds.has(r.id))
  let pool = withoutYesterday.length ? withoutYesterday : candidates

  const withoutEarlierInWeek = pool.filter((r) => !softExcludeIds.has(r.id))
  if (withoutEarlierInWeek.length) pool = withoutEarlierInWeek

  return pool[seededIndex(seed, pool.length)]
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
  const {
    weekStart,
    today,
    profile,
    cycleProfile,
    workouts,
    recipes,
    seed,
    anticipationSoftDates = [],
    anticipationTip = null,
  } = input
  const todayISO = format(today, "yyyy-MM-dd")
  const softDateSet = new Set(anticipationSoftDates)

  const gentlerDayIndexes = new Set<number>()
  const phaseByIndex: (CycleEstimate | null)[] = []
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i)
    const dateISO = format(date, "yyyy-MM-dd")
    const estimate = cycleProfile
      ? estimateCycle(
          cycleProfile.last_period_start,
          cycleProfile.average_cycle_length,
          cycleProfile.has_cycle,
          date,
          cycleProfile.average_period_length,
        )
      : null
    phaseByIndex.push(estimate)
    if (
      softDateSet.has(dateISO) ||
      (estimate && getPhaseContent(estimate.phase).movement.preferGentler)
    ) {
      gentlerDayIndexes.add(i)
    }
  }

  const program = buildWeeklyProgram({
    frequency: profile.training_frequency ?? 3,
    healthConditions: profile.health_conditions ?? [],
    movementLimitations: profile.movement_limitations ?? [],
    trainingPreferences: profile.training_preferences ?? [],
    workouts,
    seed: `${seed}-weekprogram`,
    gentlerDayIndexes,
  })

  const nutritionPreferences = profile.nutrition_preferences ?? []
  const dietPrefs = dietPrefsForCategoryMatch(nutritionPreferences)
  const allergies = profile.food_allergies ?? []
  const dislikedFoods = profile.disliked_foods ?? []
  const slots = ["ontbijt", "lunch", "diner"] as MealSlot[]

  // Track picks so we never serve the same dish two days in a row, and
  // prefer fresh recipes across the week when the catalogue allows it.
  const usedEarlierInWeek = new Set<string>()
  let previousDayRecipeIds = new Set<string>()

  return program.map((day, i) => {
    const date = addDays(weekStart, i)
    const dateISO = format(date, "yyyy-MM-dd")
    const cycleEstimate = phaseByIndex[i]
    const phaseContent = cycleEstimate ? getPhaseContent(cycleEstimate.phase) : null

    const todayRecipeIds = new Set<string>()
    const meals: WeekMealSlot[] = slots.map((slot) => {
      const recipe = pickMeal(
        slot,
        recipes,
        dietPrefs,
        phaseContent?.nutrition.recipeCategories ?? [],
        allergies,
        dislikedFoods,
        nutritionPreferences,
        `${seed}-${dateISO}-${slot}`,
        previousDayRecipeIds,
        new Set([...usedEarlierInWeek, ...todayRecipeIds]),
      )
      if (recipe) todayRecipeIds.add(recipe.id)
      return {
        slot,
        label: MEAL_SLOT_LABELS[slot],
        recipe,
      }
    })

    for (const id of todayRecipeIds) usedEarlierInWeek.add(id)
    previousDayRecipeIds = todayRecipeIds

    const isAnticipated = softDateSet.has(dateISO)

    let workoutReason = "Onderdeel van je weekprogramma."
    if (day.focus === "rust") {
      workoutReason = "Een geplande rustdag."
    } else if (isAnticipated) {
      workoutReason = "Iets rustiger getild — rond deze dagen valt het bij jou vaker zwaarder."
    } else if (phaseContent?.movement.preferGentler) {
      workoutReason = `Iets rustiger getild vanwege de ${phaseContent.label.toLowerCase()}.`
    }

    const focusTips: string[] = []
    if (isAnticipated && anticipationTip) {
      focusTips.push(anticipationTip)
    } else if (phaseContent) {
      const tips = phaseContent.lifestyleTips
      const first = tips[seededIndex(`${seed}-${dateISO}-tip1`, tips.length)]
      if (first) focusTips.push(`${first.title}: ${first.text}`)
    }

    const snackTip = cycleEstimate
      ? getDailyPhaseSnackTip(cycleEstimate.phase, `${seed}-${dateISO}`)
      : null

    const hydrationTip = cycleEstimate
      ? getDailyPhaseHydrationTip(cycleEstimate.phase, `${seed}-${dateISO}`)
      : null

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
      anticipationNote: isAnticipated ? anticipationTip : null,
      snackTip,
      hydrationTip,
    }
  })
}
