"use client"

import { useRovingRadio } from "@/lib/hooks/use-roving-radio"
import { cn } from "@/lib/utils"

interface SegmentedControlProps<T extends string> {
  options: readonly { value: T; label: string; disabled?: boolean }[]
  value: T
  onChange: (value: T) => void
  "aria-label"?: string
  "aria-labelledby"?: string
  /** Stretch over the full width with equal segments (Week/Dag, 4/8/12 wk). */
  fullWidth?: boolean
  className?: string
}

/**
 * An iOS-style segmented control — for a small, fixed set (2–4) of
 * mutually exclusive options where all choices should be visible and
 * comparable at a glance (e.g. "dagen" vs "weken", Week/Dag, a period).
 * A radio group: one Tab stop, arrow keys move the choice.
 * Not a replacement for Chip: Chip stays the right control for filters
 * and multi-select.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  fullWidth,
  className,
}: SegmentedControlProps<T>) {
  const selectedIndex = options.findIndex((o) => o.value === value)
  const { getItemProps } = useRovingRadio({
    count: options.length,
    selectedIndex,
    onSelect: (i) => onChange(options[i].value),
    orientation: "horizontal",
    isDisabled: (i) => Boolean(options[i]?.disabled),
  })

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "items-center gap-0.5 rounded-full bg-cream-soft border border-line p-1",
        fullWidth ? "grid w-full grid-flow-col auto-cols-fr" : "inline-flex",
        className,
      )}
    >
      {options.map((opt, i) => {
        const checked = i === selectedIndex
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={checked}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            {...getItemProps(i)}
            className={cn(
              "min-h-11 rounded-full text-sm font-medium touch-manipulation select-none whitespace-nowrap",
              // Full width: equal segments, so less padding; four labels
              // like "Momenten" still fit side by side at 320px (13px floor).
              fullWidth ? "min-w-0 px-2 max-[359px]:px-1 max-[359px]:text-xs" : "min-w-16 px-4",
              "transition-[background-color,color,box-shadow] duration-fast ease-standard",
              "disabled:opacity-50 disabled:pointer-events-none",
              checked
                ? "bg-surface-elevated text-ink font-semibold ring-1 ring-line shadow-control"
                : "text-ink-soft hover:text-ink active:bg-surface/50",
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
