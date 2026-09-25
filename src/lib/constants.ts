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

// Optional hormonal medication / HT / contraception tracking (see the
// `medications` table). The status question is deliberately non-committal —
// picking an answer here never adds a medication row by itself, it only
// decides which quick-add entry points are shown.
export const HORMONAL_MEDICATION_STATUS_OPTIONS = [
  { value: "nee", label: "Nee" },
  { value: "ht", label: "Ja, hormoontherapie (HT)" },
  { value: "ac", label: "Ja, anticonceptie (AC)" },
  { value: "andere_hormonaal", label: "Ja, andere hormonale medicatie" },
  { value: "andere_medicatie", label: "Ja, andere medicatie die mogelijk invloed heeft" },
  { value: "onbekend_liever_niet", label: "Weet ik niet / wil ik liever niet aangeven" },
] as const

export const MEDICATION_CATEGORY_OPTIONS = [
  { value: "ht", label: "Hormoontherapie (HT)", emoji: "💊" },
  { value: "anticonceptie", label: "Anticonceptie", emoji: "🛡️" },
  { value: "andere_hormonaal", label: "Andere hormonale medicatie", emoji: "🧪" },
  { value: "andere_medicatie", label: "Andere medicatie", emoji: "📋" },
] as const

// Quick-pick chips for step 1 of the wizard, per category — always with a
// free-text fallback, since the app never limits what she can enter.
export const HT_NAME_SUGGESTIONS = ["Oestrogeen", "Progesteron", "Testosteron"] as const
export const CONTRACEPTION_METHOD_OPTIONS = [
  "Pil",
  "Hormoonspiraal",
  "Ring",
  "Pleister",
  "Injectie",
  "Implantaat",
  "Andere vorm",
] as const

export const MEDICATION_FORM_OPTIONS = [
  "Spray",
  "Tablet",
  "Pleister",
  "Gel",
  "Ring",
  "Spiraal",
  "Implantaat",
  "Injectie",
  "Anders",
] as const

export const MEDICATION_SCHEDULE_TYPE_OPTIONS = [
  { value: "dagelijks", label: "Iedere dag" },
  { value: "om_de_dag", label: "Om de dag" },
  { value: "wekelijkse_dagen", label: "Bepaalde dagen van de week" },
  { value: "cyclisch", label: "Periode wel / periode niet" },
  { value: "eigen_schema", label: "Eigen schema" },
] as const

// Optional Buddy tone-of-voice preference (see profiles.buddy_styles).
// Multi-select, empty = "geen voorkeur" — the app then uses a warm, neutral
// default tone everywhere a Buddy message appears.
export const BUDDY_STYLE_OPTIONS = [
  { value: "liefdevol", label: "Liefdevol", emoji: "💛", description: "warm, zacht en bemoedigend" },
  { value: "humor", label: "Humor", emoji: "😄", description: "luchtig, grappig en soms een knipoog" },
  { value: "spiritueel", label: "Spiritueel", emoji: "✨", description: "rust, bewustwording en verbinding" },
  { value: "motiverend", label: "Motiverend", emoji: "💪", description: "actief, positief en stimulerend" },
  { value: "informatief", label: "Informatief", emoji: "🧠", description: "interessante weetjes en uitleg" },
  { value: "rustig", label: "Rustig", emoji: "🌿", description: "kalm, ontspannen en mindful" },
  { value: "direct", label: "Direct", emoji: "🔥", description: "eerlijk, duidelijk en zonder omwegen" },
  { value: "luchtig", label: "Luchtig", emoji: "😊", description: "vrolijk, speels en positief" },
] as const

// How often she wants to see the passive/ambient Buddy content (daily quote
// card, "even onthouden" moments on Cyclusdag) — separate from the explicit,
// per-item schedule in `reminders`, which she already configures precisely.
export const BUDDY_FREQUENCY_OPTIONS = [
  { value: "elke_dag", label: "Elke dag" },
  { value: "paar_keer_per_week", label: "Een paar keer per week" },
  { value: "alleen_relevant", label: "Alleen wanneer relevant" },
  { value: "uit", label: "Uit" },
] as const
