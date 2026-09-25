"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { toggleMedicationTaken } from "@/lib/actions/medications"
import type { MedicationDashboardItem } from "@/lib/data/medications"
import { cn } from "@/lib/utils"

/**
 * Optional "Mijn medicatie vandaag" widget — only rendered when she has
 * medications AND explicitly turned this on in her profiel. Purely a
 * checklist of what she planned for herself; never a claim about why she
 * feels a certain way, and never shown unless she chose to see it here.
 */
export function MedicationTodayCard({ items, date }: { items: MedicationDashboardItem[]; date: string }) {
  const [logs, setLogs] = useState(() => new Map(items.map((i) => [i.id, i.taken])))
  const [isPending, startTransition] = useTransition()

  if (items.length === 0) return null

  function handleToggle(id: string) {
    setLogs((prev) => new Map(prev).set(id, !prev.get(id)))
    startTransition(async () => {
      await toggleMedicationTaken(id, date)
    })
  }

  return (
    <div>
      <h2 className="font-display text-lg text-ink mb-3">Mijn medicatie vandaag</h2>
      <Card>
        <div className="flex flex-col gap-2.5">
          {items.map((item) => {
            const paused = item.status === false
            const taken = logs.get(item.id) ?? false
            return (
              <div key={item.id} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => !paused && handleToggle(item.id)}
                  disabled={paused || isPending}
                  className={cn(
                    "shrink-0 h-6 w-6 rounded-full border flex items-center justify-center text-xs transition-colors touch-manipulation",
                    paused
                      ? "border-line/60 text-ink-soft/40"
                      : taken
                        ? "bg-sage-dark border-sage-dark text-white"
                        : "border-line text-transparent hover:border-sage/60",
                  )}
                  aria-label={taken ? "Gemarkeerd als ingenomen" : "Markeer als ingenomen"}
                >
                  {taken ? "✓" : "○"}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium truncate", paused ? "text-ink-soft" : "text-ink")}>
                    {item.name}
                  </p>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {paused
                      ? "Vandaag geen inname gepland"
                      : [item.dosage, item.timeOfDay?.slice(0, 5)].filter(Boolean).join(" · ") || "Vandaag gepland"}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        <Link href="/medicatie" className="inline-block text-xs font-medium text-sage-dark mt-3.5">
          Beheer mijn medicatie
        </Link>
      </Card>
    </div>
  )
}
