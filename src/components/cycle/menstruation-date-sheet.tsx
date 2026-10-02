"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addDays, format, parseISO } from "date-fns"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { Input, Label } from "@/components/ui/input"
import { startMenstruationPeriod, stopMenstruationPeriod } from "@/lib/actions/cycle"
import { todayISO } from "@/lib/dates/amsterdam"
import { runAction } from "@/lib/client/run-action"

type Choice = "vandaag" | "gisteren" | "anders"

function shiftISO(iso: string, days: number) {
  return format(addDays(parseISO(iso), days), "yyyy-MM-dd")
}

/**
 * Start or stop a period with the day it actually happened — "het begon
 * gisteravond" or "ik vergat op stoppen te drukken" are normal, so the day
 * is a choice (today preselected) rather than always "now". The extra
 * confirm step also prevents an accidental tap from registering a period.
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
  const title = mode === "start" ? "Menstruatie noteren" : "Menstruatie gestopt"
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      {/* Mounted only while open, so every opening starts fresh on "Vandaag". */}
      <SheetBody mode={mode} onClose={onClose} periodStart={periodStart} />
    </BottomSheet>
  )
}

function SheetBody({
  mode,
  onClose,
  periodStart,
}: {
  mode: "start" | "stop"
  onClose: () => void
  periodStart: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [choice, setChoice] = useState<Choice>("vandaag")
  const [otherDate, setOtherDate] = useState("")
  const [error, setError] = useState<string | null>(null)

  const today = todayISO()
  const yesterday = shiftISO(today, -1)
  const minDate = mode === "stop" ? (periodStart ?? undefined) : shiftISO(today, -14)
  const yesterdayAllowed = !minDate || yesterday >= minDate

  const selectedDate = choice === "vandaag" ? today : choice === "gisteren" ? yesterday : otherDate

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
      onClose()
      router.refresh()
    })
  }

  const question = mode === "start" ? "Wanneer begon je menstruatie?" : "Wat was je laatste dag?"

  return (
    <>
      <p className="text-sm text-ink-soft mb-4">{question}</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={question}>
        <Chip role="radio" aria-checked={choice === "vandaag"} selected={choice === "vandaag"} onClick={() => setChoice("vandaag")}>
          Vandaag
        </Chip>
        {yesterdayAllowed && (
          <Chip role="radio" aria-checked={choice === "gisteren"} selected={choice === "gisteren"} onClick={() => setChoice("gisteren")}>
            Gisteren
          </Chip>
        )}
        <Chip role="radio" aria-checked={choice === "anders"} selected={choice === "anders"} onClick={() => setChoice("anders")}>
          Andere dag
        </Chip>
      </div>

      {choice === "anders" && (
        <div className="mt-4">
          <Label htmlFor={`menstruatie-${mode}-datum`}>Kies de dag</Label>
          <Input
            id={`menstruatie-${mode}-datum`}
            type="date"
            value={otherDate}
            min={minDate}
            max={today}
            onChange={(e) => setOtherDate(e.target.value)}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-danger mt-3">
          {error}
        </p>
      )}

      <Button className="w-full mt-5" onClick={submit} disabled={isPending}>
        {isPending ? "Bezig…" : "Opslaan"}
      </Button>
    </>
  )
}
