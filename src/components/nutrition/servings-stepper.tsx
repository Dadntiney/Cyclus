"use client"

import { Minus, Plus } from "lucide-react"
import { IconButton } from "@/components/ui/icon-button"
import { cn } from "@/lib/utils"
import { MAX_SERVINGS, MIN_SERVINGS } from "@/lib/client/servings-storage"

/**
 * Compact − N + control for porties (recipe page, Boodschappen). Both
 * buttons keep a 44px target; at the limit they stay focusable
 * (aria-disabled), so the keyboard focus never drops away. The number is
 * announced politely when it changes.
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
  const atMin = value <= MIN_SERVINGS
  const atMax = value >= MAX_SERVINGS
  const buttonSize = size === "sm" ? "sm" : "md"

  return (
    <div className={cn("inline-flex items-center", className)} role="group" aria-label={label}>
      <IconButton
        label="Minder porties"
        icon={Minus}
        size={buttonSize}
        tone="soft"
        aria-disabled={atMin || undefined}
        className="aria-disabled:opacity-50"
        onClick={() => {
          if (!atMin) onChange(Math.max(MIN_SERVINGS, value - 1))
        }}
      />
      <span
        aria-live="polite"
        aria-atomic="true"
        className={cn("text-center text-base font-semibold text-ink tabular-nums", size === "sm" ? "min-w-7" : "min-w-8")}
      >
        {value}
        <span className="sr-only"> {value === 1 ? "portie" : "porties"}</span>
      </span>
      <IconButton
        label="Meer porties"
        icon={Plus}
        size={buttonSize}
        tone="soft"
        aria-disabled={atMax || undefined}
        className="aria-disabled:opacity-50"
        onClick={() => {
          if (!atMax) onChange(Math.min(MAX_SERVINGS, value + 1))
        }}
      />
    </div>
  )
}
