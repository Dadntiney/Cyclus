import type { BodyChangeItem } from "@/lib/cycle/phase-knowledge"
import { BODY_CHANGE_ICON, DEFAULT_BODY_CHANGE_ICON } from "@/lib/cycle/body-change-icons"

export function BodyChangeList({ items }: { items: BodyChangeItem[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const Icon = BODY_CHANGE_ICON[item.label] ?? DEFAULT_BODY_CHANGE_ICON
        return (
        <li key={item.label} className="flex gap-3">
          <span
            className="shrink-0 h-8 w-8 rounded-full bg-cream-soft flex items-center justify-center"
            aria-hidden
          >
            <Icon className="h-4 w-4 text-sage-dark" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-sm font-medium text-ink">{item.label}</p>
            <p className="text-sm text-ink-soft leading-relaxed mt-0.5">{item.text}</p>
          </div>
        </li>
        )
      })}
    </ul>
  )
}
