"use client"

import { useEffect, useState, useTransition } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { RatingScale } from "@/components/ui/rating-scale"
import { Chip } from "@/components/ui/chip"
import { Textarea, Label } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SYMPTOM_OPTIONS, MENTAL_SYMPTOM_OPTIONS, symptomLabel } from "@/lib/constants"
import { saveCheckin } from "@/lib/actions/checkin"
import type { CheckinInput } from "@/lib/validations/checkin"
import type { Tables } from "@/types/database"

type Checkin = Tables<"daily_checkins">

export function CheckinForm({
  initial,
  mentalWellbeingEnabled = false,
}: {
  initial: Checkin | null
  mentalWellbeingEnabled?: boolean
}) {
  const symptomOptions = mentalWellbeingEnabled ? [...SYMPTOM_OPTIONS, ...MENTAL_SYMPTOM_OPTIONS] : SYMPTOM_OPTIONS
  const [energy, setEnergy] = useState<number | null>(initial?.energy ?? null)
  const [mood, setMood] = useState<number | null>(initial?.mood ?? null)
  const [sleep, setSleep] = useState<number | null>(initial?.sleep ?? null)
  const [stress, setStress] = useState<number | null>(initial?.stress ?? null)
  const [symptoms, setSymptoms] = useState<string[]>(initial?.symptoms ?? [])
  const [notes, setNotes] = useState(initial?.notes ?? "")
  const [showMore, setShowMore] = useState(
    Boolean(initial?.mood || initial?.sleep || initial?.stress || initial?.symptoms?.length || initial?.notes),
  )
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggleSymptom(value: string) {
    setSymptoms((prev) => {
      if (value === "Geen klachten") {
        return prev.includes("Geen klachten") ? [] : ["Geen klachten"]
      }
      const withoutNone = prev.filter((s) => s !== "Geen klachten")
      return withoutNone.includes(value)
        ? withoutNone.filter((s) => s !== value)
        : [...withoutNone, value]
    })
  }

  function handleSave() {
    setStatus("idle")
    setErrorMsg(null)
    startTransition(async () => {
      const result = await saveCheckin({
        energy,
        mood,
        sleep,
        stress,
        symptoms,
        notes,
        need: (initial?.need ?? null) as CheckinInput["need"],
      })
      if (result?.error) {
        setStatus("error")
        setErrorMsg(result.error)
      } else {
        setStatus("saved")
      }
    })
  }

  useEffect(() => {
    if (status !== "saved") return
    const timer = setTimeout(() => setStatus("idle"), 2500)
    return () => clearTimeout(timer)
  }, [status])

  return (
    <Card>
      <h3 className="font-display text-lg text-ink mb-1">Hoe voel je je vandaag?</h3>
      <p className="text-ink-soft text-sm mb-4">Helemaal optioneel — vul in wat je wilt bijhouden.</p>

      <div className="flex flex-col gap-5">
        <RatingScale label="Energie" value={energy} onChange={setEnergy} lowLabel="Laag" highLabel="Hoog" />

        {showMore ? (
          <>
            <RatingScale label="Stemming" value={mood} onChange={setMood} lowLabel="Somber" highLabel="Blij" />
            <RatingScale label="Slaap" value={sleep} onChange={setSleep} lowLabel="Slecht" highLabel="Goed" />
            <RatingScale label="Stress" value={stress} onChange={setStress} lowLabel="Rustig" highLabel="Gespannen" />

            <div>
              <p className="text-sm font-medium text-ink mb-2">Klachten</p>
              <div className="flex flex-wrap gap-2">
                {symptomOptions.map((symptom) => (
                  <Chip
                    key={symptom}
                    selected={symptoms.includes(symptom)}
                    onClick={() => toggleSymptom(symptom)}
                  >
                    {symptomLabel(symptom)}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notities (optioneel)</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Wil je verder nog iets kwijt over vandaag?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowMore(true)}
            className="self-start inline-flex items-center gap-1.5 text-sm font-medium text-sage-dark rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 py-1"
          >
            Meer over vandaag toevoegen
            <ChevronDown className="h-4 w-4" strokeWidth={2} />
          </button>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Bezig met opslaan..." : "Check-in opslaan"}
          </Button>
          {status === "saved" && (
            <span className="animate-pop-in inline-flex items-center gap-1.5 text-sm text-sage-dark font-medium">
              <span className="h-5 w-5 rounded-full bg-sage-soft flex items-center justify-center">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              Opgeslagen
            </span>
          )}
          {status === "error" && <span className="text-sm text-danger">{errorMsg}</span>}
        </div>
      </div>
    </Card>
  )
}
