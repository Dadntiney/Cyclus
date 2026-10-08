import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import type { DoctorSummary } from "@/lib/cycle/doctor-summary"
import { formatShortDate } from "@/lib/dates/format"
import { symptomLabel } from "@/lib/constants"

function fmt(value: number | null) {
  return value === null ? "—" : `${value}/5`
}

function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-base font-semibold text-ink mb-1">{children}</h3>
}

/**
 * The summary itself — what she brings to the appointment and what
 * prints. The period choice and the print/download actions live around it
 * (DoctorSummaryClient); on screen its heading is for screen readers only,
 * on paper it is the title (the page header doesn't print).
 */
export function DoctorSummaryView({ summary }: { summary: DoctorSummary }) {
  return (
    <Card as="section" aria-labelledby="samenvatting-titel" className="print:shadow-none print:border print:border-black/10">
      <h2 id="samenvatting-titel" className="sr-only print:not-sr-only print:type-card-title print:mb-1">
        Samenvatting voor je arts
      </h2>
      <p className="text-sm text-ink-soft mb-4">
        {summary.periodLabel} · {summary.checkinCount}{" "}
        {summary.checkinCount === 1 ? "check-in" : "check-ins"} · geen diagnose, wel overzicht
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
          <div key={label} className="rounded-inset bg-cream-soft px-3 py-2.5">
            <p className="text-xs text-ink-soft">{label}</p>
            <p className="font-display text-lg text-ink">{fmt(value)}</p>
          </div>
        ))}
      </div>

      <SubHeading>Menstruatiecyclus</SubHeading>
      <p className="text-sm text-ink-soft mb-4">{summary.cycleNote}</p>

      <SubHeading>Meest genoteerde klachten</SubHeading>
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

      <SubHeading>Gesprekspunten (3 minuten)</SubHeading>
      <ul className="text-sm text-ink mb-4 list-disc pl-5">
        {summary.talkingPoints.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>

      {summary.periScoreNote && (
        <>
          <SubHeading>Klachtenlast (maandelijkse check)</SubHeading>
          <p className="text-sm text-ink-soft mb-2">{summary.periScoreNote}</p>
          {summary.periComplaints.length > 0 ? (
            <ul className="text-sm text-ink mb-2 list-disc pl-5">
              {summary.periComplaints.map((c) => (
                <li key={c.id}>
                  {c.label} <span className="text-ink-soft">({c.levelLabel.toLowerCase()})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-soft mb-2">
              Geen individuele klachten boven &lsquo;niet&rsquo; in deze meting.
            </p>
          )}
          {summary.periNotes ? (
            <p className="text-sm text-ink-soft mb-4 italic">Notitie: {summary.periNotes}</p>
          ) : (
            <div className="mb-4" />
          )}
        </>
      )}

      {summary.phasePatterns.length > 0 && (
        <>
          <SubHeading>Patronen per cyclusfase</SubHeading>
          <p className="text-xs text-ink-soft mb-1.5">
            Op basis van check-ins in voltooide cycli — niet van de maandelijkse klachtenlast-score.
          </p>
          <ul className="text-sm text-ink mb-4 list-disc pl-5">
            {summary.phasePatterns.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </>
      )}

      {summary.insights.length > 0 && (
        <>
          <SubHeading>Mogelijke verbanden</SubHeading>
          <ul className="text-sm text-ink mb-4 list-disc pl-5">
            {summary.insights.map((i) => (
              <li key={i.text}>{i.text}</li>
            ))}
          </ul>
        </>
      )}

      {summary.noteHighlights.length > 0 && (
        <>
          <SubHeading>Notities</SubHeading>
          <ul className="text-sm text-ink-soft mb-2 list-disc pl-5">
            {summary.noteHighlights.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </>
      )}

      {summary.appointmentNotes.length > 0 && (
        <>
          <SubHeading>Afspraken met zorgverlener</SubHeading>
          <ul className="text-sm text-ink mb-2 list-disc pl-5">
            {summary.appointmentNotes.map((n) => (
              <li key={`${n.date ?? "x"}-${n.notes}`}>
                {n.date ? `${formatShortDate(n.date, { year: true })}: ` : null}
                {n.notes}
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="text-xs text-ink-soft mt-4 border-t border-line pt-3">
        Gegenereerd met GoFiev. Dit is geen medisch advies. Bespreek klachten altijd met een
        zorgverlener. Tip: kies na &ldquo;Printen of pdf&rdquo; de optie &ldquo;Opslaan als PDF&rdquo; voor
        een deelbaar bestand.
      </p>
    </Card>
  )
}
