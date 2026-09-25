import type { Tables } from "@/types/database"
import type { CycleEstimate } from "@/lib/cycle/estimate"

type Workout = Tables<"workouts">
type Recipe = Tables<"recipes">
type Profile = Tables<"profiles">
type Checkin = Tables<"daily_checkins">

export interface RecommendationInput {
  profile: Pick<
    Profile,
    "name" | "goals" | "training_preferences" | "nutrition_preferences" | "wellness_preference"
  >
  cycleEstimate: CycleEstimate | null
  latestCheckin: Pick<Checkin, "energy" | "mood" | "sleep" | "stress" | "symptoms"> | null
  workouts: Workout[]
  recipes: Recipe[]
  seed: string
}

export interface TrainingRecommendation {
  workout: Workout | null
  reason: string
}

export interface NutritionRecommendation {
  recipe: Recipe | null
  reason: string
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
}

const TRAINING_PREFERENCE_TO_TYPE: Record<string, string> = {
  Krachttraining: "krachttraining",
  Pilates: "pilates",
  Yoga: "yoga",
  Wandelen: "wandelen",
  Fietsen: "fietsen",
  Hardlopen: "hardlopen",
  Mobiliteit: "mobiliteit",
}

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
  return lowEnergy || highStress || poorSleep
}

export function buildRecommendation(input: RecommendationInput): Recommendation {
  const { profile, cycleEstimate, latestCheckin, workouts, recipes, seed } = input

  const preferredTypes = profile.training_preferences
    .map((pref) => TRAINING_PREFERENCE_TO_TYPE[pref])
    .filter((type): type is string => Boolean(type))

  const lowerIntensity = wantsLowerIntensityToday(latestCheckin)

  let candidateWorkouts = preferredTypes.length
    ? workouts.filter((w) => preferredTypes.includes(w.type))
    : workouts

  if (lowerIntensity) {
    const gentle = candidateWorkouts.filter((w) => w.difficulty === "makkelijk")
    if (gentle.length) candidateWorkouts = gentle
  }

  if (!candidateWorkouts.length) candidateWorkouts = workouts

  const workout = candidateWorkouts.length
    ? candidateWorkouts[seededIndex(`${seed}-training`, candidateWorkouts.length)]
    : null

  let trainingReason: string
  if (!latestCheckin) {
    trainingReason = workout
      ? "Gebaseerd op je bewegingsvoorkeuren uit je profiel."
      : "Voeg je bewegingsvoorkeuren toe in je profiel voor een passend voorstel."
  } else if (lowerIntensity) {
    trainingReason = "Je energie, slaap of stress gaf aan dat een rustigere sessie vandaag beter past."
  } else {
    trainingReason = "Past bij je energie van vandaag en je bewegingsvoorkeuren."
  }

  const nutritionPrefs = profile.nutrition_preferences ?? []
  let candidateRecipes = nutritionPrefs.length
    ? recipes.filter((r) => r.category.some((c) => nutritionPrefs.includes(c)))
    : recipes

  if (!candidateRecipes.length) candidateRecipes = recipes

  const recipe = candidateRecipes.length
    ? candidateRecipes[seededIndex(`${seed}-nutrition`, candidateRecipes.length)]
    : null

  const nutritionReason = nutritionPrefs.length
    ? `Sluit aan bij jouw voedingsvoorkeuren (${nutritionPrefs.join(", ")}).`
    : "Een gebalanceerde maaltijd om je dag te ondersteunen."

  const recovery: RecoveryRecommendation = lowerIntensity
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
  if (lowerIntensity) {
    dayFocus = `Je gaf aan dat het vandaag wat minder gaat${namePart}. Wees zacht voor jezelf en kies rust waar dat kan.`
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
      buddyContext.push(`Klachten: ${latestCheckin.symptoms.join(", ")}`)
    }
  }

  return {
    training: { workout, reason: trainingReason },
    nutrition: { recipe, reason: nutritionReason },
    recovery,
    dayFocus,
    buddyContext,
  }
}
