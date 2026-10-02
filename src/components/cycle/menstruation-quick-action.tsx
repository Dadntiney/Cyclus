"use client"

import { useState } from "react"
import { addDays, format, parseISO } from "date-fns"
import { Droplet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MenstruationDateSheet } from "@/components/cycle/menstruation-date-sheet"
import { todayISO } from "@/lib/dates/amsterdam"
import { cn } from "@/lib/utils"

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
  const [sheetOpen, setSheetOpen] = useState(false)
  const handleClick = () => setSheetOpen(true)
  const sheet = (
    <MenstruationDateSheet
      mode={isActive ? "stop" : "start"}
      open={sheetOpen}
      onClose={() => setSheetOpen(false)}
      periodStart={isActive && day ? format(addDays(parseISO(todayISO()), -(day - 1)), "yyyy-MM-dd") : null}
    />
  )

  if (variant === "quiet" && !isActive) {
    return (
      <div>
        <button
          type="button"
          onClick={handleClick}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-sage-dark min-h-11 touch-manipulation"
        >
          <Droplet className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          Menstruatie starten
        </button>
        {sheet}
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
          className="shrink-0 text-sm font-medium text-sage-dark min-h-11 px-1 touch-manipulation"
        >
          Stoppen
        </button>
        {sheet}
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
      <div className="relative shrink-0 overflow-visible" aria-hidden>
        <span className="inline-flex h-10 w-10 items-center justify-center overflow-visible">
          <Droplet
            className={cn(
              "h-5 w-5 overflow-visible",
              isActive ? "text-danger animate-menstruatie-adem" : "text-sage-dark",
            )}
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
          aria-label={isActive ? "Menstruatie stoppen" : "Menstruatie starten"}
        >
          {isActive ? "Stoppen" : "Starten"}
        </Button>
        {sheet}
      </div>
    </div>
  )
}
