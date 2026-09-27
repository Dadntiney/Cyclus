import { estimateCycle, type CyclePhase } from "@/lib/cycle/estimate"
import { computeSymptomFrequency } from "@/lib/cycle/history"
import { computePersonalInsights, type InsightCheckin } from "@/lib/cycle/insights"

export interface DoctorSummaryInput {
  weeks: 4 | 8 | 12
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
  } | null
  menstruationDates: string[]
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
  generatedAt: string
}

function avg(values: number[]): number | null {
  if (!values.length) return null
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
}

export function buildDoctorSummary(input: DoctorSummaryInput): DoctorSummary {
  const { weeks, checkins, cycleProfile, menstruationDates } = input
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

  const noteHighlights = checkins
    .filter((c) => c.notes && c.notes.trim().length > 0)
    .slice(0, 5)
    .map((c) => `${c.date}: ${c.notes!.trim()}`)

  return {
    weeks,
    periodLabel: `Laatste ${weeks} weken`,
    checkinCount: checkins.length,
    averages: {
      energy: avg(energies),
      mood: avg(moods),
      sleep: avg(sleeps),
      stress: avg(stresses),
    },
    topSymptoms: computeSymptomFrequency(checkins).slice(0, 8),
    insights: insights.map((i) => ({ text: i.text })),
    cycleNote,
    noteHighlights,
    generatedAt: new Date().toISOString(),
  }
}

export type { CyclePhase }
