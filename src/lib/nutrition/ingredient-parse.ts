/**
 * Recipe ingredients are stored as free-text strings (e.g. "200g zalmfilet",
 * "1/2 komkommer", "2 teentjes knoflook", "handvol spinazie") rather than
 * structured {name, amount, unit} data. This splits a best-effort leading
 * quantity off the front so the grocery list can group "komkommer" across
 * recipes and scale amounts when she changes porties. It's intentionally
 * forgiving — when nothing recognizable is found, the whole line is kept
 * as the name rather than guessing wrong.
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
  "grammen",
  "kg",
  "ml",
  "l",
  "el",
  "tl",
  "eetlepel",
  "eetlepels",
  "theelepel",
  "theelepels",
  "blik",
  "blikken",
  "blikje",
  "blikjes",
  "teentje",
  "teentjes",
  "snee",
  "sneetjes",
  "stuk",
  "stuks",
  "plakje",
  "plakjes",
  "bos",
  "bosje",
  "pak",
  "pakje",
  "bakje",
])

/** Map verbose Dutch units onto the short forms we already scale/sum. */
const UNIT_ALIASES: Record<string, string> = {
  gram: "g",
  grammen: "g",
  eetlepel: "el",
  eetlepels: "el",
  theelepel: "tl",
  theelepels: "tl",
  teentjes: "teentje",
  sneetjes: "snee",
  stuks: "stuk",
  blikken: "blik",
  blikje: "blik",
  blikjes: "blik",
  plakjes: "plakje",
  bosje: "bos",
  pakje: "pak",
}

const WORD_QUANTITIES = ["handvol", "handje", "scheutje", "snufje"]

const UNICODE_FRACTIONS: Record<string, number> = {
  "½": 0.5,
  "¼": 0.25,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
}

function formatAmount(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0"
  const rounded = Math.round(n * 100) / 100
  if (Number.isInteger(rounded) || Math.abs(rounded - Math.round(rounded)) < 0.02) {
    return String(Math.round(rounded))
  }
  const fractionPairs: Array<[number, string]> = [
    [0.25, "¼"],
    [0.33, "⅓"],
    [0.5, "½"],
    [0.67, "⅔"],
    [0.75, "¾"],
  ]
  for (const [value, label] of fractionPairs) {
    if (Math.abs(rounded - value) < 0.03) return label
  }
  return String(Math.round(rounded * 10) / 10).replace(".", ",")
}

function normalizeUnit(unit: string): string {
  const key = unit.toLowerCase().replace(/[.,]/g, "")
  return UNIT_ALIASES[key] ?? key
}

function formatQuantity(amount: number, unit: string): string {
  const n = formatAmount(amount)
  if (!unit) return n
  const compact = ["g", "kg", "ml", "l"].includes(unit.toLowerCase())
  if (compact) return `${n}${unit}`
  const plural: Record<string, string> = {
    teentje: "teentjes",
    snee: "sneetjes",
    plakje: "plakjes",
    blik: "blikken",
    stuk: "stuks",
  }
  const singular: Record<string, string> = {
    teentjes: "teentje",
    sneetjes: "snee",
    plakjes: "plakje",
    blikken: "blik",
    stuks: "stuk",
  }
  // Dutch: "½ blik", "1 blik", "2 blikken" — only more than one is plural.
  const displayUnit = amount > 1.05 ? (plural[unit] ?? unit) : (singular[unit] ?? unit)
  return `${n} ${displayUnit}`
}

/**
 * Strip prep notes that shouldn't create separate grocery rows
 * ("avocado, in plakjes" → "avocado").
 */
export function cleanIngredientName(name: string): string {
  let cleaned = name.trim()
  const comma = cleaned.search(/,\s*(in |op |voor |naar |gesneden|gehakt|geraspt|fijngesneden)/i)
  if (comma > 0) cleaned = cleaned.slice(0, comma)
  cleaned = cleaned.replace(/^(een|de|het)\s+/i, "")
  return cleaned.trim()
}

export function normalizeIngredientName(name: string): string {
  return cleanIngredientName(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .replace(
      /^(rijpe?|verse?|gedroogde|bevroren|kleine|grote|zoete|gesnipperde|fijngehakte|gehakte|geraspte|gesneden|uitgelekte|liter)\s+/g,
      "",
    )
    .replace(/\b(avocados|avocado's)\b/g, "avocado")
    .replace(/\b(eieren)\b/g, "ei")
    .replace(/\b(tomaten)\b/g, "tomaat")
    .replace(/\b(bananen)\b/g, "banaan")
    .replace(/\b(wortelen|wortels)\b/g, "wortel")
    .replace(/\b(uie?n)\b/g, "ui")
    .replace(/\b(courgettes)\b/g, "courgette")
    .replace(/\b(paprikas)\b/g, "paprika")
    .replace(/\b(komkommers)\b/g, "komkommer")
    .replace(/\b(champignons)\b/g, "champignon")
    .replace(/\b(aardappels|aardappelen)\b/g, "aardappel")
    .replace(/\b(appels)\b/g, "appel")
    .replace(/\b(citroenen)\b/g, "citroen")
    .replace(/\b(limoenen)\b/g, "limoen")
    .trim()
}

function takeLeadingAmount(input: string): { amount: number; rest: string } | null {
  // "1 1/2 ..."
  let m = input.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)\b\s*(.*)$/)
  if (m) {
    const denom = Number(m[3])
    if (denom > 0) {
      return { amount: Number(m[1]) + Number(m[2]) / denom, rest: m[4] }
    }
  }
  // "1½ ..." (digit + unicode fraction, optional space)
  m = input.match(/^(\d+)\s*([½¼¾⅓⅔])\s*(.*)$/)
  if (m) {
    return { amount: Number(m[1]) + (UNICODE_FRACTIONS[m[2]] ?? 0), rest: m[3] }
  }
  // "½ ..." or "1/2 ..."
  m = input.match(/^([½¼¾⅓⅔])\s*(.*)$/)
  if (m) {
    return { amount: UNICODE_FRACTIONS[m[1]] ?? 0, rest: m[2] }
  }
  m = input.match(/^(\d+)\s*\/\s*(\d+)\b\s*(.*)$/)
  if (m) {
    const denom = Number(m[2])
    if (denom > 0) return { amount: Number(m[1]) / denom, rest: m[3] }
  }
  // "200g ..." attached unit
  m = input.match(/^(\d+(?:[.,]\d+)?)(g|kg|ml|l)\b\s*(.*)$/i)
  if (m) {
    return {
      amount: Number.parseFloat(m[1].replace(",", ".")),
      rest: `${m[2]} ${m[3]}`.trim(),
    }
  }
  // "200 ..." / "1,5 ..."
  m = input.match(/^(\d+(?:[.,]\d+)?)\b\s*(.*)$/)
  if (m) {
    return { amount: Number.parseFloat(m[1].replace(",", ".")), rest: m[2] }
  }
  return null
}

export function parseIngredientLine(raw: string): ParsedIngredient {
  const trimmed = raw.trim()
  if (!trimmed) return build(null, "")

  // "halve avocado" / "half ei"
  const halfMatch = trimmed.match(/^(halve?|half)\s+(.+)$/i)
  if (halfMatch) {
    return build(formatQuantity(0.5, ""), cleanIngredientName(halfMatch[2]))
  }

  // "een stuk komkommer" / "stukje gember"
  const stukMatch = trimmed.match(/^(een\s+)?stuk(je)?\s+(.+)$/i)
  if (stukMatch) {
    return build(formatQuantity(1, "stuk"), cleanIngredientName(stukMatch[3]))
  }

  // "sap van 1/2 limoen" / "sap van 1 citroen"
  const sapMatch = trimmed.match(/^sap\s+van\s+(.+)$/i)
  if (sapMatch) {
    const inner = parseIngredientLine(sapMatch[1])
    return build(inner.quantity ?? "1", cleanIngredientName(inner.name || sapMatch[1]))
  }

  // Leading unit word without number: "eetlepel citroensap" → 1 el
  const leadingUnit = trimmed.match(/^([A-Za-zÀ-ÿ]+)\s+(.+)$/)
  if (leadingUnit) {
    const unitRaw = leadingUnit[1].toLowerCase().replace(/[.,]/g, "")
    if (UNIT_WORDS.has(unitRaw)) {
      return build(formatQuantity(1, normalizeUnit(unitRaw)), cleanIngredientName(leadingUnit[2]))
    }
  }

  for (const word of WORD_QUANTITIES) {
    const re = new RegExp(`^${word}\\s+(.*)$`, "i")
    const match = trimmed.match(re)
    if (match) {
      return build(word, cleanIngredientName(match[1]))
    }
  }

  const leading = takeLeadingAmount(trimmed)
  if (leading) {
    const rest = leading.rest.trim()
    const [firstWord, ...restWords] = rest.split(/\s+/).filter(Boolean)
    const firstWordClean = (firstWord ?? "").toLowerCase().replace(/[.,]/g, "")
    if (firstWordClean && UNIT_WORDS.has(firstWordClean)) {
      const unit = normalizeUnit(firstWordClean)
      const name = cleanIngredientName(restWords.join(" ").trim())
      return build(formatQuantity(leading.amount, unit), name || trimmed)
    }
    return build(formatQuantity(leading.amount, ""), cleanIngredientName(rest || trimmed))
  }

  return build(null, cleanIngredientName(trimmed))
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
