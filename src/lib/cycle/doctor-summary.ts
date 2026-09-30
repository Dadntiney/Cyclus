import { estimateCycle, phaseLabel, type CyclePhase } from "@/lib/cycle/estimate"
import { computeSymptomFrequency } from "@/lib/cycle/history"
import { computePersonalInsights, type InsightCheckin } from "@/lib/cycle/insights"
import {
  periComplaintHighlights,
  periScoreBand,
  type PeriAnswers,
  type PeriComplaintHighlight,
} from "@/lib/cycle/peri-score"
import {
  computePhaseSymptomInsights,
  formatPhaseSymptomInsightForDoctor,
  type CheckinLike,
} from "@/lib/cycle/patterns"
import type { CycleHistoryEntry } from "@/lib/cycle/history"
import { symptomLabel } from "@/lib/constants"

export type DoctorSummaryWeeks = 4 | 8 | 12 | 24

export interface DoctorSummaryPeriAssessment {
  assessed_on: string
  score: number
  answers?: PeriAnswers | null
  notes?: string | null
}

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
    average_period_length?: number | null
    regularity: string | null
    life_stage?: string | null
  } | null
  menstruationDates: string[]
  periScores?: DoctorSummaryPeriAssessment[]
  /** Optional visit notes from the appointments log (e.g. HT changes). */
  appointmentNotes?: { date: string | null; notes: string }[]
  /**
   * Completed-cycle history (oldest first) for phase×symptom patterns.
   * Same source as Cyclus hub / Vandaag — not limited to the monthly
   * klachtenlast questionnaire.
   */
  cycleHistory?: CycleHistoryEntry[]
  /** Longer check-in window used only for phase patterns (may exceed `weeks`). */
  patternCheckins?: CheckinLike[]
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
  periComplaints: PeriComplaintHighlight[]
  periNotes: string | null
  phasePatterns: string[]
  appointmentNotes: { date: string | null; notes: string }[]
  generatedAt: string
}

function avg(values: number[]): number | null {
  if (!values.length) return null
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
}

export function buildDoctorSummary(input: DoctorSummaryInput): DoctorSummary {
  const {
    weeks,
    checkins,
    cycleProfile,
    menstruationDates,
    periScores = [],
    appointmentNotes = [],
    cycleHistory = [],
    patternCheckins,
  } = input
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
      cycleProfile.average_period_length
        ? `Gemiddelde menstruatieduur (opgegeven): ${cycleProfile.average_period_length} dagen`
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
      undefined,
      cycleProfile.average_period_length,
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
  let periComplaints: PeriComplaintHighlight[] = []
  let periNotes: string | null = null
  if (periScores.length) {
    const latest = periScores[0]
    const band = periScoreBand(latest.score)
    periComplaints = periComplaintHighlights(latest.answers ?? null)
    periNotes = latest.notes?.trim() || null
    periScoreNote = `Laatste score: ${latest.score}/100 (${band.label}) op ${latest.assessed_on}. De score vat samen hoe zwaar je de onderstaande klachten de afgelopen 30 dagen aangaf (0 = niet · 100 = alles hevig).${
      periScores.length > 1
        ? ` Eerdere scores: ${periScores
            .slice(1, 4)
            .map((p) => `${p.score}`)
            .join(", ")}.`
        : ""
    }`
  }

  // Phase×symptom patterns from completed cycles + daily check-ins —
  // same engine as Cyclus hub; intentionally not tied to the monthly
  // klachtenlast questionnaire (that one has no phase context).
  const phaseSourceCheckins = patternCheckins ?? checkins
  const phaseInsights = computePhaseSymptomInsights(cycleHistory, phaseSourceCheckins)
  const shownPhaseKeys = new Set(phaseInsights.map((i) => `${i.phase}:${i.symptom}`))
  const phasePatterns = [
    ...phaseInsights
      .slice(0, 6)
      .map((i) => formatPhaseSymptomInsightForDoctor(i, phaseLabel(i.phase))),
    // Personal insights that also name a phase+symptom, if not already covered.
    ...insights
      .filter(
        (i) =>
          i.phase &&
          i.symptom &&
          !shownPhaseKeys.has(`${i.phase}:${i.symptom}`),
      )
      .slice(0, 2)
      .map((i) => i.text),
  ]

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
    insights: insights
      .filter((i) => !(i.phase && i.symptom && shownPhaseKeys.has(`${i.phase}:${i.symptom}`)))
      .map((i) => ({ text: i.text })),
    cycleNote,
    noteHighlights,
    talkingPoints,
    periScoreNote,
    periComplaints,
    periNotes,
    phasePatterns,
    appointmentNotes: appointmentNotes.slice(0, 8),
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
    "Meest genoteerde klachten (check-ins)",
    ...(summary.topSymptoms.length
      ? summary.topSymptoms.map((s) => `- ${symptomLabel(s.symptom)} (${s.count}×)`)
      : ["- Geen"]),
  ]

  if (summary.phasePatterns.length) {
    lines.push(
      "",
      "Patronen per cyclusfase",
      ...summary.phasePatterns.map((p) => `- ${p}`),
    )
  }

  lines.push("", "Gesprekspunten", ...summary.talkingPoints.map((t) => `- ${t}`))

  if (summary.periScoreNote) {
    lines.push("", "Klachtenlast (maandelijkse check)", summary.periScoreNote)
    if (summary.periComplaints.length) {
      lines.push("Klachten in deze meting:")
      lines.push(
        ...summary.periComplaints.map((c) => `- ${c.label}: ${c.levelLabel.toLowerCase()}`),
      )
    } else {
      lines.push("- Geen individuele klachten boven ‘niet’ in deze meting.")
    }
    if (summary.periNotes) {
      lines.push(`Notitie bij meting: ${summary.periNotes}`)
    }
  }
  if (summary.insights.length) {
    lines.push("", "Mogelijke verbanden", ...summary.insights.map((i) => `- ${i.text}`))
  }
  if (summary.noteHighlights.length) {
    lines.push("", "Notities", ...summary.noteHighlights.map((n) => `- ${n}`))
  }
  if (summary.appointmentNotes.length) {
    lines.push(
      "",
      "Afspraken / afspraken met zorgverlener",
      ...summary.appointmentNotes.map((n) =>
        n.date ? `- ${n.date}: ${n.notes}` : `- ${n.notes}`,
      ),
    )
  }

  lines.push(
    "",
    "Dit is geen medisch advies of diagnose. Bespreek klachten altijd met een zorgverlener.",
  )
  return lines.join("\n")
}

export type { CyclePhase }
