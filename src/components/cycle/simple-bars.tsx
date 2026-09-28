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
          <div className="h-2 rounded-full bg-cream-soft overflow-hidden">
            <div
              className="h-full rounded-full bg-sage/80 transition-[width] duration-500"
              style={{ width: `${Math.max(8, Math.round((item.value / max) * 100))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function CycleLengthSparkline({ lengths }: { lengths: number[] }) {
  if (lengths.length < 2) return null
  const min = Math.min(...lengths)
  const max = Math.max(...lengths)
  const span = Math.max(1, max - min)

  return (
    <div className="flex items-end gap-1 h-12" aria-hidden>
      {lengths.map((length, index) => {
        const height = 20 + ((length - min) / span) * 28
        return (
          <div key={`${length}-${index}`} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-md bg-peach/80" style={{ height }} />
            <span className="text-[10px] text-ink-soft tabular-nums">{length}</span>
          </div>
        )
      })}
    </div>
  )
}
