import { parseIngredientLine, parseIngredientList } from "@/lib/nutrition/ingredient-parse"
import { scaleQuantityForGrocery, tryAddQuantities } from "@/lib/nutrition/scale-ingredient"

export interface GroceryItem {
  /** Stable id for React keys and localStorage checkbox state: `${category}:${normalized}`. */
  id: string
  name: string
  category: string
  /** How many planned meals ask for this ingredient. */
  count: number
  quantities: string[]
  /** Best-effort summed amount when units match across occurrences. */
  totalQuantity: string | null
}

export interface GroceryCategory {
  category: string
  items: GroceryItem[]
}

/** One planned meal’s ingredients, optionally scaled to chosen porties. */
export type GroceryRecipeInput = {
  ingredients: unknown
  /** chosenServings / recipeBaseServings — defaults to 1. */
  factor?: number
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

/** Prefer a clean grocery label from the normalized key when plurals differ. */
function groceryDisplayName(name: string, normalized: string): string {
  if (normalized === "ei") return "Ei"
  if (normalized === "ui") return "Ui"
  if (normalized === "tomaat" && /tomaat/i.test(name)) return "Tomaat"
  if (normalized === "avocado") return "Avocado"
  if (normalized === "banaan") return "Banaan"
  if (normalized === "wortel") return "Wortel"
  if (normalized === "broccoli") return "Broccoli"
  if (normalized === "komkommer") return "Komkommer"
  // Drop leading size/ripeness adjectives for the list label.
  const stripped = name.replace(/^(rijpe?|verse?|gedroogde|bevroren|kleine|grote|zoete)\s+/i, "")
  return capitalize(stripped || name)
}

function normalizeInputs(recipeIngredients: Array<GroceryRecipeInput | unknown>): GroceryRecipeInput[] {
  return recipeIngredients.map((entry) => {
    if (entry && typeof entry === "object" && "ingredients" in (entry as object)) {
      const typed = entry as GroceryRecipeInput
      return { ingredients: typed.ingredients, factor: typed.factor ?? 1 }
    }
    return { ingredients: entry, factor: 1 }
  })
}

/**
 * Aggregates ingredients from planned meals into a categorized grocery list.
 * Pass one entry per meal occurrence; set `factor` to scale amounts to the
 * chosen number of porties relative to the recipe baseline.
 *
 * Quantity is kept separate from the name so "1/2 komkommer" becomes
 * name=Komkommer + qty=1/2 — and then scales with basis-porties.
 */
export function buildGroceryList(
  recipeIngredients: Array<GroceryRecipeInput | unknown>,
): GroceryCategory[] {
  const byId = new Map<string, GroceryItem>()

  for (const { ingredients, factor = 1 } of normalizeInputs(recipeIngredients)) {
    for (const raw of parseIngredientList(ingredients)) {
      const parsed = parseIngredientLine(raw)
      if (!parsed.normalized) continue
      const category = categorize(parsed.normalized)
      const id = `${category}:${parsed.normalized}`
      const quantity = scaleQuantityForGrocery(parsed.quantity, factor)
      const displayName = groceryDisplayName(parsed.name, parsed.normalized)
      const existing = byId.get(id)
      if (existing) {
        existing.count += 1
        // Prefer the shorter clean name when merging ("avocado" over
        // "rijpe avocado" if both normalize the same — they usually don't;
        // still useful for "komkommer" vs longer variants).
        if (displayName.length > 0 && displayName.length < existing.name.length) {
          existing.name = displayName
        }
        if (quantity) {
          if (existing.totalQuantity) {
            const summed = tryAddQuantities(existing.totalQuantity, quantity)
            existing.totalQuantity = summed ?? existing.totalQuantity
          } else {
            existing.totalQuantity = quantity
          }
          if (!existing.quantities.includes(quantity)) {
            existing.quantities.push(quantity)
          }
        }
      } else {
        byId.set(id, {
          id,
          name: displayName,
          category,
          count: 1,
          quantities: quantity ? [quantity] : [],
          totalQuantity: quantity,
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

export function groceryItemSubtitle(
  item: GroceryItem,
  scope: "week" | "day" = "week",
): string | null {
  const parts: string[] = []
  if (item.totalQuantity) {
    parts.push(item.totalQuantity)
  } else if (item.quantities.length) {
    parts.push(item.quantities[0])
  }
  if (scope === "week" && item.count > 1) {
    parts.push(`${item.count}× deze week`)
  } else if (scope === "day" && item.count > 1) {
    parts.push(`${item.count}× vandaag`)
  }
  return parts.length ? parts.join(" · ") : null
}
