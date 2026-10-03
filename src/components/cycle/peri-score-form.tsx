"use client"

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { Button, textActionClass } from "@/components/ui/button"
import { ChipRadioGroup } from "@/components/ui/chip-radio-group"
import { Textarea, Label } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { SectionHeader } from "@/components/ui/section-header"
import { StickyActionBar } from "@/components/ui/sticky-action-bar"
import { PageSections } from "@/components/layout/page"
import { ValueSparkline, listNl } from "@/components/cycle/simple-bars"
import { formatReadableDate } from "@/components/cycle/date-format"
import {
  PERI_SCORE_ITEMS,
  computePeriScore,
  formatPeriScoreTrend,
  periScoreBand,
  type PeriAnswers,
} from "@/lib/cycle/peri-score"
import { savePeriAssessment } from "@/lib/actions/peri-assessment"
import { runAction } from "@/lib/client/run-action"
import { FEATURES } from "@/lib/navigation/features"

type Level = 0 | 1 | 2 | 3

const LEVELS: readonly { value: Level; label: string }[] = [
  { value: 0, label: "Niet" },
  { value: 1, label: "Mild" },
  { value: 2, label: "Matig" },
  { value: 3, label: "Hevig" },
]

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * The monthly Klachtenlast check: every question a 4-column radio group,
 * a sticky "n van 16 ingevuld" with the one save button. Saving with
 * gaps doesn't call the server: the page scrolls to the first open
 * question, focuses it and marks every gap (danger, besluit 21).
 *
 * Renders siblings (sections + StickyActionBar), so the bar is a direct
 * child of the <Page>.
 */
export function PeriScoreForm({
  previousScore = null,
  history = [],
}: {
  previousScore?: number | null
  history?: { assessed_on: string; score: number }[]
}) {
  const [answers, setAnswers] = useState<PeriAnswers>({})
  const [notes, setNotes] = useState("")
  // The score just saved, with the score it is compared to — captured at
  // save time, because the page refreshes with this measurement on top.
  const [saved, setSaved] = useState<{ score: number; previous: number | null } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showGaps, setShowGaps] = useState(false)
  const [isPending, startTransition] = useTransition()

  const uid = useId()
  const listRef = useRef<HTMLOListElement>(null)
  const savedHeadingRef = useRef<HTMLHeadingElement>(null)

  const total = PERI_SCORE_ITEMS.length
  const answered = PERI_SCORE_ITEMS.filter((item) => answers[item.id] !== undefined).length
  const openCount = total - answered

  const liveScore = useMemo(() => {
    if (Object.keys(answers).length !== PERI_SCORE_ITEMS.length) return null
    return computePeriScore(answers)
  }, [answers])

  useEffect(() => {
    if (saved) savedHeadingRef.current?.focus()
  }, [saved])

  function focusFirstGap() {
    const first = PERI_SCORE_ITEMS.find((item) => answers[item.id] === undefined)
    if (!first) return
    const row = listRef.current?.querySelector<HTMLElement>(`[data-item="${first.id}"]`)
    if (!row) return
    row.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" })
    row.querySelector<HTMLElement>('[role="radio"][tabindex="0"]')?.focus({ preventScroll: true })
  }

  function handleSave() {
    setError(null)
    if (openCount > 0) {
      setShowGaps(true)
      focusFirstGap()
      return
    }
    const previous = previousScore
    startTransition(async () => {
      const result = await runAction(() => savePeriAssessment({ answers, notes }))
      if (result.error) {
        setError(result.error)
        return
      }
      setShowGaps(false)
      const score = result.score ?? null
      if (score !== null) setSaved({ score, previous })
    })
  }

  if (saved) {
    const band = periScoreBand(saved.score)
    const trend = formatPeriScoreTrend(saved.previous, saved.score)
    return (
      <Card as="section" aria-labelledby={`${uid}-saved`}>
        <p className="type-eyebrow text-sage-dark">Opgeslagen</p>
        <h2
          ref={savedHeadingRef}
          id={`${uid}-saved`}
          tabIndex={-1}
          className="font-display text-3xl text-ink mt-1"
        >
          {saved.score}/100
        </h2>
        <p className="text-base text-ink font-medium mt-1">{band.label}</p>
        <p className="text-sm text-ink-soft mt-2">{band.description}</p>
        {trend && <p className="text-sm text-ink-soft mt-2">{trend}</p>}
        <p className="text-xs text-ink-soft mt-4">
          Dit is geen diagnose of medische score — wel een handig overzicht voor jezelf of je arts.
        </p>
        <div className="flex flex-wrap gap-x-5 mt-2">
          <Link href={FEATURES.voorJeArts.href} className={textActionClass()}>
            {FEATURES.voorJeArts.label}
          </Link>
          <button
            type="button"
            className={textActionClass()}
            onClick={() => {
              setSaved(null)
              setAnswers({})
              setNotes("")
            }}
          >
            Opnieuw invullen
          </button>
        </div>
      </Card>
    )
  }

  const historyOldestFirst = [...history].reverse().map((row) => row.score)

  return (
    <>
      <PageSections>
        <section aria-labelledby={`${uid}-questions`}>
          <SectionHeader
            id={`${uid}-questions`}
            title="Over de afgelopen 30 dagen"
            description="Geef per klacht aan hoe zwaar die de afgelopen maand voor jou was. Je krijgt een cijfer van 0–100 om veranderingen over tijd te zien — geen diagnose."
          />
          <ol ref={listRef} className="flex flex-col gap-6 mt-2">
            {PERI_SCORE_ITEMS.map((item) => {
              const labelId = `${uid}-${item.id}-label`
              const helpId = `${uid}-${item.id}-help`
              const gapId = `${uid}-${item.id}-gap`
              const isGap = showGaps && answers[item.id] === undefined
              return (
                <li key={item.id} data-item={item.id} className="scroll-mt-4">
                  <p id={labelId} className="text-base font-medium text-ink">
                    {item.label}
                  </p>
                  <p id={helpId} className="text-sm text-ink-soft mb-2">
                    {item.help}
                  </p>
                  <ChipRadioGroup
                    columns={4}
                    options={LEVELS}
                    value={answers[item.id]}
                    onChange={(value) => setAnswers((prev) => ({ ...prev, [item.id]: value }))}
                    aria-labelledby={labelId}
                    aria-describedby={isGap ? `${helpId} ${gapId}` : helpId}
                  />
                  {isGap && (
                    <p id={gapId} className="mt-1.5 text-sm text-danger">
                      Nog niet ingevuld
                    </p>
                  )}
                </li>
              )
            })}
          </ol>
        </section>

        <div>
          <Label htmlFor={`${uid}-notes`}>Notitie (optioneel)</Label>
          <Textarea
            id={`${uid}-notes`}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Bijvoorbeeld: vooral ’s nachts, of na stressvolle weken."
          />
        </div>

        {history.length > 0 && (
          <section aria-labelledby={`${uid}-history`}>
            <SectionHeader
              id={`${uid}-history`}
              title="Eerdere metingen"
              description="Lager is lichter — scores van 0 tot 100."
            />
            <Card padding="none">
              {history.length >= 2 && (
                <div className="px-4 pt-4 pb-3 border-b border-line">
                  <ValueSparkline
                    values={historyOldestFirst}
                    formatValue={(v) => String(v)}
                    barClassName="bg-chart-1/80"
                    label={`Klachtenlast van je laatste ${historyOldestFirst.length} metingen, van oud naar nieuw: ${listNl(historyOldestFirst.map(String))}`}
                  />
                </div>
              )}
              <ul role="list" className="divide-y divide-line">
                {history.map((row) => (
                  <li key={row.assessed_on} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span className="text-ink-soft">{formatReadableDate(row.assessed_on)}</span>
                    <span className="font-medium text-ink tabular-nums">{row.score}/100</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        )}
      </PageSections>

      <StickyActionBar className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <p className="min-w-0 text-sm text-ink-soft tabular-nums">
            {answered} van {total} ingevuld
            {liveScore !== null && (
              <>
                {" · "}
                <span className="font-medium text-ink">{liveScore}/100</span>
              </>
            )}
          </p>
          <Button type="button" onClick={handleSave} disabled={isPending} className="shrink-0">
            {isPending ? "Opslaan…" : "Score opslaan"}
          </Button>
        </div>
        {showGaps && openCount > 0 && (
          <p role="alert" className="text-sm text-danger">
            Nog {openCount} {openCount === 1 ? "vraag" : "vragen"} open
          </p>
        )}
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </StickyActionBar>
    </>
  )
}
