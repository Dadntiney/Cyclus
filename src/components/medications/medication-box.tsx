"use client"

import { useState, useTransition } from "react"
import { Check, Plus, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Label, Textarea } from "@/components/ui/input"
import {
  addMedication,
  deleteMedication,
  toggleMedicationTaken,
} from "@/lib/actions/medications"
import { cn } from "@/lib/utils"

type Med = {
  id: string
  name: string
  notes: string | null
  reminder_time: string | null
  reminder_enabled: boolean
  takenToday: boolean
}

export function MedicationBox({ medications }: { medications: Med[] }) {
  const [name, setName] = useState("")
  const [notes, setNotes] = useState("")
  const [time, setTime] = useState("08:00")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    setError(null)
    startTransition(async () => {
      const result = await addMedication({
        name,
        notes,
        reminderTime: time || null,
        reminderEnabled: Boolean(time),
      })
      if (result?.error) setError(result.error)
      else {
        setName("")
        setNotes("")
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h2 className="font-display text-lg text-ink mb-1">Medicijndoosje</h2>
        <p className="text-sm text-ink-soft mb-3">
          Houd bij wat je wanneer gebruikt. Geen medisch advies — bij twijfel vraag je arts of
          apotheker.
        </p>

        <ul className="flex flex-col gap-2 mb-4">
          {medications.length === 0 && (
            <li className="text-sm text-ink-soft">Nog geen items. Voeg er hieronder een toe.</li>
          )}
          {medications.map((med) => (
            <li
              key={med.id}
              className="flex items-center gap-3 rounded-2xl bg-cream-soft px-3 py-2.5"
            >
              <button
                type="button"
                aria-label={med.takenToday ? "Markeer als niet genomen" : "Markeer als genomen"}
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                  med.takenToday
                    ? "bg-sage-dark border-sage-dark text-white"
                    : "border-line text-ink-soft",
                )}
                onClick={() =>
                  startTransition(async () => {
                    await toggleMedicationTaken(med.id, !med.takenToday)
                  })
                }
              >
                <Check className="h-4 w-4" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{med.name}</p>
                <p className="text-xs text-ink-soft">
                  {med.reminder_time
                    ? `Herinnering ${med.reminder_time.slice(0, 5)}`
                    : "Geen herinnering"}
                  {med.notes ? ` · ${med.notes}` : ""}
                </p>
              </div>
              <button
                type="button"
                aria-label="Verwijderen"
                className="text-ink-soft p-2"
                onClick={() =>
                  startTransition(async () => {
                    await deleteMedication(med.id)
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        <div className="border-t border-line pt-4 flex flex-col gap-3">
          <p className="text-sm font-medium text-ink flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Nieuw item
          </p>
          <div>
            <Label htmlFor="med-name">Naam</Label>
            <Input
              id="med-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bijv. vitamine D"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="med-time">Herinneringstijd (optioneel)</Label>
            <Input
              id="med-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 max-w-[10rem]"
            />
          </div>
          <div>
            <Label htmlFor="med-notes">Notitie (optioneel)</Label>
            <Textarea
              id="med-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dosering, afspraak met arts…"
              className="mt-1"
              rows={2}
            />
          </div>
          <Button type="button" onClick={handleAdd} disabled={isPending || !name.trim()}>
            Toevoegen
          </Button>
          {error && <p className="text-sm text-danger">{error}</p>}
        </div>
      </Card>
    </div>
  )
}
