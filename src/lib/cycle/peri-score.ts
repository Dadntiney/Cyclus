/**
 * Lightweight monthly symptom-burden questionnaire inspired by Flo's
 * Perimenopause Score framing — but NOT a validated clinical instrument.
 * Copy must always say educational / for conversation, never diagnosis.
 */

export interface PeriScoreItem {
  id: string
  label: string
  help: string
}

/** 0 = niet · 1 = mild · 2 = matig · 3 = hevig (afgelopen 30 dagen). */
export const PERI_SCORE_ITEMS: PeriScoreItem[] = [
  { id: "opvliegers", label: "Opvliegers", help: "Plotselinge warmte, blozen of zweten overdag" },
  { id: "nachtzweten", label: "Nachtelijk zweten", help: "Zweten waardoor je slaap verstoord raakt" },
  { id: "slaap", label: "Slaapproblemen", help: "Moeilijk inslapen, doorslapen of te vroeg wakker" },
  { id: "vermoeidheid", label: "Vermoeidheid / lage energie", help: "Aanhoudende moeheid ondanks rust" },
  { id: "stemming", label: "Stemmingswisselingen", help: "Sneller geïrriteerd, somber of emotioneel" },
  { id: "angst", label: "Spanning of angst", help: "Onrust, piekeren of gespannen gevoel" },
  { id: "brain_fog", label: "Concentratieproblemen", help: "Moeite met focussen of ‘mist’ in je hoofd" },
  { id: "hoofdpijn", label: "Hoofdpijn", help: "Vaker of heviger dan je gewend bent" },
  { id: "gewrichten", label: "Gewrichts- of spierpijn", help: "Stijfheid of pijn zonder duidelijke blessure" },
  { id: "libido", label: "Veranderd libido", help: "Merkbaar minder of anders verlangen" },
  { id: "vaginaal", label: "Vaginale klachten", help: "Droogte, irritatie of ongemak" },
  { id: "bloeding", label: "Veranderde menstruatie", help: "Onregelmatig, heviger, lichter of overgeslagen" },
  { id: "hartkloppingen", label: "Hartkloppingen", help: "Voelbare of snelle hartslag in rust" },
  { id: "gewicht", label: "Gewicht of middel", help: "Merkbare verandering zonder duidelijke reden" },
  { id: "huid_haar", label: "Huid of haar", help: "Droge huid, haaruitval of andere veranderingen" },
  { id: "urine", label: "Urinewegklachten", help: "Vaker plassen, aandrang of lichte incontinentie" },
]

export const PERI_SCORE_MAX = PERI_SCORE_ITEMS.length * 3

export type PeriAnswers = Record<string, 0 | 1 | 2 | 3>

export function computePeriScore(answers: PeriAnswers): number {
  let sum = 0
  for (const item of PERI_SCORE_ITEMS) {
    const value = answers[item.id]
    if (typeof value === "number" && value >= 0 && value <= 3) {
      sum += value
    }
  }
  return Math.round((sum / PERI_SCORE_MAX) * 100)
}

export function periScoreBand(score: number): {
  label: string
  description: string
} {
  if (score <= 20) {
    return {
      label: "Beperkte last",
      description: "Je klachtenlijst lijkt op dit moment relatief licht. Blijf bijhouden wat voor jou telt.",
    }
  }
  if (score <= 45) {
    return {
      label: "Matige last",
      description: "Er speelt duidelijk iets. Patronen en een artsgesprek kunnen helpen om richting te vinden.",
    }
  }
  if (score <= 70) {
    return {
      label: "Duidelijke last",
      description: "Je klachten wegen behoorlijk. Een overzicht voor je huisarts of gynaecoloog kan waardevol zijn.",
    }
  }
  return {
    label: "Zware last",
    description: "Je geeft een hoge klachtenlast aan. Bespreek dit met een zorgverlener — dit cijfer is geen diagnose.",
  }
}

export function formatPeriScoreTrend(previous: number | null, current: number): string | null {
  if (previous === null) return null
  const delta = current - previous
  if (Math.abs(delta) < 5) return "Ongeveer gelijk aan je vorige meting."
  if (delta > 0) return `Ongeveer ${delta} punten hoger dan je vorige meting.`
  return `Ongeveer ${Math.abs(delta)} punten lager dan je vorige meting.`
}

const LEVEL_LABELS: Record<1 | 2 | 3, string> = {
  1: "Mild",
  2: "Matig",
  3: "Hevig",
}

export interface PeriComplaintHighlight {
  id: string
  label: string
  level: 1 | 2 | 3
  levelLabel: string
}

/** Complaints scored mild/matig/hevig — what the 0–100 score is made of. */
export function periComplaintHighlights(answers: PeriAnswers | null | undefined): PeriComplaintHighlight[] {
  if (!answers) return []
  const rows: PeriComplaintHighlight[] = []
  for (const item of PERI_SCORE_ITEMS) {
    const value = answers[item.id]
    if (value === 1 || value === 2 || value === 3) {
      rows.push({
        id: item.id,
        label: item.label,
        level: value,
        levelLabel: LEVEL_LABELS[value],
      })
    }
  }
  return rows.sort((a, b) => b.level - a.level || a.label.localeCompare(b.label, "nl"))
}

export function parsePeriAnswers(raw: unknown): PeriAnswers | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null
  const out: PeriAnswers = {}
  for (const item of PERI_SCORE_ITEMS) {
    const value = (raw as Record<string, unknown>)[item.id]
    if (value === 0 || value === 1 || value === 2 || value === 3) {
      out[item.id] = value
    }
  }
  return Object.keys(out).length ? out : null
}
