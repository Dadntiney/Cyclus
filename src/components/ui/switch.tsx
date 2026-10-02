"use client"

import { cn } from "@/lib/utils"

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
  "aria-label"?: string
  /** Prefer this inside a row: point at the row title's id. */
  "aria-labelledby"?: string
  "aria-describedby"?: string
  className?: string
}

/**
 * An iOS-style on/off switch — for a genuine settings-row boolean (e.g.
 * "herinnering aan/uit"), which reads more clearly at a glance than
 * relabeling a selectable chip to say "Aan"/"Uit". Lives at the end of a
 * ListRow (`toggle` prop). Off: cream-soft track with a line-strong ring
 * (≥3:1). The visible track is 32px tall; the hit area is 44px.
 */
export function Switch({
  checked,
  onChange,
  disabled,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-8 w-13 shrink-0 rounded-full touch-manipulation",
        // 44px tall invisible hit area around the 32px track.
        "after:absolute after:-inset-x-1 after:-inset-y-1.5",
        "transition-[background-color,box-shadow] duration-base ease-standard motion-reduce:transition-none",
        "disabled:opacity-50 disabled:pointer-events-none",
        checked ? "bg-sage-fill" : "bg-cream-soft ring-[1.5px] ring-inset ring-line-strong",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 left-0.5 h-7 w-7 rounded-full bg-white shadow-control",
          "transition-transform duration-base ease-standard motion-reduce:transition-none",
          checked && "translate-x-5",
        )}
      />
    </button>
  )
}
