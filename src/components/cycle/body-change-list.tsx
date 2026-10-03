import type { BodyChangeItem } from "@/lib/cycle/phase-knowledge"
import { BODY_CHANGE_ICON, DEFAULT_BODY_CHANGE_ICON } from "@/lib/cycle/body-change-icons"
import { ICON } from "@/lib/ui/icon"

export function BodyChangeList({ items }: { items: BodyChangeItem[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => {
        const Icon = BODY_CHANGE_ICON[item.label] ?? DEFAULT_BODY_CHANGE_ICON
        return (
          <li key={item.label} className="flex gap-3">
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-inset bg-sage-soft text-sage-dark"
              aria-hidden
            >
              <Icon {...ICON.sm} />
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-base font-semibold text-ink">{item.label}</p>
              <p className="text-base text-ink-soft mt-0.5">{item.text}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
