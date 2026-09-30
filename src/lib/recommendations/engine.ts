import type { Tables } from "@/types/database"
import type { CycleEstimate } from "@/lib/cycle/estimate"
import { getDailyPhaseSnackTip, getDailyPhaseHydrationTip, type PhaseSnackTip, type PhaseHydrationTip } from "@/lib/cycle/phase-content"
import { TRAINING_PREFERENCE_TO_TYPE, symptomLabel } from "@/lib/constants"
import { SHORT_NIGHT_MINUTES } from "@/lib/sleep/insights"
import { filterRecipesForNutritionPrefs } from "@/lib/nutrition/dislikes"
import { dietPrefsForCategoryMatch, filterRecipesByCuisinePrefs } from "@/lib/nutrition/cuisine"
import {
  lifeStageIsPostCycle,
  lifeStageLabelForBuddy,
  lifeStagePrefersGentler,
} from "@/lib/recommendations/life-stage-bias"

/** The single strongest sleep/symptom correlation from her history (see
 * computeSleepSymptomInsights) — just enough to personalize today's
 * wording when it actually applies, not the full insight shape. */
export interface PersonalSleepPattern {
  symptom: string
}

type Workout = Pick<Tables<"workouts">, "id" | "title" | "type" | "duration" | "difficulty" | "image_url">
type Recipe = Pick<
  Tables<"recipes">,
  "id" | "title" | "category" | "preparation_time" | "nutrition_information" | "image_url"
>
type Profile = Tables<"profiles">
type Checkin = Tables<"daily_checkins">

export interface RecommendationInput {
  profile: Pick<
    Profile,
    | "name"
    | "goals"
    | "training_preferences"
    | "nutrition_preferences"
    | "nutrition_style"
    | "disliked_foods"
    | "food_allergies"
    | "health_conditions"
    | "movement_limitations"
    | "wellness_preference"
    | "movement_enabled"
    | "nutrition_enabled"
    | "mental_wellbeing_enabled"
  >
  cycleEstimate: CycleEstimate | null
  latestCheckin: Pick<Checkin, "energy" | "mood" | "sleep" | "stress" | "symptoms" | "needs"> | null
  /** Last night's tracked sleep duration, if she has sleep tracking on and filled it in. */
  todaySleepDurationMinutes?: number | null
  /** The strongest sleep/symptom pattern from her history, if any cleared the bar — see computeSleepSymptomInsights. */
  personalSleepPattern?: PersonalSleepPattern | null
  workouts: Workout[]
  recipes: Recipe[]
  seed: string
  /** Self-chosen life stage — soft tilt on movement/copy, never a diagnosis. */
  lifeStage?: string | null
  hasCycle?: boolean | null
  /**
   * Today's row from buildWeekPlan — meals stay aligned with Deze week;
   * workout may soften further when today's check-in/sleep asks for it.
   */
  dayPlan?: {
    meals: Array<{
      slot: "ontbijt" | "lunch" | "diner"
      label: string
      recipe: Recipe | null
    }>
    workout: { workout: Workout | null; reason: string }
  } | null
}

export interface TrainingRecommendation {
  workout: Workout | null
  reason: string
}

export interface TrainingPickInput {
  profile: Pick<Profile, "training_preferences" | "health_conditions" | "movement_limitations">
  latestCheckin: Pick<Checkin, "energy" | "mood" | "sleep" | "stress" | "symptoms" | "needs"> | null
  todaySleepDurationMinutes?: number | null
  personalSleepPattern?: PersonalSleepPattern | null
  workouts: Workout[]
  seed: string
}

export interface NutritionRecommendation {
  /** Week-plan meals for today (ontbijt → lunch → diner). Source of truth with Deze week. */
  meals: Array<{
    slot: "ontbijt" | "lunch" | "diner"
    label: string
    recipe: Recipe | null
  }>
  /** @deprecated Prefer meals — kept as the first available recipe for callers. */
  recipe: Recipe | null
  reason: string
  /** Phase-based tussendoor tip with “why” — null when no cycle estimate. */
  snackTip: PhaseSnackTip | null
  /** Soft daily hydration reminder when cycle phase is known. */
  hydrationTip: PhaseHydrationTip | null
}

export interface NutritionPickInput {
  profile: Pick<Profile, "nutrition_preferences" | "nutrition_style" | "disliked_foods" | "food_allergies">
  latestCheckin: Pick<Checkin, "needs"> | null
  recipes: Recipe[]
  seed: string
}

export interface RecoveryRecommendation {
  title: string
  duration: number
  description: string
  /** Deep link when Mentale rust is enabled — keeps the card actionable. */
  href?: string
  ctaLabel?: string
}

export interface Recommendation {
  training: TrainingRecommendation
  nutrition: NutritionRecommendation
  recovery: RecoveryRecommendation
  dayFocus: string
  buddyContext: string[]
  movementEnabled: boolean
  nutritionEnabled: boolean
}

// Tags that suggest gentler, lower-impact movement is more appropriate —
// informational, never a diagnosis; just steers away from high-impact types.
const IMPACT_SENSITIVE_TAGS = [
  "Rugklachten",
  "Knieklachten",
  "Gewrichtsklachten",
  "Verminderde botdichtheid",
  "Kan niet springen of high-impact bewegen",
]

// Small, deterministic hash so the same person sees a stable pick per day
// (seeded by user id + date) instead of always the first item in the list.
function seededIndex(seed: string, length: number): number {
  if (length <= 0) return 0
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % length
}

/** True when today's short night matches a symptom she's historically more
 * likely to report after a short night — the one place a multi-day pattern
 * (not just today's data) can steer today's advice. */
function shortNightMatchesPersonalPattern(
  todaySleepDurationMinutes: number | null | undefined,
  personalSleepPattern: PersonalSleepPattern | null | undefined,
): boolean {
  return (
    Boolean(personalSleepPattern) &&
    todaySleepDurationMinutes !== null &&
    todaySleepDurationMinutes !== undefined &&
    todaySleepDurationMinutes < SHORT_NIGHT_MINUTES
  )
}

export function wantsLowerIntensityToday(
  checkin: RecommendationInput["latestCheckin"],
  todaySleepDurationMinutes?: number | null,
  personalSleepPattern?: PersonalSleepPattern | null,
): boolean {
  const lowEnergy = Boolean(checkin) && checkin!.energy !== null && checkin!.energy <= 2
  const highStress = Boolean(checkin) && checkin!.stress !== null && checkin!.stress >= 4
  const poorSleep = Boolean(checkin) && checkin!.sleep !== null && checkin!.sleep <= 2
  const needsRest = Boolean(checkin?.needs?.includes("rust"))
  return (
    lowEnergy ||
    highStress ||
    poorSleep ||
    needsRest ||
    shortNightMatchesPersonalPattern(todaySleepDurationMinutes, personalSleepPattern)
  )
}

function todaySoftenReason(
  checkin: RecommendationInput["latestCheckin"],
  todaySleepDurationMinutes: number | null | undefined,
  personalSleepPattern: PersonalSleepPattern | null | undefined,
  lifeStage: string | null | undefined,
  plannedTitle: string | null,
): string {
  const needs = checkin?.needs ?? []
  const matchesSleepPattern = shortNightMatchesPersonalPattern(
    todaySleepDurationMinutes,
    personalSleepPattern,
  )
  const plannedBit = plannedTitle ? `Je weekvoorstel was ${plannedTitle}. ` : ""

  if (needs.includes("rust")) {
    return `${plannedBit}Je gaf aan dat je naar rust verlangt — vandaag dus een zachtere sessie.`
  }
  if (matchesSleepPattern && personalSleepPattern) {
    return `${plannedBit}Je sliep vannacht relatief kort — bij jou hangt dat vaker samen met ${symptomLabel(personalSleepPattern.symptom).toLowerCase()}, dus iets zachter vandaag.`
  }
  if (checkin && checkin.energy !== null && checkin.energy <= 2) {
    return `${plannedBit}Je energie voelt laag vandaag — we buigen mee met een zachtere beweging.`
  }
  if (checkin && checkin.stress !== null && checkin.stress >= 4) {
    return `${plannedBit}Je stress is vandaag wat hoger — zachter bewegen past beter.`
  }
  if (checkin && checkin.sleep !== null && checkin.sleep <= 2) {
    return `${plannedBit}Je slaap voelde matig — we houden het vandaag lichter.`
  }
  if (lifeStagePrefersGentler(lifeStage)) {
    return `${plannedBit}Met jouw levensfase in gedachten houden we het bewegingsvoorstel liever zacht.`
  }
  return `${plannedBit}Vandaag past een rustigere sessie beter.`
}

/**
 * Keep week meals, but let today's body signals (and life stage) soften the
 * planned workout when the week row would otherwise ignore them.
 */
export function resolveTodaysTraining(input: {
  profile: TrainingPickInput["profile"]
  latestCheckin: TrainingPickInput["latestCheckin"]
  todaySleepDurationMinutes?: number | null
  personalSleepPattern?: PersonalSleepPattern | null
  workouts: Workout[]
  seed: string
  lifeStage?: string | null
  dayPlanWorkout?: { workout: Workout | null; reason: string } | null
}): TrainingRecommendation {
  const {
    profile,
    latestCheckin,
    todaySleepDurationMinutes,
    personalSleepPattern,
    workouts,
    seed,
    lifeStage = null,
    dayPlanWorkout = null,
  } = input

  if (!dayPlanWorkout) {
    return pickTodaysWorkout({
      profile,
      latestCheckin,
      todaySleepDurationMinutes,
      personalSleepPattern,
      workouts,
      seed,
    })
  }

  const planned = dayPlanWorkout.workout
  const plannedReason = dayPlanWorkout.reason
  const lowerIntensity = wantsLowerIntensityToday(
    latestCheckin,
    todaySleepDurationMinutes,
    personalSleepPattern,
  )
  const stageGentler = lifeStagePrefersGentler(lifeStage)
  const shouldSoften = lowerIntensity || stageGentler

  if (!planned) {
    return { workout: null, reason: plannedReason }
  }

  if (!shouldSoften) {
    return { workout: planned, reason: plannedReason }
  }

  const alreadyGentle = planned.difficulty === "makkelijk"
  if (alreadyGentle) {
    return {
      workout: planned,
      reason: lowerIntensity
        ? todaySoftenReason(
            latestCheckin,
            todaySleepDurationMinutes,
            personalSleepPattern,
            lifeStage,
            null,
          )
        : plannedReason,
    }
  }

  const softPick = pickTodaysWorkout({
    profile,
    latestCheckin: lowerIntensity
      ? latestCheckin
      : {
          energy: 2,
          mood: latestCheckin?.mood ?? null,
          sleep: latestCheckin?.sleep ?? null,
          stress: latestCheckin?.stress ?? null,
          symptoms: latestCheckin?.symptoms ?? [],
          needs: [...(latestCheckin?.needs ?? []), "rust"],
        },
    todaySleepDurationMinutes: lowerIntensity ? todaySleepDurationMinutes : null,
    personalSleepPattern: lowerIntensity ? personalSleepPattern : null,
    workouts,
    seed: `${seed}-soften`,
  })

  if (softPick.workout && softPick.workout.id !== planned.id) {
    return {
      workout: softPick.workout,
      reason: todaySoftenReason(
        latestCheckin,
        todaySleepDurationMinutes,
        personalSleepPattern,
        lifeStage,
        planned.title,
      ),
    }
  }

  return {
    workout: planned,
    reason: todaySoftenReason(
      latestCheckin,
      todaySleepDurationMinutes,
      personalSleepPattern,
      lifeStage,
      null,
    ),
  }
}

function parseCarbGrams(nutritionInformation: Recipe["nutrition_information"]): number | null {
  if (!nutritionInformation || typeof nutritionInformation !== "object") return null
  const value = (nutritionInformation as Record<string, unknown>).koolhydraten
  if (typeof value !== "string") return null
  const match = value.match(/[\d.]+/)
  return match ? Number(match[0]) : null
}

/**
 * Picks today's suggested workout. Shared by the Vandaag recommendation and
 * the Beweging page itself, seeded identically (`${userId}-${date}`) so both
 * surfaces land on the exact same pick instead of contradicting each other.
 */
export function pickTodaysWorkout(input: TrainingPickInput): TrainingRecommendation {
  const { profile, latestCheckin, todaySleepDurationMinutes, personalSleepPattern, workouts, seed } = input
  const needs = latestCheckin?.needs ?? []
  const wantsMoreActive = needs.includes("beweging")

  const rawPreferenceCount = profile.training_preferences.length
  const preferredTypes = profile.training_preferences
    .map((pref) => TRAINING_PREFERENCE_TO_TYPE[pref])
    .filter((type): type is string => Boolean(type))

  const lowerIntensity = wantsLowerIntensityToday(latestCheckin, todaySleepDurationMinutes, personalSleepPattern)
  const matchesSleepPattern = shortNightMatchesPersonalPattern(todaySleepDurationMinutes, personalSleepPattern)

  const impactSensitive = (profile.health_conditions ?? []).some((c) =>
    IMPACT_SENSITIVE_TAGS.includes(c),
  ) || (profile.movement_limitations ?? []).some((c) => IMPACT_SENSITIVE_TAGS.includes(c))

  // When she's set preferences, only ever show those types — even if none
  // of them happen to map to workout content yet (e.g. only "Zwemmen").
  // Falling back to the full library in that case would defeat the point
  // of choosing specific types. No preferences set at all keeps today's
  // default: show everything.
  let candidateWorkouts = rawPreferenceCount > 0
    ? workouts.filter((w) => preferredTypes.includes(w.type))
    : workouts

  if (impactSensitive) {
    const gentler = candidateWorkouts.filter((w) => w.type !== "hardlopen" && w.difficulty !== "pittig")
    if (gentler.length) candidateWorkouts = gentler
  }

  if (lowerIntensity) {
    const gentle = candidateWorkouts.filter((w) => w.difficulty === "makkelijk")
    if (gentle.length) candidateWorkouts = gentle
  } else if (wantsMoreActive) {
    const active = candidateWorkouts.filter((w) => w.difficulty !== "makkelijk")
    if (active.length) candidateWorkouts = active
  }

  if (!candidateWorkouts.length && rawPreferenceCount === 0) candidateWorkouts = workouts

  const workout = candidateWorkouts.length
    ? candidateWorkouts[seededIndex(`${seed}-training`, candidateWorkouts.length)]
    : null

  let reason: string
  if (!workout && rawPreferenceCount > 0) {
    reason = "We hebben nog geen passende workouts voor de bewegingsvorm(en) die je koos — pas dit aan in je profiel."
  } else if (lowerIntensity && needs.includes("rust")) {
    reason = "Je gaf aan dat je vandaag naar rust verlangt — een zachte sessie dus."
  } else if (lowerIntensity && matchesSleepPattern && personalSleepPattern) {
    reason = `Je sliep vannacht relatief kort — in jouw gegevens hangt dat vaker samen met ${symptomLabel(personalSleepPattern.symptom).toLowerCase()}, dus kozen we een zachtere sessie.`
  } else if (lowerIntensity) {
    reason = "Je energie, slaap of stress gaf aan dat een rustigere sessie vandaag beter past."
  } else if (wantsMoreActive) {
    reason = "Je gaf aan dat je vandaag zin hebt om te bewegen — hier is een actievere keuze."
  } else if (!latestCheckin) {
    reason = workout
      ? "Gebaseerd op je bewegingsvoorkeuren uit je profiel."
      : "Voeg je bewegingsvoorkeuren toe in je profiel voor een passend voorstel."
  } else if (impactSensitive) {
    reason = "Gekozen met oog voor de aandachtspunten uit je profiel."
  } else {
    reason = "Past bij je energie van vandaag en je bewegingsvoorkeuren."
  }

  return { workout, reason }
}

/**
 * Picks today's suggested recipe. Shared by the Vandaag recommendation and
 * the Voeding page itself, seeded identically so both surfaces agree.
 */
export function pickTodaysRecipe(
  input: NutritionPickInput,
): Pick<NutritionRecommendation, "meals" | "recipe" | "reason"> {
  const { profile, latestCheckin, recipes, seed } = input
  const wantsQuickMeal = Boolean(latestCheckin?.needs?.includes("voeding"))
  const nutritionPrefs = profile.nutrition_preferences ?? []
  const wantsLowCarb = profile.nutrition_style === "koolhydraatarm"

  const availableRecipes = filterRecipesByCuisinePrefs(
    filterRecipesForNutritionPrefs(recipes, profile.food_allergies, profile.disliked_foods),
    nutritionPrefs,
  )

  const dietPrefs = dietPrefsForCategoryMatch(nutritionPrefs)
  let candidateRecipes = dietPrefs.length
    ? availableRecipes.filter((r) => r.category.some((c) => dietPrefs.includes(c)))
    : availableRecipes

  if (!candidateRecipes.length) candidateRecipes = availableRecipes

  let reason: string
  if (wantsQuickMeal) {
    const quick = candidateRecipes.filter((r) => r.preparation_time !== null && r.preparation_time <= 20)
    if (quick.length) {
      candidateRecipes = quick
      reason = "Je gaf aan dat je zin had in gezond eten — dit maak je binnen 20 minuten."
    } else {
      reason = "Sluit aan bij jouw voedingsvoorkeuren."
    }
  } else if (wantsLowCarb) {
    const lowCarb = candidateRecipes.filter((r) => {
      const carbs = parseCarbGrams(r.nutrition_information)
      return carbs !== null && carbs <= 20
    })
    if (lowCarb.length) {
      candidateRecipes = lowCarb
      reason = "Een koolhydraatarme keuze, passend bij jouw voedingsvoorkeur."
    } else {
      reason = "Sluit het best aan bij jouw voorkeuren — bekijk de koolhydraatarme variant in het recept."
    }
  } else {
    reason = nutritionPrefs.length
      ? `Sluit aan bij jouw voedingsvoorkeuren (${nutritionPrefs.join(", ")}).`
      : "Een gebalanceerde maaltijd om je dag te ondersteunen."
  }

  const recipe = candidateRecipes.length
    ? candidateRecipes[seededIndex(`${seed}-nutrition`, candidateRecipes.length)]
    : null

  return {
    meals: recipe
      ? [{ slot: "diner" as const, label: "Voorstel", recipe }]
      : [],
    recipe,
    reason,
  }
}

export function buildRecommendation(input: RecommendationInput): Recommendation {
  const {
    profile,
    cycleEstimate,
    latestCheckin,
    todaySleepDurationMinutes,
    personalSleepPattern,
    workouts,
    recipes,
    seed,
    lifeStage = null,
    hasCycle = null,
    dayPlan = null,
  } = input

  const needs = latestCheckin?.needs ?? []
  const wantsMoreActive = needs.includes("beweging")
  const wantsSelfCare = needs.includes("mezelf")
  const lowerIntensity = wantsLowerIntensityToday(latestCheckin, todaySleepDurationMinutes, personalSleepPattern)
  const matchesSleepPattern = shortNightMatchesPersonalPattern(todaySleepDurationMinutes, personalSleepPattern)
  const stageGentler = lifeStagePrefersGentler(lifeStage)
  const postCycle = lifeStageIsPostCycle(lifeStage, hasCycle)

  // Meals stay on the week calendar; workout may soften for today's signals.
  const { workout, reason: trainingReason } = profile.movement_enabled
    ? resolveTodaysTraining({
        profile,
        latestCheckin,
        todaySleepDurationMinutes,
        personalSleepPattern,
        workouts,
        seed,
        lifeStage,
        dayPlanWorkout: dayPlan?.workout ?? null,
      })
    : { workout: null, reason: "" }

  const nutritionBase = profile.nutrition_enabled
    ? dayPlan
      ? {
          meals: dayPlan.meals,
          recipe: dayPlan.meals.find((m) => m.recipe)?.recipe ?? null,
          reason: "Zelfde weekplan als op Deze week.",
        }
      : pickTodaysRecipe({ profile, latestCheckin, recipes, seed })
    : { meals: [], recipe: null, reason: "" }

  const snackTip =
    profile.nutrition_enabled && cycleEstimate
      ? getDailyPhaseSnackTip(cycleEstimate.phase, seed)
      : null

  const hydrationTip = cycleEstimate
    ? getDailyPhaseHydrationTip(cycleEstimate.phase, seed)
    : null

  const nutrition: NutritionRecommendation = { ...nutritionBase, snackTip, hydrationTip }

  const mentalEnabled = profile.mental_wellbeing_enabled === true
  const recoveryCta = mentalEnabled
    ? { href: "/mentale-rust", ctaLabel: "Naar mentale rust" as const }
    : {}

  const recovery: RecoveryRecommendation = wantsSelfCare
    ? {
        title: "Tijd voor jezelf",
        duration: 15,
        description:
          "Je gaf aan dat je daar vandaag behoefte aan hebt. Neem een moment zonder schuldgevoel — een bad, een boek, of gewoon niets.",
        ...recoveryCta,
      }
    : lowerIntensity || stageGentler
      ? {
          title: "Zachte mobiliteit",
          duration: 10,
          description: stageGentler
            ? "In jouw fase mag herstel wat meer ruimte krijgen. Korte, rustige mobiliteit is al genoeg."
            : "Neem vandaag de tijd voor rustige mobiliteit en ademhaling. Luister naar wat je lichaam nodig heeft.",
          ...recoveryCta,
        }
      : {
          title: "Korte ontspanning",
          duration: 10,
          description:
            "Een paar minuten bewust ontspannen helpt je lichaam herstellen, ook op een goede dag.",
          ...recoveryCta,
        }

  const namePart = profile.name ? `, ${profile.name}` : ""
  // Don't restate cyclusdag/fase here — the phase hero above already does that.
  let dayFocus = postCycle
    ? `Luister vandaag naar hoe je je voelt en pas je tempo daarop aan${namePart} — zonder cycluskalender.`
    : `Luister vandaag naar hoe je je voelt en pas je tempo daarop aan${namePart}.`
  if (needs.includes("rust")) {
    dayFocus = `Je gaf aan dat je vandaag naar rust verlangt${namePart}. Wees zacht voor jezelf — dat is vandaag genoeg.`
  } else if (lowerIntensity && matchesSleepPattern && personalSleepPattern) {
    dayFocus = `Je sliep vannacht relatief kort${namePart} — in jouw gegevens hangt dat vaker samen met ${symptomLabel(personalSleepPattern.symptom).toLowerCase()}. Wees dus extra zacht voor jezelf vandaag.`
  } else if (lowerIntensity) {
    dayFocus = `Je gaf aan dat het vandaag wat minder gaat${namePart}. Wees zacht voor jezelf en kies rust waar dat kan.`
  } else if (wantsMoreActive && !stageGentler) {
    dayFocus = `Je gaf aan dat je zin hebt om te bewegen vandaag${namePart} — dit hebben we daarom voor je samengesteld.`
  } else if (wantsSelfCare) {
    dayFocus = `Je gaf aan dat je vandaag tijd voor jezelf wilt${namePart}. Dat mag er gewoon zijn.`
  } else if (lifeStage === "perimenopauze" || lifeStage === "veranderend") {
    dayFocus = `In een veranderende fase mag je tempo per dag anders zijn${namePart}. Volg wat vandaag past — niet wat gisteren lukte.`
  } else if (postCycle) {
    dayFocus = `Zonder menstruatiecyclus blijft je lichaam wél signalen geven${namePart}. Slaap, energie en stress tellen vandaag mee.`
  }

  const buddyContext: string[] = []
  if (profile.name) buddyContext.push(`Naam: ${profile.name}`)
  if (profile.goals?.length) buddyContext.push(`Doelen: ${profile.goals.join(", ")}`)
  const stageLabel = lifeStageLabelForBuddy(lifeStage)
  if (stageLabel) {
    buddyContext.push(
      `Levensfase (zelfgekozen): ${stageLabel}${
        stageGentler
          ? " — neig naar zachter advies; suggereer nooit dat ze iets moet afmaken"
          : ""
      }`,
    )
  }
  if (postCycle) {
    buddyContext.push(
      "Geen actieve menstruatiecyclus-aannames: praat over slaap, energie, stress en klachten zonder cycluskalender te forceren.",
    )
  } else if (cycleEstimate) {
    buddyContext.push(
      `Cyclusdag ${cycleEstimate.cycleDay} (${cycleEstimate.phaseLabel}, schatting)`,
    )
  }
  if (latestCheckin) {
    const parts: string[] = []
    if (latestCheckin.energy) parts.push(`energie ${latestCheckin.energy}/5`)
    if (latestCheckin.mood) parts.push(`stemming ${latestCheckin.mood}/5`)
    if (latestCheckin.sleep) parts.push(`slaap ${latestCheckin.sleep}/5`)
    if (latestCheckin.stress) parts.push(`stress ${latestCheckin.stress}/5`)
    if (parts.length) buddyContext.push(`Laatste check-in: ${parts.join(", ")}`)
    if (latestCheckin.symptoms?.length) {
      buddyContext.push(`Klachten: ${latestCheckin.symptoms.map(symptomLabel).join(", ")}`)
    }
  }

  return {
    training: { workout, reason: trainingReason },
    nutrition,
    recovery,
    dayFocus,
    buddyContext,
    movementEnabled: profile.movement_enabled,
    nutritionEnabled: profile.nutrition_enabled,
  }
}
