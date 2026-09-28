import type { Tables } from "@/types/database"
import type { CycleEstimate } from "@/lib/cycle/estimate"
import { TRAINING_PREFERENCE_TO_TYPE, symptomLabel } from "@/lib/constants"
import { SHORT_NIGHT_MINUTES } from "@/lib/sleep/insights"
import { filterOutDislikedRecipes } from "@/lib/nutrition/dislikes"

/** The single strongest sleep/symptom correlation from her history (see
 * computeSleepSymptomInsights) — just enough to personalize today's
 * wording when it actually applies, not the full insight shape. */
export interface PersonalSleepPattern {
  symptom: string
}

type Workout = Pick<Tables<"workouts">, "id" | "title" | "type" | "duration" | "difficulty" | "image_url">
type Recipe = Pick<
  Tables<"recipes">,
  "id" | "title" | "category" | "preparation_time" | "nutrition_information" | "image_url" | "ingredients"
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
    | "health_conditions"
    | "movement_limitations"
    | "wellness_preference"
    | "movement_enabled"
    | "nutrition_enabled"
  >
  cycleEstimate: CycleEstimate | null
  latestCheckin: Pick<Checkin, "energy" | "mood" | "sleep" | "stress" | "symptoms" | "need"> | null
  /** Last night's tracked sleep duration, if she has sleep tracking on and filled it in. */
  todaySleepDurationMinutes?: number | null
  /** The strongest sleep/symptom pattern from her history, if any cleared the bar — see computeSleepSymptomInsights. */
  personalSleepPattern?: PersonalSleepPattern | null
  workouts: Workout[]
  recipes: Recipe[]
  seed: string
}

export interface TrainingRecommendation {
  workout: Workout | null
  reason: string
}

export interface TrainingPickInput {
  profile: Pick<
    Profile,
    | "training_preferences"
    | "health_conditions"
    | "movement_limitations"
    | "wellness_preference"
  >
  latestCheckin: Pick<Checkin, "energy" | "mood" | "sleep" | "stress" | "symptoms" | "need"> | null
  todaySleepDurationMinutes?: number | null
  personalSleepPattern?: PersonalSleepPattern | null
  workouts: Workout[]
  seed: string
}

export interface NutritionRecommendation {
  recipe: Recipe | null
  reason: string
}

export interface NutritionPickInput {
  profile: Pick<Profile, "nutrition_preferences" | "nutrition_style" | "disliked_foods">
  latestCheckin: Pick<Checkin, "need"> | null
  recipes: Recipe[]
  seed: string
}

export interface RecoveryRecommendation {
  title: string
  duration: number
  description: string
  /** Optional linked short workout (mental/sleep/mobility). */
  workoutId?: string | null
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

const WELLNESS_TYPE_BOOST: Record<string, string[]> = {
  natuurlijk: ["yoga", "wandelen", "mobiliteit", "pilates"],
  fitness: ["krachttraining", "hardlopen", "fietsen"],
  gebalanceerd: [],
}

/** Symptoms that typically call for a gentler session — informational, not diagnostic. */
const DRAINING_SYMPTOMS = [
  "Opvliegers",
  "Nachtelijk zweten",
  "Vermoeidheid",
  "Brain fog",
  "Stemmingswisselingen",
  "Hoofdpijn",
  "Krampen",
]

const IMPACT_SENSITIVE_TAGS = [
  "Rugklachten",
  "Knieklachten",
  "Gewrichtsklachten",
  "Verminderde botdichtheid",
  "Kan niet springen of high-impact bewegen",
]

interface PhaseBias {
  preferGentle: boolean
  preferActive: boolean
  preferShort: boolean
  preferredTypes: string[]
  label: string
}

function phaseBias(phase: CyclePhase | null | undefined): PhaseBias | null {
  if (!phase) return null
  switch (phase) {
    case "menstruatie":
      return {
        preferGentle: true,
        preferActive: false,
        preferShort: true,
        preferredTypes: ["yoga", "wandelen", "mobiliteit", "pilates"],
        label: "menstruatie",
      }
    case "folliculair":
      return {
        preferGentle: false,
        preferActive: true,
        preferShort: false,
        preferredTypes: ["krachttraining", "fietsen", "pilates"],
        label: "folliculaire fase",
      }
    case "ovulatie":
      return {
        preferGentle: false,
        preferActive: true,
        preferShort: false,
        preferredTypes: ["krachttraining", "hardlopen", "fietsen"],
        label: "ovulatie",
      }
    case "luteaal":
      return {
        preferGentle: true,
        preferActive: false,
        preferShort: false,
        preferredTypes: ["yoga", "wandelen", "mobiliteit", "pilates"],
        label: "luteale fase",
      }
  }
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

function wantsLowerIntensityToday(
  checkin: RecommendationInput["latestCheckin"],
  todaySleepDurationMinutes?: number | null,
  personalSleepPattern?: PersonalSleepPattern | null,
): boolean {
  const lowEnergy = Boolean(checkin) && checkin!.energy !== null && checkin!.energy <= 2
  const highStress = Boolean(checkin) && checkin!.stress !== null && checkin!.stress >= 4
  const poorSleep = Boolean(checkin) && checkin!.sleep !== null && checkin!.sleep <= 2
  const needsRest = checkin?.need === "rust"
  return (
    lowEnergy ||
    highStress ||
    poorSleep ||
    needsRest ||
    shortNightMatchesPersonalPattern(todaySleepDurationMinutes, personalSleepPattern)
  )
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
 *
 * Priority: check-in need/intensity → impact limits → phase bias → wellness style.
 */
export function pickTodaysWorkout(input: TrainingPickInput): TrainingRecommendation {
  const { profile, latestCheckin, todaySleepDurationMinutes, personalSleepPattern, workouts, seed } = input
  const need = latestCheckin?.need ?? null
  const wantsMoreActive = need === "beweging"
  const lowerIntensity = wantsLowerIntensityToday(latestCheckin)
  const preferShort = shouldPreferShort(latestCheckin, cycleEstimate)
  const bias = phaseBias(cycleEstimate?.phase)
  const wellness = profile.wellness_preference ?? null
  const wellnessTypes = wellness ? (WELLNESS_TYPE_BOOST[wellness] ?? []) : []

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
    candidateWorkouts = narrowIfPossible(
      candidateWorkouts,
      candidateWorkouts.filter((w) => w.type !== "hardlopen" && w.difficulty !== "pittig"),
    )
  }

  // Check-in always wins over phase.
  let usedPhaseGentle = false
  let usedPhaseActive = false
  let usedPhaseTypes = false
  let usedWellness = false
  let usedShort = false

  if (lowerIntensity) {
    candidateWorkouts = narrowIfPossible(
      candidateWorkouts,
      candidateWorkouts.filter((w) => w.difficulty === "makkelijk"),
    )
  } else if (wantsMoreActive) {
    candidateWorkouts = narrowIfPossible(
      candidateWorkouts,
      candidateWorkouts.filter((w) => w.difficulty !== "makkelijk"),
    )
  } else if (bias?.preferGentle) {
    const gentler = candidateWorkouts.filter((w) => w.difficulty !== "pittig")
    if (gentler.length) {
      candidateWorkouts = gentler
      usedPhaseGentle = true
    }
  } else if (bias?.preferActive) {
    const active = candidateWorkouts.filter((w) => w.difficulty !== "makkelijk")
    if (active.length) {
      candidateWorkouts = active
      usedPhaseActive = true
    }
  }

  if (wellnessTypes.length && !lowerIntensity) {
    const boosted = candidateWorkouts.filter((w) => wellnessTypes.includes(w.type))
    if (boosted.length) {
      candidateWorkouts = boosted
      usedWellness = true
    }
  }

  if (bias?.preferredTypes.length && !lowerIntensity && need !== "beweging") {
    const phased = candidateWorkouts.filter((w) => bias.preferredTypes.includes(w.type))
    if (phased.length) {
      candidateWorkouts = phased
      usedPhaseTypes = true
    }
  }

  if (preferShort) {
    const short = candidateWorkouts.filter((w) => w.duration <= 10)
    const medium = candidateWorkouts.filter((w) => w.duration <= 20)
    if (short.length) {
      candidateWorkouts = short
      usedShort = true
    } else if (medium.length) {
      candidateWorkouts = medium
      usedShort = true
    }
  }

  if (!candidateWorkouts.length && rawPreferenceCount === 0) candidateWorkouts = workouts

  const workout = candidateWorkouts.length
    ? candidateWorkouts[seededIndex(`${seed}-training`, candidateWorkouts.length)]
    : null

  const usedPhase = usedPhaseGentle || usedPhaseActive || usedPhaseTypes
  let reason: string
  if (!workout && rawPreferenceCount > 0) {
    reason = "We hebben nog geen passende workouts voor de bewegingsvorm(en) die je koos — pas dit aan in je profiel."
  } else if (lowerIntensity && need === "rust") {
    reason = "Je gaf aan dat je vandaag naar rust verlangt — een zachte sessie dus."
  } else if (lowerIntensity && matchesSleepPattern && personalSleepPattern) {
    reason = `Je sliep vannacht relatief kort — in jouw gegevens hangt dat vaker samen met ${symptomLabel(personalSleepPattern.symptom).toLowerCase()}, dus kozen we een zachtere sessie.`
  } else if (lowerIntensity) {
    reason =
      "Je energie, slaap, stemming of klachten gaven aan dat een rustigere sessie vandaag beter past."
  } else if (wantsMoreActive) {
    reason = "Je gaf aan dat je vandaag zin hebt om te bewegen — hier is een actievere keuze."
  } else if (usedPhase && bias) {
    reason = `Omdat je waarschijnlijk in je ${bias.label} zit, past dit type beweging vandaag goed.`
  } else if (usedWellness && wellness === "natuurlijk") {
    reason = "Afstemmend op jouw natuurlijke & holistische stijl."
  } else if (usedWellness && wellness === "fitness") {
    reason = "Afstemmend op jouw voorkeur voor fitness & kracht."
  } else if (usedShort) {
    reason = "Een kortere sessie — beter passend bij hoe je je vandaag voelt."
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
  const { profile, latestCheckin, recipes, seed, cycleEstimate } = input
  const wantsQuickMeal = latestCheckin?.need === "voeding"
  const lowEnergy =
    (latestCheckin?.energy !== null &&
      latestCheckin?.energy !== undefined &&
      latestCheckin.energy <= 2) ||
    (latestCheckin?.sleep !== null &&
      latestCheckin?.sleep !== undefined &&
      latestCheckin.sleep <= 2)
  const wantsEasy =
    wantsQuickMeal ||
    lowEnergy ||
    cycleEstimate?.phase === "menstruatie" ||
    (latestCheckin?.symptoms ?? []).includes("Cravings") ||
    (latestCheckin?.symptoms ?? []).includes("Vermoeidheid")

  const nutritionPrefs = profile.nutrition_preferences ?? []
  const wantsLowCarb = profile.nutrition_style === "koolhydraatarm"
  // Prefs like "Allergieën" / "Dingen die ik niet lust" are free-text tags, not
  // recipe categories — only keep values that actually match recipe categories.
  const categoryPrefs = nutritionPrefs.filter(
    (p) => p !== "Geen voorkeur" && p !== "Allergieën" && p !== "Dingen die ik niet lust",
  )

  const availableRecipes = filterOutDislikedRecipes(recipes, profile.disliked_foods)

  let candidateRecipes = nutritionPrefs.length
    ? availableRecipes.filter((r) => r.category.some((c) => nutritionPrefs.includes(c)))
    : availableRecipes

  if (!candidateRecipes.length) candidateRecipes = availableRecipes

  let reason: string
  let usedQuick = false
  let usedPhase = false

  if (wantsEasy) {
    const quick = candidateRecipes.filter(
      (r) => r.preparation_time !== null && r.preparation_time <= 20,
    )
    if (quick.length) {
      candidateRecipes = quick
      usedQuick = true
    }
  }

  if (
    !usedQuick &&
    (cycleEstimate?.phase === "luteaal" || cycleEstimate?.phase === "menstruatie")
  ) {
    const comforting = candidateRecipes.filter((r) =>
      r.category.some((c) => c === "Eiwitrijk" || c === "Meal prep" || c === "Diner"),
    )
    if (comforting.length) {
      candidateRecipes = comforting
      usedPhase = true
    }
  }

  if (wantsLowCarb) {
    const lowCarb = candidateRecipes.filter((r) => {
      const carbs = parseCarbGrams(r.nutrition_information)
      return carbs !== null && carbs <= 20
    })
    if (lowCarb.length) {
      candidateRecipes = lowCarb
      reason = "Een koolhydraatarme keuze, passend bij jouw voedingsvoorkeur."
    } else if (usedQuick && wantsQuickMeal) {
      reason = "Je gaf aan dat je zin had in gezond eten — dit maak je binnen 20 minuten."
    } else if (usedQuick) {
      reason = "Een eenvoudige maaltijd — passend bij hoe je je vandaag voelt."
    } else if (usedPhase && cycleEstimate) {
      reason = `Omdat je waarschijnlijk in je ${cycleEstimate.phaseLabel.toLowerCase()} zit, kozen we iets stevigs en haalbaars.`
    } else {
      reason =
        "Sluit het best aan bij jouw voorkeuren — bekijk de koolhydraatarme variant in het recept."
    }
  } else if (usedQuick && wantsQuickMeal) {
    reason = "Je gaf aan dat je zin had in gezond eten — dit maak je binnen 20 minuten."
  } else if (usedQuick) {
    reason = "Een eenvoudige maaltijd — passend bij hoe je je vandaag voelt."
  } else if (usedPhase && cycleEstimate) {
    reason = `Omdat je waarschijnlijk in je ${cycleEstimate.phaseLabel.toLowerCase()} zit, kozen we iets stevigs en haalbaars.`
  } else {
    reason = categoryPrefs.length
      ? `Sluit aan bij jouw voedingsvoorkeuren (${categoryPrefs.join(", ")}).`
      : "Een gebalanceerde maaltijd om je dag te ondersteunen."
  }

  const recipe = candidateRecipes.length
    ? candidateRecipes[seededIndex(`${seed}-nutrition`, candidateRecipes.length)]
    : null

  return { recipe, reason }
}

function buildRecovery(
  profile: RecommendationInput["profile"],
  latestCheckin: RecommendationInput["latestCheckin"],
  cycleEstimate: CycleEstimate | null,
  lowerIntensity: boolean,
  workouts: Workout[],
  seed: string,
): RecoveryRecommendation {
  const need = latestCheckin?.need ?? null
  const wantsSelfCare = need === "mezelf"
  const phase = cycleEstimate?.phase
  const wellness = profile.wellness_preference
  const poorSleep =
    latestCheckin?.sleep !== null &&
    latestCheckin?.sleep !== undefined &&
    latestCheckin.sleep <= 2

  const mentalTitlesPrefer = poorSleep
    ? ["Slaapritueel 8 minuten", "Ademreset 4 minuten", "Body scan 6 minuten", "Ademhaling & Ontspanning"]
    : need === "mezelf" || lowerIntensity
      ? [
          "Kort lontje reset 5 minuten",
          "Ademreset 4 minuten",
          "Body scan 6 minuten",
          "Ademhaling & Ontspanning",
          "Wandeling met aandacht 10 minuten",
        ]
      : ["Ademhaling & Ontspanning", "Ademreset 4 minuten", "Nek & Schouders Reset"]

  const byTitle = mentalTitlesPrefer
    .map((title) => workouts.find((w) => w.title === title))
    .filter((w): w is Workout => Boolean(w))
  const gentleShort = workouts.filter(
    (w) =>
      (w.type === "mobiliteit" || w.type === "yoga" || w.type === "wandelen") &&
      w.difficulty === "makkelijk" &&
      w.duration <= 10,
  )
  const recoveryPool = byTitle.length ? byTitle : gentleShort
  const recoveryWorkout = recoveryPool.length
    ? recoveryPool[seededIndex(`${seed}-recovery`, recoveryPool.length)]
    : null

  if (wantsSelfCare) {
    return {
      title: recoveryWorkout?.title ?? "Tijd voor jezelf",
      duration: recoveryWorkout?.duration ?? 15,
      description:
        "Je gaf aan dat je daar vandaag behoefte aan hebt. Neem een moment zonder schuldgevoel — een bad, een boek, of gewoon niets.",
      workoutId: recoveryWorkout?.id ?? null,
    }
  }

  if (phase === "menstruatie" || lowerIntensity || poorSleep) {
    if (wellness === "natuurlijk") {
      return {
        title: recoveryWorkout?.title ?? "Ademhaling & zachte rust",
        duration: recoveryWorkout?.duration ?? 10,
        description:
          "Een paar minuten bewuste ademhaling of een korte wandeling buiten helpt je lichaam vandaag het tempo te kiezen dat bij je past.",
        workoutId: recoveryWorkout?.id ?? null,
      }
    }
    return {
      title: recoveryWorkout?.title ?? "Zachte mobiliteit",
      duration: recoveryWorkout?.duration ?? 10,
      description:
        "Neem vandaag de tijd voor rustige mobiliteit en ademhaling. Luister naar wat je lichaam nodig heeft.",
      workoutId: recoveryWorkout?.id ?? null,
    }
  }

  if (wellness === "fitness") {
    return {
      title: recoveryWorkout?.title ?? "Actief herstel",
      duration: recoveryWorkout?.duration ?? 10,
      description:
        "Lichte mobiliteit of een korte stretch houdt je soepel zonder je training te belasten.",
      workoutId: recoveryWorkout?.id ?? null,
    }
  }

  if (wellness === "natuurlijk") {
    return {
      title: recoveryWorkout?.title ?? "Korte ontspanning",
      duration: recoveryWorkout?.duration ?? 10,
      description:
        "Even stilzitten, ademen, of naar buiten — kleine rustmomenten ondersteunen je ritme.",
      workoutId: recoveryWorkout?.id ?? null,
    }
  }

  return {
    title: recoveryWorkout?.title ?? "Korte ontspanning",
    duration: recoveryWorkout?.duration ?? 10,
    description:
      "Een paar minuten bewust ontspannen helpt je lichaam herstellen, ook op een goede dag.",
    workoutId: recoveryWorkout?.id ?? null,
  }
}

export function buildRecommendation(input: RecommendationInput): Recommendation {
  const { profile, cycleEstimate, latestCheckin, todaySleepDurationMinutes, personalSleepPattern, workouts, recipes, seed } =
    input

  const need = latestCheckin?.need ?? null
  const wantsMoreActive = need === "beweging"
  const wantsSelfCare = need === "mezelf"
  const lowerIntensity = wantsLowerIntensityToday(latestCheckin, todaySleepDurationMinutes, personalSleepPattern)
  const matchesSleepPattern = shortNightMatchesPersonalPattern(todaySleepDurationMinutes, personalSleepPattern)

  const { workout, reason: trainingReason } = profile.movement_enabled
    ? pickTodaysWorkout({ profile, latestCheckin, todaySleepDurationMinutes, personalSleepPattern, workouts, seed })
    : { workout: null, reason: "" }

  const { recipe, reason: nutritionReason } = profile.nutrition_enabled
    ? pickTodaysRecipe({ profile, latestCheckin, recipes, seed })
    : { recipe: null, reason: "" }

  const recovery = buildRecovery(
    profile,
    latestCheckin,
    cycleEstimate,
    lowerIntensity,
    workouts,
    seed,
  )

  const namePart = profile.name ? `, ${profile.name}` : ""
  let dayFocus = `Luister vandaag naar hoe je je voelt en pas je tempo daarop aan${namePart}.`
  if (cycleEstimate) {
    dayFocus = `Je cyclusdag ${cycleEstimate.cycleDay} valt naar schatting in de ${cycleEstimate.phaseLabel.toLowerCase()}. Luister naar hoe je je vandaag voelt en pas je tempo daarop aan.`
  }
  if (need === "rust") {
    dayFocus = `Je gaf aan dat je vandaag naar rust verlangt${namePart}. Wees zacht voor jezelf — dat is vandaag genoeg.`
  } else if (lowerIntensity && matchesSleepPattern && personalSleepPattern) {
    dayFocus = `Je sliep vannacht relatief kort${namePart} — in jouw gegevens hangt dat vaker samen met ${symptomLabel(personalSleepPattern.symptom).toLowerCase()}. Wees dus extra zacht voor jezelf vandaag.`
  } else if (lowerIntensity) {
    dayFocus = `Je gaf aan dat het vandaag wat minder gaat${namePart}. Wees zacht voor jezelf en kies rust waar dat kan.`
  } else if (wantsMoreActive) {
    dayFocus = `Je gaf aan dat je zin hebt om te bewegen vandaag${namePart} — dit hebben we daarom voor je samengesteld.`
  } else if (wantsSelfCare) {
    dayFocus = `Je gaf aan dat je vandaag tijd voor jezelf wilt${namePart}. Dat mag er gewoon zijn.`
  } else if (cycleEstimate?.phase === "menstruatie") {
    dayFocus = `Je zit naar schatting in je menstruatie${namePart}. Een zachter tempo is vandaag helemaal oké.`
  } else if (cycleEstimate?.phase === "ovulatie") {
    dayFocus = `Je zit naar schatting rond je ovulatie${namePart}. Veel vrouwen voelen hier meer energie — gebruik wat bij je past.`
  }

  const buddyContext: string[] = []
  if (profile.name) buddyContext.push(`Naam: ${profile.name}`)
  if (profile.goals?.length) buddyContext.push(`Doelen: ${profile.goals.join(", ")}`)
  if (profile.wellness_preference) {
    buddyContext.push(`Wellness-stijl: ${profile.wellness_preference}`)
  }
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
    if (latestCheckin.need) buddyContext.push(`Behoefte vandaag: ${latestCheckin.need}`)
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
