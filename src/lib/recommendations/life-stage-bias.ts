import type { LifeStageValue } from "@/lib/constants"

/** Life stages where default coaching should tilt softer (sleep, recovery, gentler move). */
const SOFTER_LIFE_STAGES = new Set<string>([
  "veranderend",
  "perimenopauze",
  "menopauze",
])

export function lifeStagePrefersGentler(
  lifeStage: string | null | undefined,
): boolean {
  return Boolean(lifeStage && SOFTER_LIFE_STAGES.has(lifeStage))
}

/** Post-cycle coaching mode — no period calendar assumptions. */
export function lifeStageIsPostCycle(
  lifeStage: string | null | undefined,
  hasCycle?: boolean | null,
): boolean {
  return lifeStage === "menopauze" || hasCycle === false
}

export function lifeStageLabelForBuddy(
  lifeStage: string | null | undefined,
): string | null {
  if (!lifeStage) return null
  const labels: Record<string, string> = {
    regelmatig: "regelmatige cyclus",
    veranderend: "veranderende cyclus",
    perimenopauze: "perimenopauze / overgang",
    menopauze: "na de menopauze",
    onbekend: "levensfase nog open",
  }
  return labels[lifeStage] ?? lifeStage
}

export function isLifeStageValue(value: string | null | undefined): value is LifeStageValue {
  return (
    value === "regelmatig" ||
    value === "veranderend" ||
    value === "perimenopauze" ||
    value === "menopauze" ||
    value === "onbekend"
  )
}
