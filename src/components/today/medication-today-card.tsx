"use client"

import { useState, useTransition } from "react"
import { toggleMedicationTaken } from "@/lib/actions/medications"
import type { MedicationDashboardItem } from "@/lib/data/medications"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { SectionAction, SectionHeader } from "@/components/ui/section-header"
import { FEATURES } from "@/lib/navigation/features"
import { runAction } from "@/lib/client/run-action"

/**
 * Optional "Medicatie vandaag" — only rendered when she has medications
 * AND explicitly turned this on in her profiel. Purely a checklist of what
 * she planned for herself; never a claim about why she feels a certain
 * way, and never shown unless she chose to see it here.
 */
export function MedicationTodayCard({ items, date }: { items: MedicationDashboardItem[]; date: string }) {
  const [logs, setLogs] = useState(() => new Map(items.map((i) => [i.id, i.taken])))
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (items.length === 0) return null

  function handleToggle(id: string) {
    setError(null)
    setLogs((prev) => new Map(prev).set(id, !prev.get(id)))
    startTransition(async () => {
      const result = await runAction(() => toggleMedicationTaken(id, date))
      if (result?.error) {
        // Roll back the optimistic flip so the checkbox reflects reality.
        setLogs((prev) => new Map(prev).set(id, !prev.get(id)))
        setError(result.error)
      }
    })
  }

  return (
    <section aria-labelledby="medicatie-vandaag-heading">
      <SectionHeader
        id="medicatie-vandaag-heading"
        title="Medicatie vandaag"
        action={
          <SectionAction href={FEATURES.medicatie.href}>
            Beheren<span className="sr-only"> medicatie</span>
          </SectionAction>
        }
      />
      <Card padding="none">
        <ul className="divide-y divide-line">
          {items.map((item) => {
            const paused = item.status === false
            const taken = logs.get(item.id) ?? false
            return (
              <li key={item.id} className="px-4">
                <Checkbox
                  checked={taken}
                  disabled={paused}
                  onCheckedChange={() => {
                    // One toggle at a time (as before), without dimming the
                    // whole list while it saves.
                    if (!paused && !isPending) handleToggle(item.id)
                  }}
                  description={
                    paused
                      ? "Vandaag geen inname gepland"
                      : [item.dosage, item.timeOfDay?.slice(0, 5)].filter(Boolean).join(" · ") || "Vandaag gepland"
                  }
                  className="py-3"
                >
                  {item.name}
                </Checkbox>
              </li>
            )
          })}
        </ul>
      </Card>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </section>
  )
}
