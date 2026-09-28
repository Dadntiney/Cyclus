import { estimateCycle, type CyclePhase } from "@/lib/cycle/estimate"
import { computeSymptomFrequency } from "@/lib/cycle/history"
import { computePersonalInsights, type InsightCheckin } from "@/lib/cycle/insights"
import { periScoreBand } from "@/lib/cycle/peri-score"
import { symptomLabel } from "@/lib/constants"

export type DoctorSummaryWeeks = 4 | 8 | 12 | 24

export interface DoctorSummaryInput {
  weeks: DoctorSummaryWeeks
  checkins: Array<{
    date: string
    energy: number | null
    mood: number | null
    sleep: number | null
    stress: number | null
    symptoms: string[]
    notes: string | null
  }>
  cycleProfile: {
    has_cycle: boolean
    last_period_start: string | null
    average_cycle_length: number | null
    regularity: string | null
    life_stage?: string | null
  } | null
  menstruationDates: string[]
  periScores?: { assessed_on: string; score: number }[]
}

export interface DoctorSummary {
  weeks: number
  periodLabel: string
  checkinCount: number
  averages: {
    energy: number | null
    mood: number | null
    sleep: number | null
    stress: number | null
  }
  topSymptoms: { symptom: string; count: number }[]
  insights: { text: string }[]
  cycleNote: string
  noteHighlights: string[]
  talkingPoints: string[]
  periScoreNote: string | null
  generatedAt: string
}

function avg(values: number[]): number | null {
  if (!values.length) return null
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
}

export function buildDoctorSummary(input: DoctorSummaryInput): DoctorSummary {
  const { weeks, checkins, cycleProfile, menstruationDates, periScores = [] } = input
  const energies = checkins.map((c) => c.energy).filter((v): v is number => v != null)
  const moods = checkins.map((c) => c.mood).filter((v): v is number => v != null)
  const sleeps = checkins.map((c) => c.sleep).filter((v): v is number => v != null)
  const stresses = checkins.map((c) => c.stress).filter((v): v is number => v != null)

  const insightRows: InsightCheckin[] = checkins.map((c) => ({
    date: c.date,
    energy: c.energy,
    mood: c.mood,
    sleep: c.sleep,
    stress: c.stress,
    symptoms: c.symptoms,
  }))

  const insights = computePersonalInsights(
    insightRows,
    cycleProfile
      ? {
          has_cycle: cycleProfile.has_cycle,
          last_period_start: cycleProfile.last_period_start,
          average_cycle_length: cycleProfile.average_cycle_length,
        }
      : null,
  )

  let cycleNote = "Geen cyclusgegevens beschikbaar in deze periode."
  if (cycleProfile && !cycleProfile.has_cycle) {
    cycleNote = "Gebruiker gaf aan momenteel geen menstruatiecyclus te hebben."
  } else if (cycleProfile?.has_cycle) {
    const parts = [
      cycleProfile.average_cycle_length
        ? `Gemiddelde cycluslengte (opgegeven): ${cycleProfile.average_cycle_length} dagen`
        : null,
      cycleProfile.regularity ? `Regelmaat: ${cycleProfile.regularity}` : null,
      cycleProfile.life_stage ? `Zelfgekozen levensfase: ${cycleProfile.life_stage}` : null,
      menstruationDates.length
        ? `Gemarkeerde menstruatiedagen in deze periode: ${menstruationDates.length}`
        : "Geen menstruatiedagen gemarkeerd in deze periode",
    ].filter(Boolean)
    const todayEstimate = estimateCycle(
      cycleProfile.last_period_start,
      cycleProfile.average_cycle_length,
      cycleProfile.has_cycle,
    )
    if (todayEstimate) {
      parts.push(
        `Huidige schatting: cyclusdag ${todayEstimate.cycleDay} (${todayEstimate.phaseLabel})`,
      )
    }
    cycleNote = parts.join(". ") + "."
  }

  const topSymptoms = computeSymptomFrequency(checkins).slice(0, 8)
  const noteHighlights = checkins
    .filter((c) => c.notes && c.notes.trim().length > 0)
    .slice(0, 5)
    .map((c) => `${c.date}: ${c.notes!.trim()}`)

  const talkingPoints: string[] = []
  if (topSymptoms[0]) {
    talkingPoints.push(
      `Meest genoteerde klacht: ${symptomLabel(topSymptoms[0].symptom)} (${topSymptoms[0].count}×).`,
    )
  }
  if (avg(stresses) !== null && (avg(stresses) as number) >= 3.5) {
    talkingPoints.push("Gemiddelde stressscore ligt relatief hoog in deze periode.")
  }
  if (avg(sleeps) !== null && (avg(sleeps) as number) <= 2.5) {
    talkingPoints.push("Gemiddelde slaapscore ligt relatief laag in deze periode.")
  }
  if (cycleProfile?.life_stage === "perimenopauze" || cycleProfile?.life_stage === "veranderend") {
    talkingPoints.push("Gebruiker markeerde een veranderende levensfase / perimenopauze in de app.")
  }
  talkingPoints.push("Vraag: wat kan helpen op korte termijn en wanneer is vervolgonderzoek zinvol?")

  let periScoreNote: string | null = null
  if (periScores.length) {
    const latest = periScores[0]
    const band = periScoreBand(latest.score)
    periScoreNote = `Laatste klachtenlast-score: ${latest.score}/100 (${band.label}) op ${latest.assessed_on}. ${
      periScores.length > 1 ? `Eerdere scores: ${periScores.slice(1, 4).map((p) => `${p.score}`).join(", ")}.` : ""
    }`
  }

  return {
    weeks,
    periodLabel: weeks >= 24 ? "Laatste 6 maanden" : `Laatste ${weeks} weken`,
    checkinCount: checkins.length,
    averages: {
      energy: avg(energies),
      mood: avg(moods),
      sleep: avg(sleeps),
      stress: avg(stresses),
    },
    topSymptoms,
    insights: insights.map((i) => ({ text: i.text })),
    cycleNote,
    noteHighlights,
    talkingPoints,
    periScoreNote,
    generatedAt: new Date().toISOString(),
  }
}

export function doctorSummaryToText(summary: DoctorSummary): string {
  const lines = [
    "Cyclus — samenvatting voor zorgverlener",
    summary.periodLabel,
    `Check-ins: ${summary.checkinCount}`,
    `Gegenereerd: ${summary.generatedAt}`,
    "",
    "Gemiddelden (1–5)",
    `- Energie: ${summary.averages.energy ?? "—"}`,
    `- Stemming: ${summary.averages.mood ?? "—"}`,
    `- Slaap: ${summary.averages.sleep ?? "—"}`,
    `- Stress: ${summary.averages.stress ?? "—"}`,
    "",
    "Cyclus",
    summary.cycleNote,
    "",
    "Meest genoteerde klachten",
    ...(summary.topSymptoms.length
      ? summary.topSymptoms.map((s) => `- ${symptomLabel(s.symptom)} (${s.count}×)`)
      : ["- Geen"]),
    "",
    "Gesprekspunten",
    ...summary.talkingPoints.map((t) => `- ${t}`),
  ]

  if (summary.periScoreNote) {
    lines.push("", "Klachtenlast", summary.periScoreNote)
  }
  if (summary.insights.length) {
    lines.push("", "Mogelijke verbanden", ...summary.insights.map((i) => `- ${i.text}`))
  }
  if (summary.noteHighlights.length) {
    lines.push("", "Notities", ...summary.noteHighlights.map((n) => `- ${n}`))
  }

  lines.push(
    "",
    "Dit is geen medisch advies of diagnose. Bespreek klachten altijd met een zorgverlener.",
  )
  return lines.join("\n")
}

export type { CyclePhase }
