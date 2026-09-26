/**
 * Recipe ingredients are stored as free-text strings (e.g. "200g zalmfilet",
 * "2 teentjes knoflook", "handvol spinazie") rather than structured
 * {name, amount, unit} data. This splits a best-effort leading quantity off
 * the front so the grocery list can group "zalmfilet" across recipes and the
 * ingredient explainer can match "spinazie" regardless of how much is asked
 * for. It's intentionally forgiving — when nothing recognizable is found,
 * the whole line is kept as the name rather than guessing wrong.
 */

export interface ParsedIngredient {
  raw: string
  quantity: string | null
  name: string
  /** Lowercased, accent-stripped, punctuation-stripped — for matching/grouping. */
  normalized: string
}

const UNIT_WORDS = new Set([
  "g",
  "gram",
  "kg",
  "ml",
  "l",
  "el",
  "tl",
  "blik",
  "blikje",
  "teentje",
  "teentjes",
  "snee",
  "sneetjes",
  "stuk",
  "stuks",
  "plakje",
  "plakjes",
])

const WORD_QUANTITIES = ["handvol", "handje", "scheutje", "snufje"]

export function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function parseIngredientLine(raw: string): ParsedIngredient {
  const trimmed = raw.trim()

  const numMatch = trimmed.match(/^(\d+(?:[.,]\d+)?)(g|kg|ml|l)?(\s+(.*))?$/i)
  if (numMatch) {
    const [, num, attachedUnit, , restAfterSpace] = numMatch
    if (attachedUnit) {
      const name = (restAfterSpace ?? "").trim()
      return build(`${num}${attachedUnit.toLowerCase()}`, name || trimmed)
    }
    const rest = (restAfterSpace ?? "").trim()
    const [firstWord, ...restWords] = rest.split(/\s+/)
    const firstWordClean = (firstWord ?? "").toLowerCase().replace(/[.,]/g, "")
    if (firstWordClean && UNIT_WORDS.has(firstWordClean)) {
      const name = restWords.join(" ").trim()
      return build(`${num} ${firstWordClean}`, name || trimmed)
    }
    return build(num, rest || trimmed)
  }

  for (const word of WORD_QUANTITIES) {
    const re = new RegExp(`^${word}\\s+(.*)$`, "i")
    const match = trimmed.match(re)
    if (match) {
      return build(word, match[1])
    }
  }

  return build(null, trimmed)
}

function build(quantity: string | null, name: string): ParsedIngredient {
  const cleanName = name.trim()
  return {
    raw: cleanName,
    quantity,
    name: cleanName,
    normalized: normalizeIngredientName(cleanName),
  }
}

export function parseIngredientList(list: unknown): string[] {
  return Array.isArray(list) ? list.filter((i): i is string => typeof i === "string") : []
}
