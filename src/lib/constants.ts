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
  "Krachttraining",
  "Pilates",
  "Yoga",
  "Wandelen",
  "Fietsen",
  "Hardlopen",
  "Mobiliteit",
] as const

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
