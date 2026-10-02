"use client"

import { Chip } from "@/components/ui/chip"
import { useRovingRadio } from "@/lib/hooks/use-roving-radio"
import { cn } from "@/lib/utils"

interface ChipRadioOption<T extends string | number> {
  value: T
  label: string
  disabled?: boolean
}

interface ChipRadioGroupProps<T extends string | number> {
  options: readonly ChipRadioOption<T>[]
  /** null/undefined = nothing chosen yet (the first option is the Tab stop). */
  value: T | null | undefined
  onChange: (value: T) => void
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
  /**
   * Equal-width grid. 4 columns fall back to 2 below 360px (besluit 17);
   * omit for a wrapping row of content-width chips.
   */
  columns?: 2 | 3 | 4
  className?: string
  chipClassName?: string
}

const columnClasses = {
  2: "grid grid-cols-2 gap-2",
  3: "grid grid-cols-3 gap-2",
  4: "grid grid-cols-2 min-[360px]:grid-cols-4 gap-2",
} as const

/**
 * One choice out of a few short options, shown as chips — a real radio
 * group: one Tab stop, arrow keys move the choice, Space/Enter select.
 * For 2–4 options that are a "mode" use SegmentedControl; for options with
 * an explanation use OptionList.
 */
export function ChipRadioGroup<T extends string | number>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  columns,
  className,
  chipClassName,
}: ChipRadioGroupProps<T>) {
  const selectedIndex = options.findIndex((o) => o.value === value)
  const { getItemProps } = useRovingRadio({
    count: options.length,
    selectedIndex,
    onSelect: (i) => onChange(options[i].value),
    isDisabled: (i) => Boolean(options[i]?.disabled),
  })

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      className={cn(columns ? columnClasses[columns] : "flex flex-wrap gap-2", className)}
    >
      {options.map((opt, i) => (
        <Chip
          key={String(opt.value)}
          role="radio"
          selected={i === selectedIndex}
          fill={Boolean(columns)}
          disabled={opt.disabled}
          onClick={() => onChange(opt.value)}
          className={chipClassName}
          {...getItemProps(i)}
        >
          {opt.label}
        </Chip>
      ))}
    </div>
  )
}
