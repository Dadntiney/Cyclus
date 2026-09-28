import { symptomLabel } from "@/lib/constants"

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

  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-ink">{symptomLabel(item.label)}</span>
            <span className="text-ink-soft tabular-nums">{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-chart-track overflow-hidden">
            <div
              className="h-full rounded-full bg-chart-1/80 transition-[width] duration-500"
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
 */
export function ValueSparkline({
  values,
  formatValue,
  barClassName = "bg-chart-2/80",
  minBars = 2,
}: {
  values: number[]
  formatValue?: (value: number) => string
  barClassName?: string
  /** Hide when fewer than this many points (default 2). */
  minBars?: number
}) {
  if (values.length < minBars) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(1, max - min)

  return (
    <div className="flex items-end gap-1 h-12" aria-hidden>
      {values.map((value, index) => {
        const height = 20 + ((value - min) / span) * 28
        return (
          <div key={`${value}-${index}`} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div className={`w-full rounded-t-md ${barClassName}`} style={{ height }} />
            {formatValue && (
              <span className="text-[10px] text-ink-soft tabular-nums truncate max-w-full">
                {formatValue(value)}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function CycleLengthSparkline({ lengths }: { lengths: number[] }) {
  return <ValueSparkline values={lengths} formatValue={(v) => String(v)} />
}
