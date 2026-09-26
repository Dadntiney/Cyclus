import type { Tables } from "@/types/database"
import type { CycleEstimate } from "@/lib/cycle/estimate"
import { TRAINING_PREFERENCE_TO_TYPE, symptomLabel } from "@/lib/constants"

type Workout = Pick<Tables<"workouts">, "id" | "title" | "type" | "duration" | "difficulty">
type Recipe = Pick<Tables<"recipes">, "id" | "title" | "category" | "preparation_time" | "nutrition_information">
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
    | "health_conditions"
    | "movement_limitations"
    | "wellness_preference"
    | "movement_enabled"
    | "nutrition_enabled"
  >
  cycleEstimate: CycleEstimate | null
  latestCheckin: Pick<Checkin, "energy" | "mood" | "sleep" | "stress" | "symptoms" | "need"> | null
  workouts: Workout[]
  recipes: Recipe[]
  seed: string
}

export interface TrainingRecommendation {
  workout: Workout | null
  reason: string
}

export interface TrainingPickInput {
  profile: Pick<Profile, "training_preferences" | "health_conditions" | "movement_limitations">
  latestCheckin: Pick<Checkin, "energy" | "mood" | "sleep" | "stress" | "symptoms" | "need"> | null
  workouts: Workout[]
  seed: string
}

export interface NutritionRecommendation {
  recipe: Recipe | null
  reason: string
}

export interface NutritionPickInput {
  profile: Pick<Profile, "nutrition_preferences" | "nutrition_style">
  latestCheckin: Pick<Checkin, "need"> | null
  recipes: Recipe[]
  seed: string
}

export interface RecoveryRecommendation {
  title: string
  duration: number
  description: string
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

function wantsLowerIntensityToday(
  checkin: RecommendationInput["latestCheckin"],
): boolean {
  if (!checkin) return false
  const lowEnergy = checkin.energy !== null && checkin.energy <= 2
  const highStress = checkin.stress !== null && checkin.stress >= 4
  const poorSleep = checkin.sleep !== null && checkin.sleep <= 2
  return lowEnergy || highStress || poorSleep || checkin.need === "rust"
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
  const { profile, latestCheckin, workouts, seed } = input
  const need = latestCheckin?.need ?? null
  const wantsMoreActive = need === "beweging"

  const rawPreferenceCount = profile.training_preferences.length
  const preferredTypes = profile.training_preferences
    .map((pref) => TRAINING_PREFERENCE_TO_TYPE[pref])
    .filter((type): type is string => Boolean(type))

  const lowerIntensity = wantsLowerIntensityToday(latestCheckin)

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
  } else if (lowerIntensity && need === "rust") {
    reason = "Je gaf aan dat je vandaag naar rust verlangt — een zachte sessie dus."
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
export function pickTodaysRecipe(input: NutritionPickInput): NutritionRecommendation {
  const { profile, latestCheckin, recipes, seed } = input
  const wantsQuickMeal = latestCheckin?.need === "voeding"
  const nutritionPrefs = profile.nutrition_preferences ?? []
  const wantsLowCarb = profile.nutrition_style === "koolhydraatarm"

  let candidateRecipes = nutritionPrefs.length
    ? recipes.filter((r) => r.category.some((c) => nutritionPrefs.includes(c)))
    : recipes

  if (!candidateRecipes.length) candidateRecipes = recipes

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

  return { recipe, reason }
}

export function buildRecommendation(input: RecommendationInput): Recommendation {
  const { profile, cycleEstimate, latestCheckin, workouts, recipes, seed } = input

  const need = latestCheckin?.need ?? null
  const wantsMoreActive = need === "beweging"
  const wantsSelfCare = need === "mezelf"
  const lowerIntensity = wantsLowerIntensityToday(latestCheckin)

  const { workout, reason: trainingReason } = profile.movement_enabled
    ? pickTodaysWorkout({ profile, latestCheckin, workouts, seed })
    : { workout: null, reason: "" }

  const { recipe, reason: nutritionReason } = profile.nutrition_enabled
    ? pickTodaysRecipe({ profile, latestCheckin, recipes, seed })
    : { recipe: null, reason: "" }

  const recovery: RecoveryRecommendation = wantsSelfCare
    ? {
        title: "Tijd voor jezelf",
        duration: 15,
        description: "Je gaf aan dat je daar vandaag behoefte aan hebt. Neem een moment zonder schuldgevoel — een bad, een boek, of gewoon niets.",
      }
    : lowerIntensity
      ? {
          title: "Zachte mobiliteit",
          duration: 10,
          description: "Neem vandaag de tijd voor rustige mobiliteit en ademhaling. Luister naar wat je lichaam nodig heeft.",
        }
      : {
          title: "Korte ontspanning",
          duration: 10,
          description: "Een paar minuten bewust ontspannen helpt je lichaam herstellen, ook op een goede dag.",
        }

  const namePart = profile.name ? `, ${profile.name}` : ""
  let dayFocus = `Luister vandaag naar hoe je je voelt en pas je tempo daarop aan${namePart}.`
  if (cycleEstimate) {
    dayFocus = `Je cyclusdag ${cycleEstimate.cycleDay} valt naar schatting in de ${cycleEstimate.phaseLabel.toLowerCase()}. Luister naar hoe je je vandaag voelt en pas je tempo daarop aan.`
  }
  if (need === "rust") {
    dayFocus = `Je gaf aan dat je vandaag naar rust verlangt${namePart}. Wees zacht voor jezelf — dat is vandaag genoeg.`
  } else if (lowerIntensity) {
    dayFocus = `Je gaf aan dat het vandaag wat minder gaat${namePart}. Wees zacht voor jezelf en kies rust waar dat kan.`
  } else if (wantsMoreActive) {
    dayFocus = `Je gaf aan dat je zin hebt om te bewegen vandaag${namePart} — dit hebben we daarom voor je samengesteld.`
  } else if (wantsSelfCare) {
    dayFocus = `Je gaf aan dat je vandaag tijd voor jezelf wilt${namePart}. Dat mag er gewoon zijn.`
  }

  const buddyContext: string[] = []
  if (profile.name) buddyContext.push(`Naam: ${profile.name}`)
  if (profile.goals?.length) buddyContext.push(`Doelen: ${profile.goals.join(", ")}`)
  if (cycleEstimate) {
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
    nutrition: { recipe, reason: nutritionReason },
    recovery,
    dayFocus,
    buddyContext,
    movementEnabled: profile.movement_enabled,
    nutritionEnabled: profile.nutrition_enabled,
  }
}
