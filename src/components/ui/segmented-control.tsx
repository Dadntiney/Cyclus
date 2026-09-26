"use client"

import { cn } from "@/lib/utils"

interface SegmentedControlProps<T extends string> {
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  "aria-label": string
}

/**
 * An iOS-style segmented control — for a small, fixed set of mutually
 * exclusive options where all choices should be visible and comparable at
 * a glance (e.g. "dagen" vs "weken"). Not a replacement for Chip: Chip
 * stays the right control for open-ended pickers (reminder type, day-of-
 * week multi-select) where options scroll or multi-select.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-0.5 rounded-xl bg-cream-soft p-1"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "min-h-9 min-w-[64px] rounded-lg px-3 text-sm font-medium touch-manipulation transition-[background-color,color,box-shadow] duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50",
            value === opt.value
              ? "bg-white text-ink shadow-sm"
              : "text-ink-soft active:bg-white/50",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
