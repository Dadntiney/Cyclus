"use client"

import type { CyclePhase } from "@/lib/cycle/estimate"
import { formatWeekdayDate, toCalendarDay } from "@/lib/dates/format"
import { useRovingRadio } from "@/lib/hooks/use-roving-radio"
import { cn } from "@/lib/utils"

export interface DayStripDay {
  /** ISO day (yyyy-MM-dd). */
  date: string
  /** "ma", "di", … */
  weekdayShort: string
  isToday: boolean
  isPast: boolean
  /** Draws a slice of the Ritmeband under the date. */
  phase?: CyclePhase | null
  /** A day worth a second look (anticipated harder day, period may come): subtle edge. */
  highlight?: boolean
  /** Extra words for screen readers, e.g. "menstruatie kan komen". */
  note?: string
}

const PHASE_BAR: Record<CyclePhase, string> = {
  menstruatie: "bg-phase-menstruatie",
  folliculair: "bg-phase-folliculair",
  ovulatie: "bg-phase-ovulatie",
  luteaal: "bg-phase-luteaal",
}

/**
 * The one week strip for Deze week and Boodschappen (ontwerpvisie §7.2):
 * seven equal cells, a radio group (one Tab stop, arrows move and select).
 * Today has a small dot — never a ring (besluit 20); past days are dimmed;
 * an optional phase line under the date. Cells are ~35px wide on a 320px
 * screen and 56px tall (besluit 27).
 */
export function DayStrip({
  days,
  selectedIndex,
  onSelect,
  "aria-label": ariaLabel = "Kies een dag",
  className,
}: {
  days: DayStripDay[]
  selectedIndex: number
  onSelect: (index: number) => void
  "aria-label"?: string
  className?: string
}) {
  const { getItemProps } = useRovingRadio({
    count: days.length,
    selectedIndex,
    onSelect,
    orientation: "horizontal",
  })

  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn("grid grid-cols-7 gap-1", className)}>
      {days.map((d, i) => {
        const selected = i === selectedIndex
        const label = [
          formatWeekdayDate(d.date, { month: "long" }),
          d.isToday ? "vandaag" : null,
          d.isPast && !d.isToday ? "geweest" : null,
          d.note ?? null,
        ]
          .filter(Boolean)
          .join(", ")
        return (
          <button
            key={d.date}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            onClick={() => onSelect(i)}
            {...getItemProps(i)}
            className={cn(
              "relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-inset border px-0.5 py-2 touch-manipulation select-none",
              "transition-[background-color,border-color,color] duration-fast ease-standard",
              selected
                ? "border-sage-fill bg-sage-fill text-white"
                : cn(
                    "bg-surface text-ink hover:bg-cream-soft/60 active:bg-cream-soft",
                    d.highlight ? "border-sage-dark/50" : "border-line",
                    d.isPast && !d.isToday && "opacity-60",
                  ),
            )}
          >
            {d.isToday && (
              <span
                aria-hidden
                className={cn(
                  "absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full",
                  selected ? "bg-white" : "bg-sage-dark",
                )}
              />
            )}
            <span aria-hidden className={cn("text-xs", d.isToday ? "font-semibold" : "font-medium opacity-80")}>
              {d.weekdayShort}
            </span>
            <span aria-hidden className="text-base font-semibold tabular-nums">
              {toCalendarDay(d.date).day}
            </span>
            {d.phase !== undefined && (
              <span
                aria-hidden
                className={cn(
                  "h-1 w-5 rounded-full",
                  d.phase ? (selected ? "bg-white/80" : PHASE_BAR[d.phase]) : "bg-transparent",
                )}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
