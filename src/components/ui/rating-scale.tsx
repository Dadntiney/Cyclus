"use client"

import { useId } from "react"
import { useRovingRadio } from "@/lib/hooks/use-roving-radio"
import { cn } from "@/lib/utils"

interface RatingScaleProps {
  label: string
  value: number | null
  onChange: (value: number) => void
  lowLabel?: string
  highLabel?: string
  /** Hide the visible label (it still names the group), e.g. when a heading already says it. */
  hideLabel?: boolean
  disabled?: boolean
  className?: string
}

const STEPS = [1, 2, 3, 4, 5] as const

/**
 * A 1–5 scale as a radio group: five equal pills over the full width, so
 * the low/high labels sit right under the first and last pill. One Tab
 * stop; arrow keys move the choice ("Energie, keuzerondje, 3 van 5").
 */
export function RatingScale({
  label,
  value,
  onChange,
  lowLabel,
  highLabel,
  hideLabel,
  disabled,
  className,
}: RatingScaleProps) {
  const labelId = useId()
  const selectedIndex = value === null ? -1 : STEPS.indexOf(value as (typeof STEPS)[number])
  const { getItemProps } = useRovingRadio({
    count: STEPS.length,
    selectedIndex,
    onSelect: (i) => onChange(STEPS[i]),
    orientation: "horizontal",
    isDisabled: () => Boolean(disabled),
  })

  return (
    <div className={className}>
      <p id={labelId} className={cn("text-sm font-medium text-ink mb-2", hideLabel && "sr-only")}>
        {label}
      </p>
      <div role="radiogroup" aria-labelledby={labelId} className="grid grid-cols-5 gap-2">
        {STEPS.map((n, i) => {
          const checked = value === n
          const name =
            n === 1 && lowLabel ? `1, ${lowLabel}` : n === 5 && highLabel ? `5, ${highLabel}` : String(n)
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={name}
              disabled={disabled}
              onClick={() => onChange(n)}
              {...getItemProps(i)}
              className={cn(
                "h-11 w-full rounded-full border text-sm font-semibold flex items-center justify-center touch-manipulation select-none",
                "transition-[background-color,border-color,color,transform] duration-fast ease-standard motion-safe:active:scale-[0.97]",
                "disabled:opacity-50 disabled:pointer-events-none",
                checked
                  ? "bg-sage-fill text-white border-sage-fill"
                  : "bg-transparent text-ink border-line-strong hover:bg-cream-soft/60 active:bg-cream-soft/60",
              )}
            >
              {n}
            </button>
          )
        })}
      </div>
      {(lowLabel || highLabel) && (
        // The pills span the full width, so the ends of this row line up
        // with the first and last pill. Hidden from screen readers: the
        // first/last radio already carry these words in their name.
        <div aria-hidden className="flex justify-between gap-3 mt-1.5 text-xs text-ink-soft">
          <span>{lowLabel}</span>
          <span className="text-right">{highLabel}</span>
        </div>
      )}
    </div>
  )
}
