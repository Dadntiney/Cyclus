"use client"

import { useState } from "react"
import { addDays, format, parseISO } from "date-fns"
import { Droplet } from "lucide-react"
import { Button, textActionClass } from "@/components/ui/button"
import { MenstruationDateSheet } from "@/components/cycle/menstruation-date-sheet"
import { todayISO } from "@/lib/dates/amsterdam"
import { ICON, iconProps } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

/**
 * Menstruatie shortcut outside the phase status (that one has its own
 * "Noteer menstruatie" / "Stoppen").
 *
 * - quiet: text action, e.g. under "Cyclusinstellingen" when there is no
 *   phase estimate yet — discoverable, not loud
 * - inline: compact active-period row
 * - card: fuller row (legacy / elsewhere)
 *
 * A running period is shown in the menstruatie colours, never in `danger`.
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
        <button type="button" onClick={handleClick} aria-haspopup="dialog" className={textActionClass()}>
          <Droplet {...ICON.sm} aria-hidden />
          Noteer menstruatie
        </button>
        {sheet}
      </div>
    )
  }

  if (variant === "inline" && isActive) {
    return (
      <div className="flex items-center gap-3 rounded-card bg-phase-menstruatie-soft px-4 py-1">
        <Droplet {...iconProps("sm", "text-phase-menstruatie-strong")} fill="currentColor" aria-hidden />
        <p className="min-w-0 flex-1 text-sm font-medium text-ink">Menstruatie · dag {day}</p>
        <button
          type="button"
          onClick={handleClick}
          aria-haspopup="dialog"
          aria-label="Menstruatie stoppen"
          className={textActionClass("shrink-0")}
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
        "flex items-center gap-3 rounded-card px-4 py-3",
        isActive ? "bg-phase-menstruatie-soft" : "bg-cream-soft",
      )}
    >
      <span aria-hidden className="inline-flex h-10 w-10 shrink-0 items-center justify-center">
        <span className={cn("inline-flex", isActive && "animate-menstruatie-adem")}>
          <Droplet
            {...iconProps("md", isActive ? "text-phase-menstruatie-strong" : "text-sage-dark")}
            fill={isActive ? "currentColor" : "none"}
          />
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <p className="type-eyebrow text-ink-soft">{isActive ? "Menstruatie actief" : "Cyclus"}</p>
        <p className={cn("font-display text-base", isActive ? "text-ink" : "text-ink-soft")}>
          {isActive ? `Dag ${day}` : "Geen actieve menstruatie"}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <Button
          size="sm"
          variant={isActive ? "secondary" : "primary"}
          onClick={handleClick}
          aria-haspopup="dialog"
          aria-label={isActive ? "Menstruatie stoppen" : "Menstruatie starten"}
        >
          {isActive ? "Stoppen" : "Starten"}
        </Button>
        {sheet}
      </div>
    </div>
  )
}
