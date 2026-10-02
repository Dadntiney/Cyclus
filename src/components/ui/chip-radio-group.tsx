"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { Chip } from "@/components/ui/chip"
import { useRovingRadio } from "@/lib/hooks/use-roving-radio"
import { chipLabelsFit } from "@/lib/ui/chip-grid"
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
   * Equal-width grid of `fill` chips. 4 columns fall back to 2 when a
   * label would not fit its cell (measured against the real container, so
   * "Gemiddeld" gets 2×2 on a phone while "Ernstig" keeps 4; besluit 17).
   * 2 and 3 columns stay as asked: keep their labels short. Omit for a
   * wrapping row of content-width chips.
   */
  columns?: 2 | 3 | 4
  className?: string
  chipClassName?: string
}

const columnClasses = {
  2: "grid grid-cols-2 gap-2",
  3: "grid grid-cols-3 gap-2",
  // Before the first measurement (server render): the viewport rule.
  4: "grid grid-cols-2 min-[360px]:grid-cols-4 gap-2",
} as const

/**
 * Whether four columns fit the labels, re-checked when the container
 * resizes or the web font arrives. null = not measured yet.
 */
function useFourColumnsFit(enabled: boolean, labelKey: string) {
  const ref = useRef<HTMLDivElement>(null)
  const [fits, setFits] = useState<boolean | null>(null)

  useLayoutEffect(() => {
    const group = ref.current
    if (!enabled || !group) return

    function measure() {
      if (!group || group.clientWidth === 0) return // hidden: keep the CSS rule
      let widestLabel = 0
      for (const label of Array.from(group.querySelectorAll<HTMLElement>("[data-chip-label]"))) {
        // offsetWidth ignores the press scale transform.
        widestLabel = Math.max(widestLabel, label.offsetWidth)
      }
      const style = getComputedStyle(group)
      const px = (value: string) => Number.parseFloat(value) || 0
      const containerWidth = group.clientWidth - px(style.paddingLeft) - px(style.paddingRight)
      setFits(chipLabelsFit({ containerWidth, gap: px(style.columnGap), columns: 4, widestLabel }))
    }

    measure()
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) measure()
    })
    if (typeof ResizeObserver === "undefined") {
      return () => {
        cancelled = true
      }
    }
    const observer = new ResizeObserver(measure)
    observer.observe(group)
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [enabled, labelKey])

  return { ref, fits }
}

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
  const { ref, fits } = useFourColumnsFit(columns === 4, options.map((o) => o.label).join("\u0000"))
  const gridClass =
    columns === 4 && fits !== null
      ? cn("grid gap-2", fits ? "grid-cols-4" : "grid-cols-2")
      : columns
        ? columnClasses[columns]
        : "flex flex-wrap gap-2"

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      className={cn(gridClass, className)}
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
          <span data-chip-label="">{opt.label}</span>
        </Chip>
      ))}
    </div>
  )
}
