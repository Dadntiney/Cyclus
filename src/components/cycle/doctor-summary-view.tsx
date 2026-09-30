"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  doctorSummaryToText,
  type DoctorSummary,
  type DoctorSummaryWeeks,
} from "@/lib/cycle/doctor-summary"
import { symptomLabel } from "@/lib/constants"

function fmt(value: number | null) {
  return value === null ? "—" : `${value}/5`
}

export function DoctorSummaryView({
  summary,
  weeks,
  onWeeksChange,
}: {
  summary: DoctorSummary
  weeks: DoctorSummaryWeeks
  onWeeksChange: (weeks: DoctorSummaryWeeks) => void
}) {
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
    <div className="flex flex-col gap-4 print:gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap gap-2">
          {([4, 8, 12, 24] as const).map((w) => (
            <Button
              key={w}
              type="button"
              size="sm"
              variant={weeks === w ? "secondary" : "ghost"}
              onClick={() => onWeeksChange(w)}
              aria-pressed={weeks === w}
              className={weeks === w ? "border-sage/50 bg-sage-soft text-sage-dark" : undefined}
            >
              {w === 24 ? "6 mnd" : `${w} weken`}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={downloadText}>
            Download tekst
          </Button>
          <Button type="button" variant="secondary" onClick={() => window.print()}>
            Print / PDF
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none print:border print:border-black/10">
        <h2 className="font-display text-xl text-ink mb-1">Samenvatting voor je arts</h2>
        <p className="text-sm text-ink-soft mb-4">
          {summary.periodLabel} · {summary.checkinCount} check-ins · geen diagnose, wel overzicht
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {(
            [
              ["Energie", summary.averages.energy],
              ["Stemming", summary.averages.mood],
              ["Slaap", summary.averages.sleep],
              ["Stress", summary.averages.stress],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-cream-soft px-3 py-2.5">
              <p className="text-xs text-ink-soft">{label}</p>
              <p className="font-display text-lg text-ink">{fmt(value)}</p>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-semibold text-ink mb-1">Cyclus</h3>
        <p className="text-sm text-ink-soft mb-4">{summary.cycleNote}</p>

        <h3 className="text-sm font-semibold text-ink mb-1">Meest genoteerde klachten</h3>
        {summary.topSymptoms.length ? (
          <ul className="text-sm text-ink mb-4 list-disc pl-5">
            {summary.topSymptoms.map((s) => (
              <li key={s.symptom}>
                {symptomLabel(s.symptom)} ({s.count}×)
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-soft mb-4">Nog geen klachten genoteerd in deze periode.</p>
        )}

        <h3 className="text-sm font-semibold text-ink mb-1">Gesprekspunten (3 minuten)</h3>
        <ul className="text-sm text-ink mb-4 list-disc pl-5">
          {summary.talkingPoints.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        {summary.periScoreNote && (
          <>
            <h3 className="text-sm font-semibold text-ink mb-1">Klachtenlast</h3>
            <p className="text-sm text-ink-soft mb-4">{summary.periScoreNote}</p>
          </>
        )}

        {summary.insights.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-ink mb-1">Mogelijke verbanden</h3>
            <ul className="text-sm text-ink mb-4 list-disc pl-5">
              {summary.insights.map((i) => (
                <li key={i.text}>{i.text}</li>
              ))}
            </ul>
          </>
        )}

        {summary.noteHighlights.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-ink mb-1">Notities</h3>
            <ul className="text-sm text-ink-soft mb-2 list-disc pl-5">
              {summary.noteHighlights.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </>
        )}

        {summary.appointmentNotes.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-ink mb-1">Afspraken met zorgverlener</h3>
            <ul className="text-sm text-ink mb-2 list-disc pl-5">
              {summary.appointmentNotes.map((n) => (
                <li key={`${n.date ?? "x"}-${n.notes}`}>
                  {n.date ? `${n.date}: ` : null}
                  {n.notes}
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="text-xs text-ink-soft mt-4 border-t border-line pt-3">
          Gegenereerd met Cyclus. Dit is geen medisch advies. Bespreek klachten altijd met een
          zorgverlener. Tip: gebruik Print → “Opslaan als PDF” voor een deelbaar PDF-bestand.
        </p>
      </Card>
    </div>
  )
}
