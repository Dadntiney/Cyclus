"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Droplet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { startMenstruationPeriod, stopMenstruationPeriod } from "@/lib/actions/cycle"

/**
 * Menstruatie shortcut for Vandaag.
 *
 * - quiet: text action under phase context (idle) — discoverable, not loud
 * - inline: compact active-period row under phase (no big dashboard card)
 * - card: fuller row (legacy / elsewhere)
 */
export function MenstruationQuickAction({
  isActive,
  day,
  variant = "card",
}: {
  isActive: boolean
  day: number | null
  variant?: "card" | "quiet" | "inline"
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
          className="inline-flex items-center gap-1.5 text-sm font-medium text-sage-dark min-h-11 touch-manipulation"
        >
          <Droplet className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          {isPending ? "Bezig…" : "Menstruatie starten"}
        </button>
        {error && <p className="text-xs text-danger mt-1">{error}</p>}
      </div>
    )
  }

  if (variant === "inline" && isActive) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-phase-menstruatie-soft px-3.5 py-2.5">
        <Droplet
          className="h-4 w-4 text-danger shrink-0"
          fill="currentColor"
          strokeWidth={1.75}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">
            Menstruatie · dag {day}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          className="shrink-0 text-sm font-medium text-sage-dark min-h-11 px-1 touch-manipulation"
        >
          {isPending ? "Bezig…" : "Stoppen"}
        </button>
        {error && <p className="text-xs text-danger sr-only">{error}</p>}
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
          <span className="relative inline-flex h-4.5 w-4.5 items-center justify-center">
            {isActive && (
              <span
                className="absolute inset-0 rounded-full bg-danger/20 motion-safe:animate-menstruatie-adem"
                aria-hidden
              />
            )}
            <Droplet
              className={cn(
                "relative h-4.5 w-4.5",
                isActive
                  ? "text-danger motion-safe:animate-menstruatie-adem"
                  : "text-sage-dark",
              )}
              fill={isActive ? "currentColor" : "none"}
              strokeWidth={1.75}
            />
          </span>
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
