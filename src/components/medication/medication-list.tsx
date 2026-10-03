"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { IconButton } from "@/components/ui/icon-button"
import { deleteMedication } from "@/lib/actions/medications"
import { describeSchedule, type MedicationSchedule } from "@/lib/medication/schedule"
import type { Tables } from "@/types/database"
import { runAction } from "@/lib/client/run-action"

type Medication = Tables<"medications">

function toSchedule(m: Medication): MedicationSchedule {
  return {
    scheduleType: m.schedule_type as MedicationSchedule["scheduleType"],
    scheduleDays: m.schedule_days,
    scheduleDaysOn: m.schedule_days_on,
    scheduleDaysOff: m.schedule_days_off,
    startDate: m.start_date,
    endDate: m.end_date,
  }
}

export function MedicationList({ medications }: { medications: Medication[] }) {
  const router = useRouter()
  const [items, setItems] = useState(medications)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    setError(null)
    const removed = items.find((m) => m.id === id)
    setItems((prev) => prev.filter((m) => m.id !== id))
    setConfirmId(null)
    startTransition(async () => {
      const result = await runAction(() => deleteMedication(id))
      if (result?.error) {
        // Roll back: put the item back so it doesn't look deleted when it wasn't.
        if (removed) setItems((prev) => [...prev, removed].sort((a, b) => a.name.localeCompare(b.name)))
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  if (items.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <Card padding="none">
        <ul className="divide-y divide-line">
          {items.map((m) => {
            const confirming = confirmId === m.id
            const questionId = `med-delete-${m.id}`
            return (
              <li key={m.id} className="py-3 pr-2 pl-4">
                <div className="flex items-start gap-2">
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-1">
                    <p className="truncate text-base font-medium text-ink">{m.name}</p>
                    {(m.form || m.dosage) && (
                      <p className="text-sm text-ink-soft">{[m.form, m.dosage].filter(Boolean).join(" · ")}</p>
                    )}
                    <p className="text-sm text-ink-soft">{describeSchedule(toSchedule(m))}</p>
                    {m.reminder_enabled && m.time_of_day && (
                      <p className="text-sm text-sage-dark">Herinnering om {m.time_of_day.slice(0, 5)}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center">
                    <IconButton href={`/medicatie/${m.id}`} label={`${m.name} bewerken`} icon={Pencil} />
                    <IconButton
                      label={`${m.name} verwijderen`}
                      icon={Trash2}
                      onClick={() => setConfirmId(m.id)}
                      disabled={isPending}
                    />
                  </div>
                </div>

                {confirming && (
                  <div
                    role="group"
                    aria-labelledby={questionId}
                    className="mt-2 mr-2 flex flex-wrap items-center gap-2 border-t border-line pt-3 motion-safe:animate-fade-in"
                  >
                    <p id={questionId} className="flex-1 text-sm text-ink">
                      {m.name} verwijderen?
                    </p>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(m.id)}>
                      Verwijderen
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmId(null)}>
                      Bewaren
                    </Button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
