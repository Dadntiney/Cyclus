import { symptomLabel } from "@/lib/constants"
import { cn } from "@/lib/utils"

/** "27, 26 en 29" — a Dutch list for spoken chart summaries. */
export function listNl(items: string[]): string {
  if (items.length <= 1) return items.join("")
  return `${items.slice(0, -1).join(", ")} en ${items[items.length - 1]}`
}

export function SimpleBars({
  items,
  emptyLabel = "Nog geen gegevens",
}: {
  items: { label: string; value: number }[]
  emptyLabel?: string
}) {
  if (!items.length) {
    return <p className="text-sm text-ink-soft">{emptyLabel}</p>
  }

  const max = Math.max(...items.map((i) => i.value), 1)

  // Label and count are real text, so the list reads out on its own; the
  // bars are decoration.
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-center justify-between gap-3 text-sm mb-1">
            <span className="text-ink">{symptomLabel(item.label)}</span>
            <span className="text-ink-soft tabular-nums">
              <span aria-hidden>{item.value}×</span>
              <span className="sr-only">{item.value} keer</span>
            </span>
          </div>
          <div aria-hidden className="h-2 rounded-full bg-chart-track overflow-hidden">
            <div
              className="h-full rounded-full bg-chart-1/80 transition-[width] duration-slow ease-standard"
              style={{ width: `${Math.max(8, Math.round((item.value / max) * 100))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * Compact bar sparkline for calm “at a glance” trends (cycle length, sleep,
 * peri scores). No chart library — CSS only, dark-mode safe via tokens.
 *
 * Pass `label` (the whole spoken summary, e.g. "Cyclusduur van je laatste
 * 4 cycli: 27, 26, 29 en 26 dagen") so screen readers get the trend; without
 * it the chart is treated as decoration.
 */
export function ValueSparkline({
  values,
  formatValue,
  barClassName = "bg-chart-2/80",
  minBars = 2,
  label,
}: {
  values: number[]
  formatValue?: (value: number) => string
  barClassName?: string
  /** Hide when fewer than this many points (default 2). */
  minBars?: number
  /** Spoken summary of the values (role="img"). */
  label?: string
}) {
  if (values.length < minBars) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(1, max - min)

  return (
    <div
      className="flex items-end gap-1"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      {values.map((value, index) => {
        const height = 20 + ((value - min) / span) * 28
        return (
          <div key={`${value}-${index}`} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div className={cn("w-full rounded-t-xs", barClassName)} style={{ height }} />
            {formatValue && (
              <span className="text-xs text-ink-soft tabular-nums truncate max-w-full">
                {formatValue(value)}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Cycle lengths, oldest → newest, with a spoken summary. */
export function CycleLengthSparkline({ lengths }: { lengths: number[] }) {
  return (
    <ValueSparkline
      values={lengths}
      formatValue={(v) => String(v)}
      label={`Cyclusduur van je laatste ${lengths.length} cycli: ${listNl(lengths.map(String))} dagen`}
    />
  )
}
