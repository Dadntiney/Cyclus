"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { startMenstruationPeriod, stopMenstruationPeriod } from "@/lib/actions/cycle"

/**
 * Compact "menstruatie starten/stoppen" shortcut for the Vandaag-pagina.
 * `isActive`/`day` come straight from cycle_profiles.active_period_start —
 * the same explicit source of truth the Cyclus-kalender and Cyclusdag
 * estimate read (see withActivePeriod in lib/cycle/history.ts), so this
 * card and the calendar can never silently disagree with each other.
 */
export function MenstruationQuickAction({ isActive, day }: { isActive: boolean; day: number | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const result = isActive ? await stopMenstruationPeriod() : await startMenstruationPeriod()
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <Card
      className={cn(
        "p-4 flex items-center justify-between gap-3 mb-6 lg:mb-8 transition-colors",
        isActive && "bg-peach-soft border-transparent",
      )}
    >
      <div className="min-w-0 flex items-center gap-2.5">
        {isActive && (
          <span className="shrink-0 h-2 w-2 rounded-full bg-danger motion-safe:animate-pulse" aria-hidden />
        )}
        <p className={cn("text-base font-semibold", isActive ? "text-ink" : "text-ink-soft font-medium")}>
          {isActive ? `Menstruatie – dag ${day} 🩸` : "Geen actieve menstruatie"}
        </p>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1">
        <Button size="sm" variant={isActive ? "secondary" : "primary"} onClick={handleClick} disabled={isPending}>
          {isPending ? "Bezig..." : isActive ? "Menstruatie stoppen" : "Menstruatie starten 🩸"}
        </Button>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </Card>
  )
}
