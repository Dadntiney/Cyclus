"use client"

import { Check } from "lucide-react"
import type { ReactNode } from "react"
import { useRovingRadio } from "@/lib/hooks/use-roving-radio"
import { CHECK_ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

export interface OptionListOption<T extends string | number> {
  value: T
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
}

interface OptionListProps<T extends string | number> {
  options: readonly OptionListOption<T>[]
  /** null/undefined = nothing chosen yet. */
  value: T | null | undefined
  onChange: (value: T) => void
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
  /**
   * framed (default): its own rounded group with hairlines, like a ListGroup.
   * Set false inside a Card or sheet so you don't get a card in a card.
   */
  framed?: boolean
  className?: string
}

/**
 * One choice where each option needs a short explanation (levensfase,
 * medicatiestatus, regelmaat, voedingsstijl, buddyfrequentie, Weergave).
 * Radio rows, left-aligned, with a 22px radio and an optional description.
 * One Tab stop; arrow keys move the choice.
 */
export function OptionList<T extends string | number>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  framed = true,
  className,
}: OptionListProps<T>) {
  const selectedIndex = options.findIndex((o) => o.value === value)
  const { getItemProps } = useRovingRadio({
    count: options.length,
    selectedIndex,
    onSelect: (i) => onChange(options[i].value),
    orientation: "vertical",
    isDisabled: (i) => Boolean(options[i]?.disabled),
  })

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      className={cn(
        "flex flex-col divide-y divide-line",
        framed && "rounded-card bg-surface border border-line overflow-hidden",
        className,
      )}
    >
      {options.map((opt, i) => {
        const checked = i === selectedIndex
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={checked}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            {...getItemProps(i)}
            className={cn(
              "flex w-full min-h-14 items-center gap-3 py-3 text-left touch-manipulation select-none",
              // Inside the rounded frame the outline sits within the row so
              // the corners never clip it.
              framed ? "px-4 -outline-offset-2" : "px-0",
              "transition-colors duration-fast ease-standard active:bg-cream-soft",
              "disabled:opacity-50 disabled:pointer-events-none",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "inline-flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-fast ease-standard",
                checked ? "bg-sage-fill border-sage-fill text-white" : "border-line-strong bg-transparent",
              )}
            >
              {checked && <Check {...CHECK_ICON} />}
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-base font-medium text-ink">{opt.label}</span>
              {opt.description && <span className="text-sm text-ink-soft">{opt.description}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}
