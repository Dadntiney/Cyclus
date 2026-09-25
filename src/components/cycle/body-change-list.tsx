import type { BodyChangeItem } from "@/lib/cycle/phase-knowledge"

export function BodyChangeList({ items }: { items: BodyChangeItem[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.label} className="flex gap-3">
          <span
            className="shrink-0 h-8 w-8 rounded-full bg-cream-soft flex items-center justify-center text-base"
            aria-hidden
          >
            {item.emoji}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-sm font-medium text-ink">{item.label}</p>
            <p className="text-sm text-ink-soft leading-relaxed mt-0.5">{item.text}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
