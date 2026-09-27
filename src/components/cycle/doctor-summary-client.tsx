"use client"

import { useMemo, useState } from "react"
import { buildDoctorSummary, type DoctorSummaryInput } from "@/lib/cycle/doctor-summary"
import { DoctorSummaryView } from "@/components/cycle/doctor-summary-view"

export function DoctorSummaryClient({
  checkins,
  cycleProfile,
  menstruationDates,
}: {
  checkins: DoctorSummaryInput["checkins"]
  cycleProfile: DoctorSummaryInput["cycleProfile"]
  menstruationDates: string[]
}) {
  const [weeks, setWeeks] = useState<4 | 8 | 12>(8)

  const filtered = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - weeks * 7)
    const cutoffISO = cutoff.toISOString().slice(0, 10)
    return {
      checkins: checkins.filter((c) => c.date >= cutoffISO),
      menstruationDates: menstruationDates.filter((d) => d >= cutoffISO),
    }
  }, [checkins, menstruationDates, weeks])

  const summary = buildDoctorSummary({
    weeks,
    checkins: filtered.checkins,
    cycleProfile,
    menstruationDates: filtered.menstruationDates,
  })

  return <DoctorSummaryView summary={summary} weeks={weeks} onWeeksChange={setWeeks} />
}
