"use client"

import { useMemo, useState } from "react"
import {
  buildDoctorSummary,
  type DoctorSummaryInput,
  type DoctorSummaryWeeks,
} from "@/lib/cycle/doctor-summary"
import { DoctorSummaryView } from "@/components/cycle/doctor-summary-view"

export function DoctorSummaryClient({
  checkins,
  cycleProfile,
  menstruationDates,
  periScores = [],
  appointmentNotes = [],
}: {
  checkins: DoctorSummaryInput["checkins"]
  cycleProfile: DoctorSummaryInput["cycleProfile"]
  menstruationDates: string[]
  periScores?: { assessed_on: string; score: number }[]
  appointmentNotes?: { date: string | null; notes: string }[]
}) {
  const [weeks, setWeeks] = useState<DoctorSummaryWeeks>(8)

  const filtered = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - weeks * 7)
    const cutoffISO = cutoff.toISOString().slice(0, 10)
    return {
      checkins: checkins.filter((c) => c.date >= cutoffISO),
      menstruationDates: menstruationDates.filter((d) => d >= cutoffISO),
      periScores: periScores.filter((p) => p.assessed_on >= cutoffISO),
    }
  }, [checkins, menstruationDates, periScores, weeks])

  const summary = buildDoctorSummary({
    weeks,
    checkins: filtered.checkins,
    cycleProfile,
    menstruationDates: filtered.menstruationDates,
    periScores: filtered.periScores,
    appointmentNotes,
  })

  return <DoctorSummaryView summary={summary} weeks={weeks} onWeeksChange={setWeeks} />
}
