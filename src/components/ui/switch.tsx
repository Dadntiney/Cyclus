"use client"

import { cn } from "@/lib/utils"

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  "aria-label"?: string
}

/**
 * An iOS-style on/off switch — for a genuine settings-row boolean (e.g.
 * "herinnering aan/uit"), which reads more clearly at a glance than
 * relabeling a selectable chip to say "Aan"/"Uit".
 */
export function Switch({ checked, onChange, disabled, "aria-label": ariaLabel }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-8 w-[52px] shrink-0 rounded-full transition-colors duration-200 touch-manipulation",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
        "disabled:opacity-50 disabled:pointer-events-none",
        checked ? "bg-sage-dark" : "bg-line",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-7 w-7 rounded-full bg-white shadow-sm transition-transform duration-200 motion-reduce:transition-none",
          checked && "translate-x-5",
        )}
      />
    </button>
  )
}
