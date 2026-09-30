import { parseIngredientLine, parseIngredientList } from "@/lib/nutrition/ingredient-parse"

/**
 * Scales free-text ingredient quantities by a servings factor
 * (chosen porties / recipe baseline). Non-numeric lines stay as-is.
 */

function formatAmount(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0"
  const rounded = Math.round(n * 10) / 10
  if (Number.isInteger(rounded) || Math.abs(rounded - Math.round(rounded)) < 0.05) {
    return String(Math.round(rounded))
  }
  return String(rounded).replace(".", ",")
}

/** Parse "200g", "2 teentjes", "1,5" into amount + unit suffix. */
export function parseQuantityParts(
  quantity: string,
): { amount: number; unit: string } | null {
  const trimmed = quantity.trim()
  const match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/i)
  if (!match) return null
  const amount = Number.parseFloat(match[1].replace(",", "."))
  if (!Number.isFinite(amount)) return null
  return { amount, unit: (match[2] ?? "").trim() }
}

/** Prefer compact "200g" over "200 g" for short mass/volume units. */
function formatQuantity(amount: number, unit: string): string {
  const n = formatAmount(amount)
  if (!unit) return n
  const compact = unit.length <= 2 && /^[a-z]+$/i.test(unit)
  return compact ? `${n}${unit}` : `${n} ${unit}`
}

export function scaleQuantityString(quantity: string | null, factor: number): string | null {
  if (!quantity) return null
  if (Math.abs(factor - 1) < 0.001) return quantity
  const parts = parseQuantityParts(quantity)
  if (!parts) return quantity
  return formatQuantity(parts.amount * factor, parts.unit)
}

/** Sum two quantity strings when units match; otherwise null. */
export function tryAddQuantities(a: string, b: string): string | null {
  const pa = parseQuantityParts(a)
  const pb = parseQuantityParts(b)
  if (!pa || !pb) return null
  if (pa.unit.toLowerCase() !== pb.unit.toLowerCase()) return null
  return formatQuantity(pa.amount + pb.amount, pa.unit)
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
