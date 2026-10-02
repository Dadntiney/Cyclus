"use client"

import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { MAX_SERVINGS, MIN_SERVINGS } from "@/lib/client/servings-storage"

/**
 * Compact − N + control for porties. Keeps 44px touch targets.
 */
export function ServingsStepper({
  value,
  onChange,
  label = "Porties",
  className,
  size = "md",
}: {
  value: number
  onChange: (next: number) => void
  label?: string
  className?: string
  size?: "sm" | "md"
}) {
  // Small variant keeps its look but still gets a 44px hit area.
  const btn = size === "sm" ? "relative h-9 w-9 after:absolute after:-inset-1" : "h-11 w-11"
  const num = size === "sm" ? "text-sm min-w-6" : "text-base min-w-7"

  return (
    <div className={cn("inline-flex items-center gap-2", className)} role="group" aria-label={label}>
      <button
        type="button"
        aria-label="Minder porties"
        disabled={value <= MIN_SERVINGS}
        onClick={() => onChange(Math.max(MIN_SERVINGS, value - 1))}
        className={cn(
          btn,
          "rounded-xl border border-line bg-surface text-ink inline-flex items-center justify-center touch-manipulation disabled:opacity-40 motion-safe:active:scale-95 transition-transform",
        )}
      >
        <Minus className="h-4 w-4" strokeWidth={2} />
      </button>
      <span className={cn(num, "font-semibold text-ink text-center tabular-nums")}>{value}</span>
      <button
        type="button"
        aria-label="Meer porties"
        disabled={value >= MAX_SERVINGS}
        onClick={() => onChange(Math.min(MAX_SERVINGS, value + 1))}
        className={cn(
          btn,
          "rounded-xl border border-line bg-surface text-ink inline-flex items-center justify-center touch-manipulation disabled:opacity-40 motion-safe:active:scale-95 transition-transform",
        )}
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  )
}
