"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addDays, format, parseISO } from "date-fns"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { ChipRadioGroup } from "@/components/ui/chip-radio-group"
import { FieldError, Input, Label } from "@/components/ui/input"
import { startMenstruationPeriod, stopMenstruationPeriod } from "@/lib/actions/cycle"
import { todayISO } from "@/lib/dates/amsterdam"
import { runAction } from "@/lib/client/run-action"
import { triggerHaptic } from "@/lib/platform"

type Choice = "vandaag" | "gisteren" | "anders"

function shiftISO(iso: string, days: number) {
  return format(addDays(parseISO(iso), days), "yyyy-MM-dd")
}

/**
 * Start or stop a period with the day it actually happened — "het begon
 * gisteravond" or "ik vergat op stoppen te drukken" are normal, so the day
 * is a choice (today preselected) rather than always "now". The extra
 * confirm step also prevents an accidental tap from registering a period.
 *
 * One radio group (Vandaag · Gisteren · Andere dag), "Opslaan" pinned full
 * width under it. Every opening starts fresh on "Vandaag".
 */
export function MenstruationDateSheet({
  mode,
  open,
  onClose,
  periodStart = null,
}: {
  mode: "start" | "stop"
  open: boolean
  onClose: () => void
  /** Start of the running period — the earliest day she can pick when stopping. */
  periodStart?: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [choice, setChoice] = useState<Choice>("vandaag")
  const [otherDate, setOtherDate] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Reset when the sheet opens again (adjusting state during render, not in
  // an effect, so the first frame of the new opening is already fresh).
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setChoice("vandaag")
      setOtherDate("")
      setError(null)
    }
  }

  const title = mode === "start" ? "Menstruatie noteren" : "Menstruatie gestopt"
  const question = mode === "start" ? "Wanneer begon je menstruatie?" : "Wat was je laatste dag?"
  const questionId = `menstruatie-${mode}-vraag`
  const dateId = `menstruatie-${mode}-datum`
  const errorId = `menstruatie-${mode}-fout`

  const today = todayISO()
  const yesterday = shiftISO(today, -1)
  const minDate = mode === "stop" ? (periodStart ?? undefined) : shiftISO(today, -14)
  const yesterdayAllowed = !minDate || yesterday >= minDate

  const selectedDate = choice === "vandaag" ? today : choice === "gisteren" ? yesterday : otherDate

  const options = [
    { value: "vandaag" as const, label: "Vandaag" },
    ...(yesterdayAllowed ? [{ value: "gisteren" as const, label: "Gisteren" }] : []),
    { value: "anders" as const, label: "Andere dag" },
  ]

  function submit() {
    if (!selectedDate) {
      setError("Kies een dag.")
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await runAction(() =>
        mode === "start" ? startMenstruationPeriod(selectedDate) : stopMenstruationPeriod(selectedDate),
      )
      if (result.error) {
        setError(result.error)
        return
      }
      void triggerHaptic("light")
      onClose()
      router.refresh()
    })
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <Button className="w-full" onClick={submit} disabled={isPending}>
          {isPending ? "Bezig…" : "Opslaan"}
        </Button>
      }
    >
      <p id={questionId} className="mb-4 text-sm text-ink-soft">
        {question}
      </p>
      <ChipRadioGroup
        aria-labelledby={questionId}
        columns={options.length === 3 ? 3 : 2}
        value={choice}
        onChange={(next) => {
          setChoice(next)
          setError(null)
        }}
        options={options}
      />

      {choice === "anders" && (
        <div className="mt-4">
          <Label htmlFor={dateId}>Kies de dag</Label>
          <Input
            id={dateId}
            type="date"
            value={otherDate}
            min={minDate}
            max={today}
            aria-invalid={error && !otherDate ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(e) => {
              setOtherDate(e.target.value)
              setError(null)
            }}
          />
        </div>
      )}

      <FieldError id={errorId} className="mt-3">
        {error}
      </FieldError>
    </BottomSheet>
  )
}
