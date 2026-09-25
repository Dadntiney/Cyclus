/**
 * "Waarom past dit ingrediënt hier?" content for the interactive ingredient
 * explainer. Deliberately conservative in tone — nutrients are described
 * with "levert", "bevat" or "kan bijdragen aan", never "verhoogt/verlaagt
 * hormoon X" or disease-prevention claims. Keyed by a short match key that's
 * looked up as a substring of the normalized ingredient name, so "zalmfilet"
 * and "gerookte zalm" both match the "zalm" entry.
 */

export interface IngredientInfo {
  emoji: string
  /** Display name for the explainer sheet header. */
  label: string
  nutrients: string[]
  explanation: string
}

// Order matters: matched top-to-bottom, so put more specific keys first
// (e.g. "zoete aardappel" before "aardappel").
export const INGREDIENT_INFO: [key: string, info: IngredientInfo][] = [
  [
    "zoete aardappel",
    {
      emoji: "🍠",
      label: "Zoete aardappel",
      nutrients: ["Vezels", "Bètacaroteen", "Kalium", "Complexe koolhydraten"],
      explanation:
        "Zoete aardappel levert complexe koolhydraten en vezels die je geleidelijk energie geven, plus bètacaroteen (dat je lichaam omzet in vitamine A).",
    },
  ],
  [
    "zalm",
    {
      emoji: "🐟",
      label: "Zalm",
      nutrients: ["Omega-3 vetzuren", "Eiwitten", "Vitamine D"],
      explanation:
        "Zalm is een bron van omega-3 vetzuren en volwaardige eiwitten, en levert daarnaast vitamine D — past goed binnen een gebalanceerd voedingspatroon.",
    },
  ],
  [
    "spinazie",
    {
      emoji: "🥬",
      label: "Spinazie",
      nutrients: ["Foliumzuur", "Vitamine K", "Vitamine C", "Magnesium", "IJzer"],
      explanation:
        "Spinazie bevat onder andere foliumzuur, vitamine K, vitamine C, magnesium en ijzer. Magnesium draagt bij aan een normale spier- en zenuwfunctie.",
    },
  ],
  [
    "broccoli",
    {
      emoji: "🥦",
      label: "Broccoli",
      nutrients: ["Vitamine C", "Vitamine K", "Vezels", "Foliumzuur"],
      explanation:
        "Broccoli levert veel vitamine C en K, plus vezels die bijdragen aan een goede spijsvertering.",
    },
  ],
  [
    "olijfolie",
    {
      emoji: "🫒",
      label: "Olijfolie",
      nutrients: ["Onverzadigde vetten", "Vitamine E"],
      explanation:
        "Olijfolie bestaat grotendeels uit onverzadigde vetten en levert vitamine E — een gangbare keuze binnen een gevarieerd voedingspatroon.",
    },
  ],
  [
    "havermout",
    {
      emoji: "🥣",
      label: "Havermout",
      nutrients: ["Vezels (bèta-glucanen)", "Complexe koolhydraten", "Eiwitten"],
      explanation:
        "Havermout bevat vezels (waaronder bèta-glucanen) en complexe koolhydraten, die zorgen voor geleidelijke energieafgifte in plaats van een snelle piek.",
    },
  ],
  [
    "chiazaad",
    {
      emoji: "🌱",
      label: "Chiazaad",
      nutrients: ["Vezels", "Omega-3 vetzuren (plantaardig)", "Eiwitten"],
      explanation:
        "Chiazaad is rijk aan vezels en levert plantaardige omega-3 vetzuren — het zwelt op in vocht, wat bijdraagt aan een verzadigd gevoel.",
    },
  ],
  [
    "bes",
    {
      emoji: "🫐",
      label: "Bessen",
      nutrients: ["Vitamine C", "Antioxidanten", "Vezels"],
      explanation:
        "Bessen leveren vitamine C, vezels en diverse antioxidanten, en zijn relatief laag in suiker vergeleken met veel ander fruit.",
    },
  ],
  [
    "honing",
    {
      emoji: "🍯",
      label: "Honing",
      nutrients: ["Snelle koolhydraten"],
      explanation:
        "Honing is in essentie een vorm van suiker — lekker in kleine hoeveelheden, maar geen bron van belangrijke voedingsstoffen.",
    },
  ],
  [
    "linz",
    {
      emoji: "🫘",
      label: "Linzen",
      nutrients: ["Plantaardige eiwitten", "Vezels", "IJzer", "Foliumzuur"],
      explanation:
        "Linzen zijn een goede plantaardige eiwit- en vezelbron en leveren daarnaast ijzer en foliumzuur.",
    },
  ],
  [
    "feta",
    {
      emoji: "🧀",
      label: "Feta",
      nutrients: ["Eiwitten", "Calcium", "Verzadigd vet"],
      explanation:
        "Feta levert eiwitten en calcium; het bevat ook wat meer verzadigd vet en zout, dus past het best in beperkte hoeveelheden.",
    },
  ],
  [
    "rucola",
    {
      emoji: "🥬",
      label: "Rucola",
      nutrients: ["Vitamine K", "Vitamine C", "Nitraat"],
      explanation: "Rucola is een bladgroente die vitamine K en C levert, en van nature laag in calorieën is.",
    },
  ],
  [
    "cherrytomaat",
    {
      emoji: "🍅",
      label: "Cherrytomaatjes",
      nutrients: ["Vitamine C", "Lycopeen"],
      explanation:
        "Cherrytomaatjes leveren vitamine C en lycopeen, een antioxidant die de rode kleur van tomaten geeft.",
    },
  ],
  [
    "tomaat",
    {
      emoji: "🍅",
      label: "Tomaat",
      nutrients: ["Vitamine C", "Lycopeen"],
      explanation: "Tomaten leveren vitamine C en lycopeen, een antioxidant die de rode kleur geeft.",
    },
  ],
  [
    "kikkererwt",
    {
      emoji: "🧆",
      label: "Kikkererwten",
      nutrients: ["Plantaardige eiwitten", "Vezels", "Foliumzuur"],
      explanation:
        "Kikkererwten zijn een goede plantaardige eiwit- en vezelbron, en dragen bij aan een verzadigd gevoel na de maaltijd.",
    },
  ],
  [
    "kokosmelk",
    {
      emoji: "🥥",
      label: "Kokosmelk",
      nutrients: ["Verzadigd vet", "Energie"],
      explanation:
        "Kokosmelk maakt gerechten romig, maar bevat relatief veel verzadigd vet — lekker als smaakmaker, in beperkte hoeveelheden.",
    },
  ],
  [
    "ui",
    {
      emoji: "🧅",
      label: "Ui",
      nutrients: ["Vezels", "Antioxidanten"],
      explanation: "Ui levert vezels en diverse plantaardige antioxidanten, en is een basis in veel gerechten.",
    },
  ],
  [
    "knoflook",
    {
      emoji: "🧄",
      label: "Knoflook",
      nutrients: ["Zwavelverbindingen"],
      explanation:
        "Knoflook wordt vooral gebruikt om smaak toe te voegen; in de hoeveelheden die je in een gerecht gebruikt, is de bijdrage aan je voedingsstoffen beperkt.",
    },
  ],
  [
    "griekse yoghurt",
    {
      emoji: "🥣",
      label: "Griekse yoghurt",
      nutrients: ["Eiwitten", "Calcium", "Probiotica"],
      explanation:
        "Griekse yoghurt is relatief eiwitrijk vergeleken met gewone yoghurt, en levert calcium.",
    },
  ],
  [
    "kwark",
    {
      emoji: "🥣",
      label: "Kwark",
      nutrients: ["Eiwitten", "Calcium"],
      explanation: "Kwark is van nature eiwitrijk en laag in vet, en levert daarnaast calcium.",
    },
  ],
  [
    "walnoot",
    {
      emoji: "🌰",
      label: "Walnoten",
      nutrients: ["Onverzadigde vetten", "Omega-3 vetzuren (plantaardig)", "Magnesium"],
      explanation:
        "Walnoten leveren onverzadigde vetten (waaronder plantaardige omega-3) en magnesium — een voedzame, calorierijke toevoeging in kleine hoeveelheden.",
    },
  ],
  [
    "amandel",
    {
      emoji: "🌰",
      label: "Amandelen",
      nutrients: ["Onverzadigde vetten", "Vitamine E", "Magnesium"],
      explanation: "Amandelen leveren onverzadigde vetten, vitamine E en magnesium.",
    },
  ],
  [
    "pompoenpit",
    {
      emoji: "🎃",
      label: "Pompoenpitten",
      nutrients: ["Magnesium", "Zink", "Onverzadigde vetten"],
      explanation:
        "Pompoenpitten zijn een plantaardige bron van magnesium en zink, en leveren gezonde onverzadigde vetten.",
    },
  ],
  [
    "kaneel",
    {
      emoji: "🧂",
      label: "Kaneel",
      nutrients: ["Antioxidanten"],
      explanation: "Kaneel wordt vooral gebruikt als smaakmaker en bevat enkele plantaardige antioxidanten.",
    },
  ],
  [
    "kipfilet",
    {
      emoji: "🍗",
      label: "Kipfilet",
      nutrients: ["Eiwitten", "Vitamine B6", "Selenium"],
      explanation: "Kipfilet is een magere bron van volwaardige eiwitten en levert vitamine B6.",
    },
  ],
  [
    "quinoa",
    {
      emoji: "🌾",
      label: "Quinoa",
      nutrients: ["Complexe koolhydraten", "Plantaardige eiwitten", "Magnesium"],
      explanation:
        "Quinoa is een volkoren graan (technisch een zaad) dat naast koolhydraten ook een relatief hoog eiwitgehalte levert voor een graanproduct.",
    },
  ],
  [
    "banaan",
    {
      emoji: "🍌",
      label: "Banaan",
      nutrients: ["Kalium", "Vezels", "Koolhydraten"],
      explanation: "Banaan levert kalium, vezels en snel beschikbare energie uit koolhydraten.",
    },
  ],
  [
    "granola",
    {
      emoji: "🥣",
      label: "Granola",
      nutrients: ["Vezels", "Koolhydraten"],
      explanation:
        "Granola levert vezels, maar bevat vaak ook toegevoegde suikers en vetten — check het etiket als je hierop let.",
    },
  ],
  [
    "kokosrasp",
    {
      emoji: "🥥",
      label: "Kokosrasp",
      nutrients: ["Vezels", "Verzadigd vet"],
      explanation: "Kokosrasp geeft crunch en smaak, en bevat met name verzadigd vet — een toevoeging in kleine hoeveelheden.",
    },
  ],
  [
    "pompoen",
    {
      emoji: "🎃",
      label: "Pompoen",
      nutrients: ["Bètacaroteen", "Vezels", "Kalium"],
      explanation: "Pompoen levert bètacaroteen, vezels en is van nature laag in calorieën.",
    },
  ],
  [
    "bouillon",
    {
      emoji: "🥣",
      label: "Bouillon",
      nutrients: ["Vocht", "Natrium"],
      explanation: "Bouillon draagt vooral bij aan smaak en vochtinname; let op het zoutgehalte bij kant-en-klare varianten.",
    },
  ],
  [
    "rijst",
    {
      emoji: "🍚",
      label: "Rijst",
      nutrients: ["Koolhydraten"],
      explanation: "Rijst is vooral een bron van koolhydraten; volkoren rijst levert daarnaast meer vezels dan witte rijst.",
    },
  ],
  [
    "diepvriesgroente",
    {
      emoji: "🥦",
      label: "Diepvriesgroenten",
      nutrients: ["Vezels", "Vitamines (variëren per groente)"],
      explanation:
        "Diepvriesgroenten worden vlak na de oogst ingevroren en behouden daardoor vaak net zoveel voedingsstoffen als verse groenten — en zijn een praktische, betaalbare optie.",
    },
  ],
  [
    "tonijn",
    {
      emoji: "🐟",
      label: "Tonijn",
      nutrients: ["Eiwitten", "Omega-3 vetzuren", "Vitamine D"],
      explanation: "Tonijn is een magere bron van eiwitten en levert omega-3 vetzuren en vitamine D.",
    },
  ],
  [
    "eieren",
    {
      emoji: "🥚",
      label: "Ei",
      nutrients: ["Eiwitten", "Vitamine B12", "Choline"],
      explanation: "Eieren leveren volwaardige eiwitten en een breed pakket aan vitamines en mineralen, waaronder B12.",
    },
  ],
  [
    "ei",
    {
      emoji: "🥚",
      label: "Ei",
      nutrients: ["Eiwitten", "Vitamine B12", "Choline"],
      explanation: "Eieren leveren volwaardige eiwitten en een breed pakket aan vitamines en mineralen, waaronder B12.",
    },
  ],
  [
    "aardappel",
    {
      emoji: "🥔",
      label: "Aardappel",
      nutrients: ["Koolhydraten", "Kalium", "Vitamine C"],
      explanation: "Aardappelen leveren vooral koolhydraten, en daarnaast kalium en een beetje vitamine C.",
    },
  ],
  [
    "appel",
    {
      emoji: "🍎",
      label: "Appel",
      nutrients: ["Vezels", "Vitamine C"],
      explanation: "Een appel levert vezels (zeker met schil) en vitamine C.",
    },
  ],
  [
    "bruine bon",
    {
      emoji: "🫘",
      label: "Bruine bonen",
      nutrients: ["Plantaardige eiwitten", "Vezels", "IJzer"],
      explanation: "Bruine bonen zijn een goede plantaardige eiwit- en vezelbron, en leveren ook ijzer.",
    },
  ],
  [
    "witte bon",
    {
      emoji: "🫘",
      label: "Witte bonen",
      nutrients: ["Plantaardige eiwitten", "Vezels", "IJzer"],
      explanation: "Witte bonen zijn een goede plantaardige eiwit- en vezelbron, en leveren ook ijzer.",
    },
  ],
  [
    "tomatenblokjes",
    {
      emoji: "🍅",
      label: "Tomatenblokjes",
      nutrients: ["Vitamine C", "Lycopeen"],
      explanation: "Tomaten uit blik leveren, net als verse tomaten, vitamine C en lycopeen.",
    },
  ],
  [
    "volkoren brood",
    {
      emoji: "🍞",
      label: "Volkoren brood",
      nutrients: ["Vezels", "Complexe koolhydraten"],
      explanation:
        "Volkoren brood bevat de hele graankorrel, wat zorgt voor meer vezels en een geleidelijkere energieafgifte dan wit brood.",
    },
  ],
  [
    "komkommer",
    {
      emoji: "🥒",
      label: "Komkommer",
      nutrients: ["Vocht", "Vitamine K"],
      explanation: "Komkommer bestaat grotendeels uit water en levert wat vitamine K, en is laag in calorieën.",
    },
  ],
  [
    "avocado",
    {
      emoji: "🥑",
      label: "Avocado",
      nutrients: ["Onverzadigde vetten", "Vezels", "Kalium"],
      explanation: "Avocado is rijk aan onverzadigde vetten en vezels, en levert ook kalium.",
    },
  ],
  [
    "kaas",
    {
      emoji: "🧀",
      label: "Kaas",
      nutrients: ["Eiwitten", "Calcium", "Verzadigd vet"],
      explanation: "Kaas levert eiwitten en calcium, en bevat ook verzadigd vet en zout — vooral lekker in beperkte hoeveelheden.",
    },
  ],
  [
    "rode linzen",
    {
      emoji: "🫘",
      label: "Rode linzen",
      nutrients: ["Plantaardige eiwitten", "Vezels", "IJzer"],
      explanation: "Rode linzen zijn een goede plantaardige eiwit- en vezelbron en leveren ijzer.",
    },
  ],
  [
    "kipfile",
    {
      emoji: "🍗",
      label: "Kip",
      nutrients: ["Eiwitten", "Vitamine B6"],
      explanation: "Kip is een magere bron van volwaardige eiwitten.",
    },
  ],
]

// Keys of 2 characters or less (e.g. "ui", "ei") are too short to safely
// substring-match — "ui" would otherwise match inside "kruiden" or
// "quinoa". Those require a full word match instead; longer keys keep
// substring matching so e.g. "tomaat" still matches "tomatenblokjes".
function matchesKey(normalizedName: string, key: string): boolean {
  if (key.length <= 2) {
    return normalizedName.split(" ").includes(key)
  }
  return normalizedName.includes(key)
}

/** Matches a parsed/normalized ingredient name against the explainer library. */
export function lookupIngredientInfo(normalizedName: string): (IngredientInfo & { matchKey: string }) | null {
  for (const [key, info] of INGREDIENT_INFO) {
    if (matchesKey(normalizedName, key)) {
      return { ...info, matchKey: key }
    }
  }
  return null
}
