export const GOAL_OPTIONS = [
  "Meer energie",
  "Beter slapen",
  "Sterker worden",
  "Fitter worden",
  "Meer rust",
  "Beter voor mezelf zorgen",
  "Mijn patronen begrijpen",
  "Gewicht behouden",
  "Afvallen",
] as const

export const TRAINING_OPTIONS = [
  "Wandelen",
  "Fietsen",
  "Krachttraining",
  "Yoga",
  "Pilates",
  "Hardlopen",
  "Zwemmen",
  "Mobiliteit",
  "Andere vorm van bewegen",
] as const

// Maps a training preference (see TRAINING_OPTIONS) to the `workouts.type`
// values it should surface. "Zwemmen" and "Andere vorm van bewegen"
// deliberately have no entry — there's no matching workout content for
// them yet, and the recommendation engine treats an unmapped-but-selected
// preference as "show nothing" rather than silently falling back to
// unrelated workout types.
export const TRAINING_PREFERENCE_TO_TYPE: Record<string, string> = {
  Krachttraining: "krachttraining",
  Pilates: "pilates",
  Yoga: "yoga",
  Wandelen: "wandelen",
  Fietsen: "fietsen",
  Hardlopen: "hardlopen",
  Mobiliteit: "mobiliteit",
}

export const NUTRITION_OPTIONS = [
  "Geen voorkeur",
  "Vegetarisch",
  "Veganistisch",
  "Pescotarisch",
  "Allergieën",
  "Dingen die ik niet lust",
] as const

export const TRAINING_FREQUENCY_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const

export const STYLE_OPTIONS = [
  { value: "natuurlijk", label: "Natuurlijk & holistisch", emoji: "\u{1F33F}" },
  { value: "gebalanceerd", label: "Gebalanceerd", emoji: "⚖️" },
  { value: "fitness", label: "Fitness & kracht", emoji: "\u{1F3CB}️" },
] as const

export const NEED_OPTIONS = [
  { value: "rust", emoji: "🌿", label: "Rust" },
  { value: "beweging", emoji: "🏃", label: "Beweging" },
  { value: "voeding", emoji: "🥗", label: "Gezond eten" },
  { value: "energie", emoji: "⚡", label: "Energie" },
  { value: "mezelf", emoji: "❤️", label: "Tijd voor mezelf" },
] as const

export const SYMPTOM_OPTIONS = [
  "Opvliegers",
  "Nachtelijk zweten",
  "Hoofdpijn",
  "Vermoeidheid",
  "Bloating",
  "Krampen",
  "Stemmingswisselingen",
  "Brain fog",
  "Cravings",
  "Anders",
  "Geen klachten",
] as const

export const RECIPE_CATEGORIES = [
  "Ontbijt",
  "Lunch",
  "Diner",
  "Snack",
  "Snel",
  "Eiwitrijk",
  "Vegetarisch",
  "Veganistisch",
  "Meal prep",
] as const

export const REGULARITY_OPTIONS = [
  { value: "regelmatig", label: "Regelmatig" },
  { value: "onregelmatig", label: "Onregelmatig" },
  { value: "onbekend", label: "Ik weet het niet zeker" },
] as const

export const NUTRITION_STYLE_OPTIONS = [
  { value: "normaal", label: "Normaal" },
  { value: "koolhydraatarm", label: "Koolhydraatarm" },
] as const

// Informational tags, not diagnoses — used to tailor training/nutrition
// suggestions and to show a "check with a professional" note where relevant.
export const HEALTH_CONDITION_OPTIONS = [
  "Rugklachten",
  "Knieklachten",
  "Gewrichtsklachten",
  "Hoge bloeddruk",
  "Schildklieraandoening",
  "PCOS",
  "Verminderde botdichtheid",
  "Zwangerschap of kraamperiode",
  "Anders",
] as const

export const MOVEMENT_LIMITATION_OPTIONS = [
  "Geen beperkingen",
  "Kan niet springen of high-impact bewegen",
  "Beperkte mobiliteit schouders",
  "Beperkte mobiliteit heupen of knieën",
  "Kan niet lang staan",
  "Kan niet op de grond liggen of overeind komen",
  "Anders",
] as const

// Optional period flow-intensity tracking (see cycle_logs.flow).
export const FLOW_OPTIONS = [
  { value: "geen", label: "Geen", emoji: "⚪" },
  { value: "licht", label: "Licht", emoji: "🩸" },
  { value: "gemiddeld", label: "Gemiddeld", emoji: "🩸🩸" },
  { value: "hevig", label: "Hevig", emoji: "🩸🩸🩸" },
] as const

// Optional reminders (see the `reminders` table).
export const REMINDER_TYPE_OPTIONS = [
  { value: "dagelijkse_checkin", label: "Dagelijkse check-in", emoji: "📝", defaultLabel: "Vul je dagelijkse gegevens in" },
  { value: "symptomen", label: "Symptomen registreren", emoji: "🩺", defaultLabel: "Klachten of symptomen bijhouden" },
  { value: "beweging", label: "Bewegen", emoji: "🏃", defaultLabel: "Tijd om even te bewegen" },
  { value: "routine", label: "Persoonlijke routine", emoji: "🌿", defaultLabel: "Jouw persoonlijke routine" },
  { value: "anders", label: "Iets anders", emoji: "✨", defaultLabel: "" },
] as const

export const REMINDER_DAY_OPTIONS = [
  { value: 1, label: "Ma" },
  { value: 2, label: "Di" },
  { value: 3, label: "Wo" },
  { value: 4, label: "Do" },
  { value: 5, label: "Vr" },
  { value: 6, label: "Za" },
  { value: 7, label: "Zo" },
] as const
