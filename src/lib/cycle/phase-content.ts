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

export interface PhaseNutritionBasic {
  /** Nutrient or theme, e.g. "Magnesium", "Eiwitten". */
  label: string
  /** Hedged one-liner — why this theme often fits this phase. */
  text: string
  /** Concrete everyday products she can actually buy / cook with. */
  foods: string[]
}

export interface PhaseSnackTip {
  /** Short snack name, e.g. "Handje pompoenpitten". */
  title: string
  /** Concrete how-to / portion suggestion. */
  snack: string
  /** Hedged "why this fits" knowledge — nutrient basis, not hormone claims. */
  why: string
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
  /**
   * The practical "basis" for this phase: a few nutrient themes with real
   * food examples (magnesium products, protein sources, etc.). Shown on the
   * Cyclusdag detail page — separate from recipe matching above.
   */
  basics: PhaseNutritionBasic[]
  /**
   * Rotating tussendoor tips (nuts, seeds, yoghurt, fruit…) with a short
   * "why" — one is picked per day via getDailyPhaseSnackTip.
   */
  snackTips: PhaseSnackTip[]
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
    colors: {
      bg: "bg-phase-menstruatie-soft",
      text: "text-phase-menstruatie-text",
      dot: "bg-phase-menstruatie",
    },
    nutrition: {
      focusLabel: "IJzer, eiwit & warme, voedzame maaltijden",
      focusText:
        "Tijdens je menstruatie verlies je wat bloed — warme, voedzame maaltijden met ijzerrijke ingrediënten, voldoende eiwit en genoeg vocht passen daar vaak goed bij.",
      exampleFoods: ["Spinazie", "Rode linzen", "Zalm", "Eieren", "Griekse yoghurt", "Pompoensoep"],
      recipeCategories: ["Diner", "Lunch", "Eiwitrijk"],
      nutrients: ["IJzer", "Eiwitten", "Vitamine C", "Magnesium", "Vocht"],
      basics: [
        {
          label: "IJzer",
          text: "IJzerrijke voeding past goed bij bloedverlies; vitamine C helpt je lichaam plantaardig ijzer beter op te nemen.",
          foods: ["Rode linzen", "Spinazie", "Kidneybonen", "Tofu", "Mager rundvlees", "Pompoenpitten"],
        },
        {
          label: "Vitamine C (bij ijzer)",
          text: "Combineer plantaardig ijzer met iets vitamine C-rijks — bijvoorbeeld paprika of citrus bij een linzenschotel.",
          foods: ["Paprika", "Kiwi", "Sinaasappel", "Broccoli", "Aardbei"],
        },
        {
          label: "Eiwitten",
          text: "Eiwit bij maaltijden helpt verzadiging en herstel — ook op dagen met minder energie.",
          foods: ["Eieren", "Griekse yoghurt", "Kwark", "Zalm", "Kip", "Linzen"],
        },
        {
          label: "Magnesium",
          text: "Magnesium draagt bij aan een normale spier- en zenuwfunctie; sommige vrouwen vinden magnesiumrijke snacks prettig bij krampen.",
          foods: ["Pompoenpitten", "Donkere chocolade (70%+)", "Amandelen", "Spinazie", "Banaan"],
        },
      ],
      snackTips: [
        {
          title: "Pompoenpitten + stukje fruit",
          snack: "Een handje pompoenpitten met kiwi of sinaasappel.",
          why: "Pitten leveren magnesium en wat ijzer; vitamine C uit fruit helpt plantaardig ijzer beter opnemen — handig rondom bloedverlies.",
        },
        {
          title: "Griekse yoghurt met amandelen",
          snack: "Een bakje Griekse yoghurt met een handje amandelen.",
          why: "Eiwit en calcium uit yoghurt plus magnesium uit noten: verzadigend tussendoor zonder snelle suikerpiek.",
        },
        {
          title: "Pure chocolade + walnoten",
          snack: "2–3 blokjes pure chocolade (70%+) met een paar walnoten.",
          why: "Pure cacao en noten leveren magnesium; klein genieten past beter dan alleen zoet als trek oploopt.",
        },
        {
          title: "Banaan met pindakaas",
          snack: "Halve banaan met een theelepel 100% pindakaas.",
          why: "Kalium en koolhydraten voor snelle energie, notenpasta voor eiwit en verzadiging — fijn op vermoeide dagen.",
        },
      ],
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
    colors: {
      bg: "bg-phase-folliculair-soft",
      text: "text-phase-folliculair-text",
      dot: "bg-phase-folliculair",
    },
    nutrition: {
      focusLabel: "Eiwit, vezels & stevige energie",
      focusText:
        "Met vaak wat meer energie kun je in deze fase goed uit de voeten met volwaardige eiwitten, vezels en complexe koolhydraten — de basis voor stabielere energie over de dag.",
      exampleFoods: ["Quinoa", "Kipfilet", "Eieren", "Broccoli", "Bessen", "Havermout", "Kwark"],
      recipeCategories: ["Lunch", "Ontbijt", "Snel", "Eiwitrijk"],
      nutrients: ["Eiwitten", "Vezels", "B-vitamines", "Foliumzuur"],
      basics: [
        {
          label: "Eiwitten",
          text: "Eiwit bij elke maaltijd blijft de basis — handig als je energie en training wat omhoog gaan.",
          foods: ["Kipfilet", "Eieren", "Kwark", "Griekse yoghurt", "Tofu", "Kikkererwten"],
        },
        {
          label: "Complexe koolhydraten & vezels",
          text: "Haver, quinoa en volkoren geven geleidelijk energie in plaats van een snelle piek-en-dal.",
          foods: ["Havermout", "Quinoa", "Volkoren brood", "Zoete aardappel", "Bessen"],
        },
        {
          label: "Foliumzuur & B-vitamines",
          text: "Bladgroenten en peulvruchten leveren foliumzuur en B-vitamines die in deze opbouwfase vaak goed passen.",
          foods: ["Spinazie", "Broccoli", "Linzen", "Avocado", "Eieren"],
        },
      ],
      snackTips: [
        {
          title: "Kwark met bessen en chia",
          snack: "Kwark of Skyr met een handje bessen en een theelepel chiazaad.",
          why: "Eiwit plus vezels geven rustige energie als je tempo omhoog gaat — chia levert plantaardige omega-3 en verzadiging.",
        },
        {
          title: "Handje gemengde noten",
          snack: "Een handje amandelen, walnoten of een notenmix (zonder suiker).",
          why: "Noten geven gezonde vetten, wat eiwit en magnesium — een stevige basis-tussendoortje zonder snelle piek.",
        },
        {
          title: "Havermout-reep of appel met notenboter",
          snack: "Appel of peer met een theelepel amandel- of pindakaas.",
          why: "Vezels uit fruit en eiwit/vet uit notenpasta houden je energie gelijkmatiger tussen maaltijden.",
        },
        {
          title: "Hummus met komkommer",
          snack: "Een paar lepels hummus met komkommer- of wortelreepjes.",
          why: "Kikkererwten leveren plantaardig eiwit en vezels — licht, maar wél voedzaam als je actiever bent.",
        },
      ],
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
    colors: {
      bg: "bg-phase-ovulatie-soft",
      text: "text-phase-ovulatie-text",
      dot: "bg-phase-ovulatie",
    },
    nutrition: {
      focusLabel: "Kleur, omega-3 & eiwit",
      focusText:
        "Een gevarieerd bord met veel kleur, eiwit en gezonde vetten (zoals omega-3) past goed bij deze vaak actievere fase — geen speciale ‘superfood-kuur’, wel een stevige basis.",
      exampleFoods: ["Cherrytomaatjes", "Avocado", "Zalm", "Rucola", "Walnoten", "Eieren", "Paprika"],
      recipeCategories: ["Diner", "Eiwitrijk", "Vegetarisch"],
      nutrients: ["Antioxidanten", "Omega-3 vetzuren", "Eiwitten", "Vezels"],
      basics: [
        {
          label: "Eiwitten",
          text: "Houd eiwit als anker — handig als je rondom de eisprong actiever traint of beweegt.",
          foods: ["Zalm", "Eieren", "Kip", "Griekse yoghurt", "Linzen"],
        },
        {
          label: "Omega-3 vetzuren",
          text: "Vette vis en walnoten leveren omega-3; dat past goed in een gevarieerd weekpatroon.",
          foods: ["Zalm", "Makreel", "Walnoten", "Chiazaad", "Lijnzaad"],
        },
        {
          label: "Kleurrijke groenten & fruit",
          text: "Veel kleur op je bord betekent vaak meer vezels en plantaardige stoffen — praktisch en verzadigend.",
          foods: ["Cherrytomaatjes", "Paprika", "Rucola", "Bessen", "Wortel"],
        },
        {
          label: "Gezonde vetten",
          text: "Avocado, olijfolie en noten geven verzadiging naast eiwit en groenten.",
          foods: ["Avocado", "Olijfolie", "Walnoten", "Amandelen"],
        },
      ],
      snackTips: [
        {
          title: "Walnoten en bessen",
          snack: "Een handje walnoten met een handje blauwe bessen of frambozen.",
          why: "Walnoten leveren plantaardige omega-3; bessen geven kleur, vezels en vitamine C — past bij een actieve, kleurrijke basis.",
        },
        {
          title: "Avocado op een cracker",
          snack: "Halve avocado op een volkoren cracker of rijstwafel, met peper.",
          why: "Onverzadigde vetten en vezels verzadigen goed — handig als je meer beweegt rondom de eisprong.",
        },
        {
          title: "Trailmix met zaden",
          snack: "Kleine mix van pompoenpitten, zonnebloempitten en een paar rozijnen.",
          why: "Pitten en zaden leveren mineralen en gezonde vetten; houd het portie klein zodat het écht tussendoor blijft.",
        },
        {
          title: "Griekse yoghurt met lijnzaad",
          snack: "Griekse yoghurt met een theelepel gemalen lijnzaad en wat honing naar smaak.",
          why: "Eiwit als anker plus plantaardige omega-3 uit lijnzaad — stevig zonder zwaar te zijn.",
        },
      ],
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
    colors: {
      bg: "bg-phase-luteaal-soft",
      text: "text-phase-luteaal-text",
      dot: "bg-phase-luteaal",
    },
    nutrition: {
      focusLabel: "Magnesium, eiwit & stabiele energie",
      focusText:
        "Magnesiumrijke producten, voldoende eiwit en vezelrijke maaltijden passen vaak goed bij deze fase — vooral als trek of stemming wat wisselt richting het einde van je cyclus.",
      exampleFoods: [
        "Pompoenpitten",
        "Amandelen",
        "Donkere chocolade",
        "Zoete aardappel",
        "Zalm",
        "Spinazie",
        "Griekse yoghurt",
      ],
      recipeCategories: ["Diner", "Eiwitrijk", "Voorbereiden"],
      nutrients: ["Magnesium", "Eiwitten", "Vezels", "Vitamine B6"],
      basics: [
        {
          label: "Magnesium",
          text: "Goede magnesiumbronnen zijn makkelijk als snack of topping — denk aan pitten, noten, bladgroen en een stukje pure chocolade.",
          foods: [
            "Pompoenpitten",
            "Amandelen",
            "Cashewnoten",
            "Spinazie",
            "Quinoa",
            "Donkere chocolade (70%+)",
            "Zwarte bonen",
          ],
        },
        {
          label: "Eiwitten",
          text: "Eiwit helpt verzadiging als trek toeneemt; combineer met vezels in plaats van alleen zoet tussendoor.",
          foods: ["Griekse yoghurt", "Kwark", "Zalm", "Eieren", "Kikkererwten", "Tofu"],
        },
        {
          label: "Vezels & complexe koolhydraten",
          text: "Zoete aardappel, haver en peulvruchten geven rustigere energie — handig bij wisselende trek.",
          foods: ["Zoete aardappel", "Havermout", "Linzen", "Volkoren brood", "Peer"],
        },
        {
          label: "Vitamine B6",
          text: "B6 zit in veel alledaagse producten; het is geen wonderpil, wél een nuttig deel van een gevarieerd bord.",
          foods: ["Kip", "Zalm", "Banaan", "Aardappel", "Kikkererwten"],
        },
      ],
      snackTips: [
        {
          title: "Magnesiummix: pitten & pure chocolade",
          snack: "Handje pompoenpitten of cashews, eventueel met 1–2 blokjes pure chocolade.",
          why: "Magnesiumrijke snacks passen vaak goed als trek of spanning toeneemt richting je menstruatie — zonder alleen op zoet te leunen.",
        },
        {
          title: "Kwark met kaneel en peer",
          snack: "Kwark of Griekse yoghurt met plakjes peer en een snuf kaneel.",
          why: "Eiwit dempt trek; vezels uit fruit geven een rustiger energiegevoel dan alleen iets zoets.",
        },
        {
          title: "Amandelen en dadels",
          snack: "Een handje amandelen met 1–2 dadels (of andersom: meer noten, minder zoet).",
          why: "Noten leveren magnesium en verzadiging; een beetje zoet mag, zolang eiwit/vet meekomt.",
        },
        {
          title: "Hummus of edamame",
          snack: "Hummus met paprika, of een bakje edamame met een snuf zout.",
          why: "Plantaardig eiwit en vezels — een stevige basis als je tussendoor sneller honger hebt in deze fase.",
        },
      ],
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

function seededIndex(seed: string, length: number): number {
  if (length <= 0) return 0
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % length
}

/** Picks one phase snack tip for the day — stable for a given seed. */
export function getDailyPhaseSnackTip(phase: CyclePhase, seed: string): PhaseSnackTip {
  const tips = PHASE_CONTENT[phase].nutrition.snackTips
  return tips[seededIndex(`${seed}-snack`, tips.length)]
}
