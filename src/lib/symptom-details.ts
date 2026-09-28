import type { Json } from "@/types/database"
import type { SymptomDetail } from "@/lib/validations/checkin"

export function parseSymptomDetails(value: Json | null | undefined): Record<string, SymptomDetail> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  const result: Record<string, SymptomDetail> = {}
  for (const [key, raw] of Object.entries(value)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue
    const entry = raw as { severity?: unknown; count?: unknown }
    const detail: SymptomDetail = {}
    if (typeof entry.severity === "number" && entry.severity >= 1 && entry.severity <= 3) {
      detail.severity = entry.severity
    }
    if (typeof entry.count === "number" && entry.count >= 1 && entry.count <= 30) {
      detail.count = entry.count
    }
    if (detail.severity || detail.count) result[key] = detail
  }
  return result
}
