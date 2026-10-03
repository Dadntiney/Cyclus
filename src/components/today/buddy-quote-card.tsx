import type { BuddyQuote } from "@/lib/data/buddy-quotes"
import { BuddyMark } from "@/components/buddy/buddy-mark"

/**
 * "Even onthouden" — one Buddy line on Vandaag, flat on the page (no card)
 * so it reads as a quiet aside, not a task.
 */
export function BuddyQuoteCard({ quote }: { quote: BuddyQuote }) {
  return (
    <figure className="flex items-start gap-3">
      <BuddyMark size="md" className="mt-0.5" />
      <div className="min-w-0">
        <figcaption className="mb-1 type-eyebrow text-sage-dark">Even onthouden</figcaption>
        <blockquote className="font-display text-base leading-snug text-ink">{quote.text}</blockquote>
      </div>
    </figure>
  )
}
