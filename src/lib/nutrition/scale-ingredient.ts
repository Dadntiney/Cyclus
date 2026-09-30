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
    [0.25, "1/4"],
    [0.33, "1/3"],
    [0.5, "1/2"],
    [0.67, "2/3"],
    [0.75, "3/4"],
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
  let displayUnit = unit
  if (Math.abs(amount - 1) > 0.05 && plural[unit]) displayUnit = plural[unit]
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
 * Grocery-facing scale: countable units round up so "0,5 ei" / "1/2 komkommer"
 * at half portions still means "koop er één". Recipe pages keep exact scale.
 */
export function scaleQuantityForGrocery(quantity: string | null, factor: number): string | null {
  const scaled = scaleQuantityString(quantity, factor)
  if (!scaled) return scaled
  const parts = parseQuantityParts(scaled)
  if (!parts) return scaled
  const unitKey = parts.unit.toLowerCase()
  if (!PIECE_UNITS.has(unitKey)) return scaled
  let amount = parts.amount
  if (amount > 0 && amount < 1) amount = 1
  else if (amount > 1 && Math.abs(amount - Math.round(amount)) > 0.05) {
    amount = Math.ceil(amount - 1e-9)
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
