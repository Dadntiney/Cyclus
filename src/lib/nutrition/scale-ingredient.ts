import { parseIngredientLine, parseIngredientList } from "@/lib/nutrition/ingredient-parse"

/**
 * Scales free-text ingredient quantities by a servings factor
 * (chosen porties / recipe baseline). Non-numeric lines stay as-is.
 */

const PIECE_UNITS = new Set([
  "",
  "stuk",
  "stuks",
  "ei",
  "eieren",
  "teentje",
  "teentjes",
  "snee",
  "sneetjes",
  "plakje",
  "plakjes",
  "blik",
  "blikje",
  "bos",
  "pak",
  "bakje",
])

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

function parseAmountToken(token: string): number | null {
  const t = token.trim()
  const unicode: Record<string, number> = {
    "½": 0.5,
    "¼": 0.25,
    "¾": 0.75,
    "⅓": 1 / 3,
    "⅔": 2 / 3,
  }
  if (unicode[t] != null) return unicode[t]
  const frac = t.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (frac) {
    const a = Number(frac[1])
    const b = Number(frac[2])
    if (b > 0) return a / b
  }
  const n = Number.parseFloat(t.replace(",", "."))
  return Number.isFinite(n) ? n : null
}

/** Parse "200g", "1/2", "2 teentjes", "1,5 el" into amount + unit. */
export function parseQuantityParts(
  quantity: string,
): { amount: number; unit: string } | null {
  const trimmed = quantity.trim()
  // Mixed "1 1/2 el"
  const mixed = trimmed.match(/^(\d+)\s+(\d+\s*\/\s*\d+)\s*(.*)$/)
  if (mixed) {
    const whole = Number(mixed[1])
    const frac = parseAmountToken(mixed[2])
    if (frac == null) return null
    return { amount: whole + frac, unit: (mixed[3] ?? "").trim() }
  }
  const match = trimmed.match(/^([½¼¾⅓⅔]|\d+\s*\/\s*\d+|\d+(?:[.,]\d+)?)\s*(.*)$/i)
  if (!match) return null
  const amount = parseAmountToken(match[1])
  if (amount == null) return null
  return { amount, unit: (match[2] ?? "").trim() }
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

export function scaleQuantityString(quantity: string | null, factor: number): string | null {
  if (!quantity) return null
  // Word quantities (handvol) don't scale neatly — leave as-is.
  if (/^(handvol|handje|scheutje|snufje)$/i.test(quantity.trim())) return quantity
  if (Math.abs(factor - 1) < 0.001) return quantity
  const parts = parseQuantityParts(quantity)
  if (!parts) return quantity
  return formatQuantity(parts.amount * factor, parts.unit)
}

/**
 * Grocery-facing scale: always re-format amounts (so "0,5" becomes "½"),
 * and countable units round up so half a courgette still means buy one.
 */
export function scaleQuantityForGrocery(quantity: string | null, factor: number): string | null {
  if (!quantity) return null
  if (/^(handvol|handje|scheutje|snufje)$/i.test(quantity.trim())) return quantity
  const parts = parseQuantityParts(quantity)
  if (!parts) return quantity
  let amount = parts.amount * (Number.isFinite(factor) ? factor : 1)
  const unitKey = parts.unit.toLowerCase()
  if (PIECE_UNITS.has(unitKey)) {
    if (amount > 0 && amount < 1) amount = 1
    else if (amount > 1 && Math.abs(amount - Math.round(amount)) > 0.05) {
      amount = Math.ceil(amount - 1e-9)
    }
  }
  return formatQuantity(amount, parts.unit)
}

/** Sum two quantity strings when units match; otherwise null. */
export function tryAddQuantities(a: string, b: string): string | null {
  const pa = parseQuantityParts(a)
  const pb = parseQuantityParts(b)
  if (!pa || !pb) return null
  const unitA = pa.unit.toLowerCase()
  const unitB = pb.unit.toLowerCase()
  if (unitA === unitB) {
    return formatQuantity(pa.amount + pb.amount, pa.unit)
  }
  // Bare counts and "stuk" are the same for produce ("1/2" + "1 stuk").
  if ((unitA === "" && unitB === "stuk") || (unitA === "stuk" && unitB === "")) {
    return formatQuantity(pa.amount + pb.amount, "stuk")
  }
  return null
}

export function scaleIngredientLine(raw: string, factor: number): string {
  if (Math.abs(factor - 1) < 0.001) return raw
  const parsed = parseIngredientLine(raw)
  if (!parsed.quantity) return raw
  const scaledQty = scaleQuantityString(parsed.quantity, factor)
  if (!scaledQty) return raw
  return `${scaledQty} ${parsed.name}`.trim()
}

export function scaleIngredientList(list: unknown, factor: number): string[] {
  return parseIngredientList(list).map((line) => scaleIngredientLine(line, factor))
}

// ---------------------------------------------------------------------------
// Cook-friendly scaling for the recipe page (display only). The grocery list
// keeps scaleQuantityForGrocery above; nothing here changes what is stored.
//
// Only the leading amount changes. The unit word, the name, prep notes
// ("knoflook, fijngehakt") and casing stay exactly as written, so the line
// reads like the recipe, just for her number of porties:
// - grams / millilitres: ≥ 50 to the nearest 5, below that to the nearest 1
// - kilo, liter, dl, cl: to the nearest ¼
// - everything else (pieces, eggs, cloves, spoons, blikken …): to the nearest ½
// So "2 courgettes" for 2 of 3 porties becomes "1½ courgette" (anderhalve
// courgette), never "1,3 courgettes", and "1 ei" becomes "½ ei", never "⅔ ei".
// ---------------------------------------------------------------------------

const COOK_SMALL_METRIC = new Set(["g", "gr", "gram", "grammen", "ml", "milliliter"])
const COOK_LARGE_METRIC = new Set(["kg", "kilo", "kilogram", "l", "liter", "dl", "cl"])

/**
 * Singular → plural for the word right after the amount (a unit or a common
 * ingredient). Lowercase keys; a leading capital is kept.
 */
const COOK_PLURALS: Record<string, string> = {
  eetlepel: "eetlepels",
  theelepel: "theelepels",
  teentje: "teentjes",
  plakje: "plakjes",
  sneetje: "sneetjes",
  blik: "blikken",
  blikje: "blikjes",
  stuk: "stuks",
  stukje: "stukjes",
  bos: "bossen",
  bosje: "bosjes",
  pak: "pakken",
  pakje: "pakjes",
  bakje: "bakjes",
  zakje: "zakjes",
  kopje: "kopjes",
  takje: "takjes",
  ei: "eieren",
  eidooier: "eidooiers",
  ui: "uien",
  sjalot: "sjalotten",
  tomaat: "tomaten",
  courgette: "courgettes",
  aubergine: "aubergines",
  paprika: "paprika's",
  wortel: "wortels",
  komkommer: "komkommers",
  champignon: "champignons",
  aardappel: "aardappels",
  avocado: "avocado's",
  banaan: "bananen",
  appel: "appels",
  peer: "peren",
  citroen: "citroenen",
  limoen: "limoenen",
  sinaasappel: "sinaasappels",
  dadel: "dadels",
  tortilla: "tortilla's",
  wrap: "wraps",
  kipfilet: "kipfilets",
  zalmfilet: "zalmfilets",
  kipdijfilet: "kipdijfilets",
  kipdrumstick: "kipdrumsticks",
  zeebaarsfilet: "zeebaarsfilets",
  sardine: "sardines",
  stengel: "stengels",
  blaadje: "blaadjes",
  kaneelstokje: "kaneelstokjes",
  chilipeper: "chilipepers",
  perzik: "perziken",
  mango: "mango's",
  rookworst: "rookworsten",
  rijstpapiervel: "rijstpapiervellen",
}

/** Other plurals the recipes use ("aardappelen", "tortillas"): read, never written. */
const COOK_EXTRA_SINGULARS: Record<string, string> = {
  aardappelen: "aardappel",
  tortillas: "tortilla",
  avocados: "avocado",
  paprikas: "paprika",
  mangos: "mango",
}

const COOK_SINGULARS: Record<string, string> = {
  ...Object.fromEntries(Object.entries(COOK_PLURALS).map(([singular, plural]) => [plural, singular])),
  ...COOK_EXTRA_SINGULARS,
}

/** Adjectives that may sit between the amount and the noun ("2 grote uien"). */
const COOK_ADJECTIVES = new Set([
  "grote",
  "kleine",
  "middelgrote",
  "rijpe",
  "verse",
  "hele",
  "rode",
  "gele",
  "groene",
  "witte",
  "zoete",
  "bevroren",
  "volkoren",
])

const UNICODE_AMOUNTS: Record<string, number> = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3 }

type CookStep = "metric" | "quarter" | "half"

function cookStepForUnit(unit: string): CookStep {
  const key = unit.toLowerCase().replace(/[.,]/g, "")
  if (COOK_SMALL_METRIC.has(key)) return "metric"
  if (COOK_LARGE_METRIC.has(key)) return "quarter"
  return "half"
}

function roundCookAmount(amount: number, step: CookStep): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0
  if (step === "metric") {
    const rounded = amount >= 50 ? Math.round(amount / 5) * 5 : Math.round(amount)
    return Math.max(1, rounded)
  }
  const unit = step === "quarter" ? 0.25 : 0.5
  return Math.max(unit, Math.round(amount / unit) * unit)
}

function formatCookNumber(n: number): string {
  const whole = Math.floor(n + 1e-9)
  const rest = Math.round((n - whole) * 100) / 100
  const fraction = rest === 0.25 ? "¼" : rest === 0.5 ? "½" : rest === 0.75 ? "¾" : ""
  if (!fraction) return String(Math.round(n))
  return whole > 0 ? `${whole}${fraction}` : fraction
}

/**
 * An amount rounded the way you would measure it in a kitchen, as text:
 * `formatCookAmount(266.7, "g")` → "265", `formatCookAmount(0.67, "")` → "½",
 * `formatCookAmount(1.33, "el")` → "1½", `formatCookAmount(0.8, "l")` → "¾".
 */
export function formatCookAmount(amount: number, unit: string): string {
  return formatCookNumber(roundCookAmount(amount, cookStepForUnit(unit)))
}

function matchCase(original: string, replacement: string): string {
  return original[0] && original[0] !== original[0].toLowerCase()
    ? replacement[0].toUpperCase() + replacement.slice(1)
    : replacement
}

function lookup(map: Record<string, string>, key: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : undefined
}

/**
 * "eieren" ↔ "ei" to match the amount; unknown words stay as they are.
 * Dutch keeps the noun singular with a half ("anderhalve courgette",
 * "½ ei"), so only whole numbers from 2 take the plural.
 */
function inflectWord(word: string, amount: number): string {
  const key = word.toLowerCase()
  const plural = amount >= 2 && Number.isInteger(amount)
  const next = lookup(plural ? COOK_PLURALS : COOK_SINGULARS, key)
  return next ? matchCase(word, next) : word
}

const WORD_CHARS = "A-Za-zÀ-ÿ'’"

/**
 * Inflect the unit or noun right after the amount (skipping one adjective,
 * "2 grote uien"), keeping all other text and spacing as written.
 */
function inflectAfterAmount(rest: string, amount: number): string {
  const first = rest.match(new RegExp(`^(\\s*)([${WORD_CHARS}]+)([\\s\\S]*)$`))
  if (!first) return rest
  const [, space, word, tail] = first
  if (COOK_ADJECTIVES.has(word.toLowerCase())) {
    const second = tail.match(new RegExp(`^(\\s+)([${WORD_CHARS}]+)([\\s\\S]*)$`))
    if (!second) return rest
    return `${space}${word}${second[1]}${inflectWord(second[2], amount)}${second[3]}`
  }
  return `${space}${inflectWord(word, amount)}${tail}`
}

/** The unit word right after the amount ("g" in "400g …" or "400 g …"). */
function unitAfterAmount(rest: string): string {
  return rest.match(/^\s*([A-Za-zÀ-ÿ]+)/)?.[1] ?? ""
}

function parseLooseNumber(token: string): number {
  return Number.parseFloat(token.replace(",", "."))
}

/** Lines that start with these stay as written ("snufje zout", "handvol spinazie"). */
const WORD_AMOUNT = /^(een\s+|één\s+)?(handvol|handje|scheutje|scheut|snufje|beetje|paar|mespunt|klontje)(?![A-Za-zÀ-ÿ])/i

/** "1 ei per persoon" is right for any number of porties, so it stays as written. */
const PER_PERSON = /\bper\s+(persoon|portie)\b|\bp\.\s?p\./i

/**
 * Scale one free-text ingredient line for the recipe page. Returns the line
 * unchanged when the factor is 1 or there is no amount to scale.
 */
export function scaleIngredientLineForCooking(raw: string, factor: number): string {
  if (!Number.isFinite(factor) || factor <= 0 || Math.abs(factor - 1) < 0.001) return raw
  const lead = raw.match(/^\s*/)?.[0] ?? ""
  const body = raw.slice(lead.length)
  if (!body || WORD_AMOUNT.test(body) || PER_PERSON.test(body)) return raw

  // "Sap van 1 citroen": keep the words, scale the amount after them.
  const prefix = body.match(/^(?:sap|rasp|schil)\s+van\s+/i)?.[0] ?? ""
  const text = body.slice(prefix.length)

  function scaled(amount: number, after: string) {
    const value = roundCookAmount(amount * factor, cookStepForUnit(unitAfterAmount(after)))
    return { value, text: formatCookNumber(value) }
  }

  // Range: "2-3 el honing", "2 à 3 tomaten"
  const range = text.match(/^(\d+(?:[.,]\d+)?)(\s*(?:-|–|à|tot)\s*)(\d+(?:[.,]\d+)?)([\s\S]*)$/)
  if (range) {
    const [, a, joiner, b, after] = range
    const low = scaled(parseLooseNumber(a), after)
    const high = scaled(parseLooseNumber(b), after)
    const amountText = low.text === high.text ? low.text : `${low.text}${joiner}${high.text}`
    return `${lead}${prefix}${amountText}${inflectAfterAmount(after, high.value)}`
  }

  // A unit without a number ("eetlepel citroensap") means one of them.
  const bareUnit = text.match(/^([A-Za-zÀ-ÿ]+)(\s[\s\S]*)$/)
  if (bareUnit && /^(eetlepel|theelepel|teentje|blik|blikje|stuk|stukje|bosje|pakje|takje)$/i.test(bareUnit[1])) {
    const value = roundCookAmount(factor, "half")
    return `${lead}${prefix}${formatCookNumber(value)} ${inflectWord(bareUnit[1], value)}${bareUnit[2]}`
  }

  let amount: number | null = null
  let after = ""
  let m: RegExpMatchArray | null
  if ((m = text.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)(?!\d)([\s\S]*)$/)) && Number(m[3]) > 0) {
    // "1 1/2 el"
    amount = Number(m[1]) + Number(m[2]) / Number(m[3])
    after = m[4]
  } else if ((m = text.match(/^(\d+)\s*([½¼¾⅓⅔])([\s\S]*)$/))) {
    // "1½ el"
    amount = Number(m[1]) + UNICODE_AMOUNTS[m[2]]
    after = m[3]
  } else if ((m = text.match(/^([½¼¾⅓⅔])([\s\S]*)$/))) {
    amount = UNICODE_AMOUNTS[m[1]]
    after = m[2]
  } else if ((m = text.match(/^(\d+)\s*\/\s*(\d+)(?!\d)([\s\S]*)$/)) && Number(m[2]) > 0) {
    // "1/2 limoen"
    amount = Number(m[1]) / Number(m[2])
    after = m[3]
  } else if ((m = text.match(/^(\d+(?:[.,]\d+)?)([\s\S]*)$/))) {
    amount = parseLooseNumber(m[1])
    after = m[2]
  } else if ((m = text.match(/^(?:halve|half)(\s[\s\S]*)$/i))) {
    // "halve avocado" → "1 avocado" for twice the porties
    amount = 0.5
    after = m[1]
  } else if ((m = text.match(/^(?:een|één)(\s+([A-Za-zÀ-ÿ]+)[\s\S]*)$/i)) && lookup(COOK_PLURALS, m[2].toLowerCase())) {
    // "een blik tomaten", "een ui": only for a known unit or ingredient.
    amount = 1
    after = m[1]
  }

  if (amount === null || !(amount > 0)) return raw
  const result = scaled(amount, after)
  return `${lead}${prefix}${result.text}${inflectAfterAmount(after, result.value)}`
}

export function scaleIngredientListForCooking(list: unknown, factor: number): string[] {
  return parseIngredientList(list).map((line) => scaleIngredientLineForCooking(line, factor))
}
