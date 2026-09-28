"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Droplet } from "lucide-react"
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
    <div
      className={cn(
        "rounded-2xl border border-line/70 p-4 flex items-center gap-3.5 transition-colors",
        isActive && "bg-peach-soft border-transparent",
      )}
    >
      <div className="relative shrink-0">
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full",
            isActive ? "bg-surface/70" : "bg-sage-soft",
          )}
          aria-hidden
        >
          <Droplet
            className={cn("h-5 w-5", isActive ? "text-danger" : "text-sage-dark")}
            fill={isActive ? "currentColor" : "none"}
            strokeWidth={1.75}
          />
        </span>
        {isActive && (
          <span
            className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-danger ring-2 ring-peach-soft motion-safe:animate-pulse"
            aria-hidden
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-ink-soft">{isActive ? "Menstruatie actief" : "Cyclus"}</p>
        <p className={cn("font-display text-lg leading-tight", isActive ? "text-ink" : "text-ink-soft")}>
          {isActive ? `Dag ${day}` : "Geen actieve menstruatie"}
        </p>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-1">
        <Button
          size="sm"
          variant={isActive ? "secondary" : "primary"}
          onClick={handleClick}
          disabled={isPending}
          aria-label={isActive ? "Menstruatie stoppen" : "Menstruatie starten"}
        >
          {isPending ? "Bezig..." : isActive ? "Stoppen" : "Starten"}
        </Button>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </div>
  )
}
