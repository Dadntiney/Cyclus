import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type ProfileHubItem = {
  href: string
  icon: LucideIcon
  title: string
  description: string
}

/**
 * iOS-style grouped settings list: one visual group, clear rows, no card soup.
 */
export function ProfileHubGroup({
  title,
  items,
}: {
  title?: string
  items: readonly ProfileHubItem[]
}) {
  return (
    <section className="flex flex-col gap-2">
      {title ? (
        <h2 className="px-1 text-xs font-medium uppercase tracking-wide text-ink-soft">{title}</h2>
      ) : null}
      <ul className="overflow-hidden rounded-2xl border border-line/70 bg-surface divide-y divide-line/70">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-3.5 px-4 min-h-14 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sage/50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sage-soft text-sage-dark">
                <item.icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0 flex-1 py-3">
                <span className="block text-base font-medium text-ink">{item.title}</span>
                <span className="block text-sm text-ink-soft mt-0.5 leading-snug">{item.description}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-soft" strokeWidth={1.75} aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ProfileHubRow({
  href,
  icon: Icon,
  title,
  description,
  className,
}: ProfileHubItem & { className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3.5 rounded-2xl border border-line/70 bg-surface px-4 min-h-14 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50",
        className,
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sage-soft text-sage-dark">
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 py-3">
        <span className="block text-base font-medium text-ink">{title}</span>
        {description ? <span className="block text-sm text-ink-soft mt-0.5 leading-snug">{description}</span> : null}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-soft" strokeWidth={1.75} aria-hidden />
    </Link>
  )
}
