"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { Textarea, Label } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  PERI_SCORE_ITEMS,
  computePeriScore,
  formatPeriScoreTrend,
  periScoreBand,
  type PeriAnswers,
} from "@/lib/cycle/peri-score"
import { savePeriAssessment } from "@/lib/actions/peri-assessment"

const LEVELS = [
  { value: 0 as const, label: "Niet" },
  { value: 1 as const, label: "Mild" },
  { value: 2 as const, label: "Matig" },
  { value: 3 as const, label: "Hevig" },
]

export function PeriScoreForm({
  previousScore = null,
  history = [],
}: {
  previousScore?: number | null
  history?: { assessed_on: string; score: number }[]
}) {
  const [answers, setAnswers] = useState<PeriAnswers>({})
  const [notes, setNotes] = useState("")
  const [savedScore, setSavedScore] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const liveScore = useMemo(() => {
    if (Object.keys(answers).length !== PERI_SCORE_ITEMS.length) return null
    return computePeriScore(answers)
  }, [answers])

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await savePeriAssessment({ answers, notes })
      if (result.error) {
        setError(result.error)
        return
      }
      setSavedScore(result.score ?? null)
    })
  }

  if (savedScore !== null) {
    const band = periScoreBand(savedScore)
    const trend = formatPeriScoreTrend(previousScore, savedScore)
    return (
      <Card>
        <p className="text-sm text-sage-dark font-medium mb-1">Opgeslagen</p>
        <p className="font-display text-3xl text-ink mb-1">{savedScore}/100</p>
        <p className="text-base text-ink font-medium">{band.label}</p>
        <p className="text-sm text-ink-soft mt-2 leading-relaxed">{band.description}</p>
        {trend && <p className="text-sm text-ink-soft mt-2">{trend}</p>}
        <p className="text-xs text-ink-soft mt-4">
          Dit is geen diagnose of medische score — wel een handig overzicht voor jezelf of je arts.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <Link href="/cyclus/samenvatting" className="text-sm font-medium text-sage-dark underline">
            Arts-samenvatting
          </Link>
          <button
            type="button"
            className="text-sm font-medium text-sage-dark underline"
            onClick={() => {
              setSavedScore(null)
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

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h2 className="font-display text-xl text-ink mb-1">Klachtenlast (30 dagen)</h2>
        <p className="text-sm text-ink-soft leading-relaxed mb-4">
          Geef per klacht aan hoe zwaar die de afgelopen maand voor jou was. Je krijgt een cijfer
          van 0–100 om veranderingen over tijd te zien — geen diagnose.
        </p>

        <div className="flex flex-col gap-5">
          {PERI_SCORE_ITEMS.map((item) => (
            <div key={item.id}>
              <p className="text-sm font-medium text-ink">{item.label}</p>
              <p className="text-xs text-ink-soft mb-2">{item.help}</p>
              <div className="flex flex-wrap gap-1.5">
                {LEVELS.map((level) => (
                  <Chip
                    key={level.value}
                    selected={answers[item.id] === level.value}
                    onClick={() => setAnswers((prev) => ({ ...prev, [item.id]: level.value }))}
                  >
                    {level.label}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <Label htmlFor="peri-notes">Notitie (optioneel)</Label>
          <Textarea
            id="peri-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Bijvoorbeeld: vooral ’s nachts, of na stressvolle weken."
          />
        </div>

        {liveScore !== null && (
          <p className="text-sm text-ink-soft mt-3">
            Voorbeeldscore nu: <span className="font-medium text-ink">{liveScore}/100</span>
          </p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? "Opslaan…" : "Score opslaan"}
          </Button>
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      </Card>

      {history.length > 0 && (
        <Card>
          <h3 className="font-display text-lg text-ink mb-3">Eerdere metingen</h3>
          <ul className="flex flex-col gap-2">
            {history.map((row) => (
              <li key={row.assessed_on} className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">{row.assessed_on}</span>
                <span className="font-medium text-ink">{row.score}/100</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
