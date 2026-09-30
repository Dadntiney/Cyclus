import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { Anticipation } from "@/lib/cycle/anticipation"

/**
 * Calm forward-looking recognition on Vandaag — not a card stack item,
 * just one soft note between cycle context and today's plan.
 */
export function AnticipationNote({ anticipation }: { anticipation: Anticipation }) {
  return (
    <section
      aria-label="Vooruitkijken"
      className="rounded-3xl bg-sage-soft/50 px-3.5 py-3"
    >
      <p className="text-sm font-medium text-ink tracking-tight">{anticipation.headline}</p>
      <p className="text-xs text-ink-soft mt-1 leading-relaxed">{anticipation.body}</p>
      <Link
        href="/deze-week"
        className="mt-2.5 inline-flex items-center gap-1 min-h-11 text-xs font-medium text-sage-dark touch-manipulation"
      >
        Week daarop afstemmen
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      </Link>
    </section>
  )
}
