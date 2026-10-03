import Link from "next/link"
import { CalendarClock, ChevronRight } from "lucide-react"
import { textActionClass } from "@/components/ui/button"
import type { Anticipation } from "@/lib/cycle/anticipation"
import { FEATURES } from "@/lib/navigation/features"
import { ICON } from "@/lib/ui/icon"

/**
 * Calm forward-looking recognition, flat on the page (no card, no tint).
 * On Vandaag it is the "Vooruitkijken" row inside "Wat je lichaam kan
 * gebruiken"; this standalone form is for places without that section.
 */
export function AnticipationNote({ anticipation }: { anticipation: Anticipation }) {
  return (
    <section aria-label="Vooruitkijken" className="flex gap-3">
      <span
        aria-hidden
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-inset bg-sage-soft text-sage-dark"
      >
        <CalendarClock {...ICON.sm} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-base font-medium text-ink">{anticipation.headline}</p>
        <p className="text-sm text-ink-soft">{anticipation.body}</p>
        <Link href={FEATURES.week.href} className={textActionClass("-ml-1 px-1")}>
          Week daarop afstemmen
          <ChevronRight {...ICON.sm} aria-hidden />
        </Link>
      </div>
    </section>
  )
}
