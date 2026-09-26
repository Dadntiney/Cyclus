import { parseIngredientLine, parseIngredientList } from "@/lib/nutrition/ingredient-parse"

export interface GroceryItem {
  /** Stable id for React keys and localStorage checkbox state: `${category}:${normalized}`. */
  id: string
  name: string
  category: string
  /** How many recipe-servings in the week ask for this ingredient. */
  count: number
  quantities: string[]
}

export interface GroceryCategory {
  category: string
  items: GroceryItem[]
}

const CATEGORY_ORDER = [
  "Groente",
  "Fruit",
  "Eiwitten",
  "Zuivel",
  "Granen & peulvruchten",
  "Noten & zaden",
  "Overig",
] as const

const CATEGORY_KEYWORDS: Record<(typeof CATEGORY_ORDER)[number], string[]> = {
  Groente: [
    "spinazie",
    "broccoli",
    "wortel",
    "ui",
    "knoflook",
    "paprika",
    "tomaat",
    "tomaten",
    "komkommer",
    "courgette",
    "aubergine",
    "champignon",
    "prei",
    "kool",
    "rucola",
    "radijs",
    "bloemkool",
    "pompoen",
    "aardappel",
    "groente",
    "sla",
  ],
  Fruit: ["banaan", "bes", "bessen", "appel", "peer", "citroen", "limoen", "avocado", "fruit"],
  Eiwitten: [
    "zalm",
    "kip",
    "tonijn",
    "ei",
    "eieren",
    "kikkererwt",
    "linz",
    "bonen",
    "tofu",
    "gehakt",
    "vis",
  ],
  Zuivel: ["yoghurt", "kwark", "melk", "feta", "kaas"],
  "Granen & peulvruchten": ["rijst", "quinoa", "havermout", "brood", "pasta", "granola"],
  "Noten & zaden": ["walnoot", "amandel", "pompoenpit", "chiazaad", "lijnzaad", "noten", "pijnboompit"],
  Overig: [],
}

// Keywords of 2 characters or less (e.g. "ui") are too short to safely
// substring-match — "ui" would otherwise match inside "quinoa" or
// "kruiden". Those require a full word match instead; longer keywords keep
// substring matching so e.g. "tomaat" still matches "tomaten"/"cherrytomaat".
function matchesKeyword(normalized: string, keyword: string): boolean {
  if (keyword.length <= 2) {
    return normalized.split(" ").includes(keyword)
  }
  return normalized.includes(keyword)
}

function categorize(normalized: string): (typeof CATEGORY_ORDER)[number] {
  for (const category of CATEGORY_ORDER) {
    const keywords = CATEGORY_KEYWORDS[category]
    if (keywords.some((k) => matchesKeyword(normalized, k))) return category
  }
  return "Overig"
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Aggregates raw ingredient strings from a set of recipes (one entry per
 * recipe *occurrence* in the week — pass the same recipe twice if it's
 * planned twice) into a categorized, deduplicated grocery list. Ingredients
 * used by multiple recipes collapse into a single line with a count instead
 * of one row per occurrence.
 */
export function buildGroceryList(recipeIngredients: unknown[]): GroceryCategory[] {
  const byId = new Map<string, GroceryItem>()

  for (const ingredients of recipeIngredients) {
    for (const raw of parseIngredientList(ingredients)) {
      const parsed = parseIngredientLine(raw)
      if (!parsed.normalized) continue
      const category = categorize(parsed.normalized)
      const id = `${category}:${parsed.normalized}`
      const existing = byId.get(id)
      if (existing) {
        existing.count += 1
        if (parsed.quantity && !existing.quantities.includes(parsed.quantity)) {
          existing.quantities.push(parsed.quantity)
        }
      } else {
        byId.set(id, {
          id,
          name: capitalize(parsed.name),
          category,
          count: 1,
          quantities: parsed.quantity ? [parsed.quantity] : [],
        })
      }
    }
  }

  const grouped = new Map<string, GroceryItem[]>()
  for (const item of byId.values()) {
    const list = grouped.get(item.category) ?? []
    list.push(item)
    grouped.set(item.category, list)
  }

  return CATEGORY_ORDER.filter((c) => grouped.has(c)).map((category) => ({
    category,
    items: (grouped.get(category) ?? []).sort((a, b) => a.name.localeCompare(b.name, "nl")),
  }))
}

export function groceryItemSubtitle(item: GroceryItem): string | null {
  if (item.count > 1) {
    return `${item.count}× nodig deze week`
  }
  if (item.quantities.length) {
    return item.quantities[0]
  }
  return null
}
