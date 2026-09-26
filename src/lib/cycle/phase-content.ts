import type { CyclePhase } from "@/lib/cycle/estimate"

/**
 * Static, editorial content describing what a cycle phase generally means
 * for nutrition, movement and lifestyle. This is informational content, not
 * medical advice — every phase's copy is written to avoid claims a food or
 * workout "fixes" or "balances" hormones, and to make clear cycles vary a
 * lot from person to person. Central place to add/adjust this copy so the
 * week overview, month overview and Vandaag stay in sync automatically.
 */

export interface PhaseColorTokens {
  /** Soft background, e.g. for banners and day chips. */
  bg: string
  /** Text color that stays readable on `bg`. */
  text: string
  /** Solid/dark variant for small dots, active states, chip borders. */
  dot: string
}

export interface PhaseNutritionFocus {
  /** Short label, e.g. "IJzer & eiwitten". */
  focusLabel: string
  /** One-line, nuanced explanation — never a "this fixes X" claim. */
  focusText: string
  /** A handful of ingredients that fit well in this phase. */
  exampleFoods: string[]
  /** Recipe `category` tags (see RECIPE_CATEGORIES) to lean into for this phase. */
  recipeCategories: string[]
  /** Nutrients often highlighted for this phase, used for the ingredient explainer. */
  nutrients: string[]
}

export interface PhaseMovementFocus {
  intensityLabel: string
  focusText: string
  /** `workouts.type` values to lean into for this phase. */
  preferredTypes: string[]
  /** When true, week/day plans lean toward gentler difficulty for this phase. */
  preferGentler: boolean
}

export interface PhaseLifestyleTip {
  title: string
  text: string
}

export interface PhaseContent {
  phase: CyclePhase
  label: string
  shortDescription: string
  colors: PhaseColorTokens
  nutrition: PhaseNutritionFocus
  movement: PhaseMovementFocus
  lifestyleTips: PhaseLifestyleTip[]
  whyText: string
}

export const PHASE_ORDER: CyclePhase[] = ["menstruatie", "folliculair", "ovulatie", "luteaal"]

export const PHASE_CONTENT: Record<CyclePhase, PhaseContent> = {
  menstruatie: {
    phase: "menstruatie",
    label: "Menstruatie",
    shortDescription: "Een moment om het rustiger aan te doen en op te warmen naar de rest van je cyclus.",
    colors: { bg: "bg-peach-soft", text: "text-ink", dot: "bg-peach" },
    nutrition: {
      focusLabel: "IJzer & warme, voedzame maaltijden",
      focusText:
        "Tijdens je menstruatie verlies je wat bloed — warme, voedzame maaltijden met ijzerrijke ingrediënten en voldoende vocht passen daar goed bij.",
      exampleFoods: ["Spinazie", "Rode linzen", "Zalm", "Pompoensoep", "Griekse yoghurt"],
      recipeCategories: ["Diner", "Lunch", "Eiwitrijk"],
      nutrients: ["IJzer", "Magnesium", "Vitamine C", "Vocht"],
    },
    movement: {
      intensityLabel: "Rustig",
      focusText:
        "Veel vrouwen hebben tijdens hun menstruatie minder energie. Zachtere vormen van bewegen zoals wandelen, mobiliteit of yoga passen dan vaak beter dan zware training — luister vooral naar je eigen lichaam.",
      preferredTypes: ["wandelen", "mobiliteit", "yoga", "pilates"],
      preferGentler: true,
    },
    lifestyleTips: [
      { title: "Warmte kan fijn zijn", text: "Een warmwaterkruik of warm bad kan prettig aanvoelen bij krampen." },
      { title: "Extra rust is oké", text: "Plan waar mogelijk iets minder vol — dit is geen zwakte, gewoon een fase." },
      { title: "Drink voldoende water", text: "Voldoende vocht past goed bij deze fase, zeker bij vermoeidheid." },
    ],
    whyText:
      "Deze suggesties zijn algemeen en informatief — geen medisch advies. Niet iedereen ervaart de menstruatiefase hetzelfde.",
  },
  folliculair: {
    phase: "folliculair",
    label: "Folliculaire fase",
    shortDescription: "Je energie bouwt zich voor veel vrouwen geleidelijk op in deze fase.",
    colors: { bg: "bg-sage-soft", text: "text-sage-dark", dot: "bg-sage-dark" },
    nutrition: {
      focusLabel: "Verse, lichte voeding",
      focusText:
        "Met vaak wat meer energie kun je in deze fase goed uit de voeten met verse groenten, volwaardige eiwitten en complexe koolhydraten die je energie ondersteunen.",
      exampleFoods: ["Quinoa", "Kipfilet", "Broccoli", "Bessen", "Havermout"],
      recipeCategories: ["Lunch", "Ontbijt", "Snel"],
      nutrients: ["Eiwitten", "Vezels", "B-vitamines"],
    },
    movement: {
      intensityLabel: "Gemiddeld tot actief",
      focusText:
        "Veel vrouwen merken dat kracht en conditie in deze fase weer wat makkelijker gaan. Een goed moment om trainingsintensiteit rustig op te bouwen als je daar zin in hebt.",
      preferredTypes: ["krachttraining", "hardlopen", "fietsen"],
      preferGentler: false,
    },
    lifestyleTips: [
      { title: "Goed moment om te plannen", text: "Met meer energie is dit vaak een fijn moment om je week vooruit te plannen." },
      { title: "Bouw training rustig op", text: "Voel je meer energie, dan kun je intensiteit of gewicht geleidelijk verhogen." },
      { title: "Blijf goed slapen", text: "Ook in een energieke fase blijft voldoende slaap de basis van herstel." },
    ],
    whyText:
      "Deze suggesties zijn algemeen en informatief — geen medisch advies. Energieniveaus verschillen sterk per persoon.",
  },
  ovulatie: {
    phase: "ovulatie",
    label: "Ovulatie",
    shortDescription: "Voor veel vrouwen een piekmoment in energie rond het midden van de cyclus.",
    colors: { bg: "bg-info-soft", text: "text-info", dot: "bg-info" },
    nutrition: {
      focusLabel: "Kleurrijke, antioxidantrijke voeding",
      focusText:
        "Een gevarieerd bord met veel kleur — groenten, fruit en gezonde vetten — past goed bij deze actieve fase.",
      exampleFoods: ["Cherrytomaatjes", "Avocado", "Zalm", "Rucola", "Walnoten"],
      recipeCategories: ["Diner", "Eiwitrijk", "Vegetarisch"],
      nutrients: ["Antioxidanten", "Omega-3 vetzuren", "Vezels"],
    },
    movement: {
      intensityLabel: "Actief",
      focusText:
        "Veel vrouwen voelen zich rond de ovulatie sterk en energiek. Een prima moment voor een pittigere training, als dat past bij hoe je je voelt.",
      preferredTypes: ["krachttraining", "hardlopen", "fietsen"],
      preferGentler: false,
    },
    lifestyleTips: [
      { title: "Benut je energie", text: "Voelt dit als een sterk moment? Dan kan een uitdagendere training hier goed passen." },
      { title: "Blijf goed gehydrateerd", text: "Zeker bij intensievere training is voldoende water belangrijk." },
      { title: "Herstel blijft belangrijk", text: "Ook op een energieke dag helpt een korte cooling-down je lichaam." },
    ],
    whyText:
      "Deze suggesties zijn algemeen en informatief — geen medisch advies. Niet iedereen ervaart een energiepiek rond de ovulatie.",
  },
  luteaal: {
    phase: "luteaal",
    label: "Luteale fase",
    shortDescription: "Je lichaam bouwt voor veel vrouwen geleidelijk toe naar meer rust in deze fase.",
    colors: { bg: "bg-warning-soft", text: "text-warning", dot: "bg-warning" },
    nutrition: {
      focusLabel: "Magnesiumrijke, stabiliserende voeding",
      focusText:
        "Voldoende eiwitten en magnesiumrijke voeding passen goed bij deze fase, samen met een wat rustiger trainingsvolume waar nodig.",
      exampleFoods: ["Pompoenpitten", "Zoete aardappel", "Zalm", "Spinazie", "Griekse yoghurt"],
      recipeCategories: ["Diner", "Eiwitrijk", "Meal prep"],
      nutrients: ["Magnesium", "Eiwitten", "Vezels", "Vitamine B6"],
    },
    movement: {
      intensityLabel: "Rustig tot gemiddeld",
      focusText:
        "Richting het einde van deze fase ervaren veel vrouwen wat minder energie. Rustigere training met meer aandacht voor mobiliteit en herstel kan dan prettiger voelen.",
      preferredTypes: ["mobiliteit", "yoga", "pilates", "wandelen"],
      preferGentler: true,
    },
    lifestyleTips: [
      { title: "Extra aandacht voor slaap", text: "Voldoende slaap kan in deze fase extra prettig zijn voor je herstel." },
      { title: "Rustiger trainingsvolume", text: "Het is oké om intensiteit of volume iets te verlagen richting het einde van deze fase." },
      { title: "Stress waar mogelijk verminderen", text: "Korte ontspanningsmomenten kunnen in deze fase net dat beetje extra rust geven." },
    ],
    whyText:
      "Deze suggesties zijn algemeen en informatief — geen medisch advies. Klachten en energie in de luteale fase verschillen sterk per persoon.",
  },
}

export function getPhaseContent(phase: CyclePhase): PhaseContent {
  return PHASE_CONTENT[phase]
}
