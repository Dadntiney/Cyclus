"use client"

import { useId, useMemo, useState, type ReactNode } from "react"
import {
  buildDoctorSummary,
  doctorSummaryToText,
  type DoctorSummaryInput,
  type DoctorSummaryPeriAssessment,
  type DoctorSummaryWeeks,
} from "@/lib/cycle/doctor-summary"
import { DoctorSummaryView } from "@/components/cycle/doctor-summary-view"
import { PageSections } from "@/components/layout/page"
import { Button, textActionClass } from "@/components/ui/button"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { StickyActionBar } from "@/components/ui/sticky-action-bar"
import type { CycleHistoryEntry } from "@/lib/cycle/history"
import type { CheckinLike } from "@/lib/cycle/patterns"

type WeeksOption = "4" | "8" | "12" | "24"

const PERIOD_OPTIONS: readonly { value: WeeksOption; label: string }[] = [
  { value: "4", label: "4 wk" },
  { value: "8", label: "8 wk" },
  { value: "12", label: "12 wk" },
  { value: "24", label: "6 mnd" },
]

/**
 * Voor je arts, in order (ontwerpvisie §7.8): period → summary → whatever
 * the page passes as `children` (Afspraken & notities) → one primary
 * action in the thumb zone. Renders as siblings, so the StickyActionBar is
 * a direct child of the <Page> and stays in reach over the whole page.
 */
export function DoctorSummaryClient({
  checkins,
  cycleProfile,
  menstruationDates,
  periScores = [],
  appointmentNotes = [],
  cycleHistory = [],
  patternCheckins = [],
  children,
}: {
  checkins: DoctorSummaryInput["checkins"]
  cycleProfile: DoctorSummaryInput["cycleProfile"]
  menstruationDates: string[]
  periScores?: DoctorSummaryPeriAssessment[]
  appointmentNotes?: { date: string | null; notes: string }[]
  cycleHistory?: CycleHistoryEntry[]
  patternCheckins?: CheckinLike[]
  /** Rendered after the summary, before the action bar. */
  children?: ReactNode
}) {
  const [weeks, setWeeks] = useState<DoctorSummaryWeeks>(8)
  const periodLabelId = useId()

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
    cycleHistory,
    patternCheckins: patternCheckins.length ? patternCheckins : filtered.checkins,
  })

  function downloadText() {
    const text = doctorSummaryToText(summary)
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cyclus-arts-samenvatting-${summary.weeks}w.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <PageSections>
        <section aria-labelledby={periodLabelId} className="print:hidden">
          <h2 id={periodLabelId} className="type-group-label text-ink-soft px-1 mb-2">
            Periode
          </h2>
          <SegmentedControl
            aria-labelledby={periodLabelId}
            fullWidth
            options={PERIOD_OPTIONS}
            value={String(weeks) as WeeksOption}
            onChange={(value) => setWeeks(Number(value) as DoctorSummaryWeeks)}
          />
        </section>

        <DoctorSummaryView summary={summary} />

        {children}
      </PageSections>

      <StickyActionBar className="mt-8 print:hidden">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Button className="min-w-40 flex-1" onClick={() => window.print()}>
            Printen of pdf
          </Button>
          <button type="button" onClick={downloadText} className={textActionClass("px-1")}>
            Download tekst
          </button>
        </div>
      </StickyActionBar>
    </>
  )
}
