"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Droplet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { startMenstruationPeriod, stopMenstruationPeriod } from "@/lib/actions/cycle"

/**
 * Compact menstruatie shortcut for Vandaag.
 * Active period: full row. Idle: quiet text action so it doesn't steal the hero.
 */
export function MenstruationQuickAction({
  isActive,
  day,
  variant = "card",
}: {
  isActive: boolean
  day: number | null
  variant?: "card" | "quiet"
}) {
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

  if (variant === "quiet" && !isActive) {
    return (
      <div>
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-sage-dark min-h-11 touch-manipulation"
        >
          <Droplet className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          {isPending ? "Bezig…" : "Menstruatie starten"}
        </button>
        {error && <p className="text-xs text-danger mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3.5 flex items-center gap-3.5 transition-colors",
        isActive ? "bg-phase-menstruatie-soft" : "bg-cream-soft/80",
      )}
    >
      <div className="relative shrink-0">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isActive ? "bg-surface/70" : "bg-surface",
          )}
          aria-hidden
        >
          <Droplet
            className={cn("h-4.5 w-4.5", isActive ? "text-danger" : "text-sage-dark")}
            fill={isActive ? "currentColor" : "none"}
            strokeWidth={1.75}
          />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-ink-soft">
          {isActive ? "Menstruatie actief" : "Cyclus"}
        </p>
        <p className={cn("font-display text-base leading-tight", isActive ? "text-ink" : "text-ink-soft")}>
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
