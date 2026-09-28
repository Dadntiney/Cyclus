"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { deleteMedication } from "@/lib/actions/medications"
import { describeSchedule, type MedicationSchedule } from "@/lib/medication/schedule"
import type { Tables } from "@/types/database"

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
      const result = await deleteMedication(id)
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
    <div className="flex flex-col gap-2.5">
      {error && <p className="text-xs text-danger px-1">{error}</p>}
      {items.map((m) => (
        <Card key={m.id} className="p-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink truncate">{m.name}</p>
              {(m.form || m.dosage) && (
                <p className="text-xs text-ink-soft mt-0.5">{[m.form, m.dosage].filter(Boolean).join(" · ")}</p>
              )}
              <p className="text-xs text-ink-soft mt-0.5">{describeSchedule(toSchedule(m))}</p>
              {m.reminder_enabled && m.time_of_day && (
                <p className="text-xs text-sage-dark mt-1">Herinnering om {m.time_of_day.slice(0, 5)}</p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href={`/medicatie/${m.id}`}
                className="h-9 w-9 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream-soft touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
                aria-label="Bewerken"
              >
                <Pencil className="h-4 w-4" strokeWidth={1.75} />
              </Link>
              <button
                type="button"
                onClick={() => setConfirmId(m.id)}
                disabled={isPending}
                className="h-9 w-9 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream-soft touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
                aria-label="Verwijderen"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {confirmId === m.id && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-cream-soft p-3">
              <p className="text-xs text-ink-soft flex-1">Dit item verwijderen?</p>
              <button
                type="button"
                onClick={() => handleDelete(m.id)}
                className="text-xs font-medium text-danger touch-manipulation"
              >
                Verwijderen
              </button>
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="text-xs font-medium text-ink-soft touch-manipulation"
              >
                Annuleren
              </button>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
