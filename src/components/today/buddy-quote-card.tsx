import type { BuddyQuote } from "@/lib/data/buddy-quotes"
import { BuddyMark } from "@/components/buddy/buddy-mark"

/**
 * Soft ambient Buddy line on Vandaag — one sentence, not a task. Sits on the
 * page ground (no card) so it reads as a quiet aside next to the plan.
 */
export function BuddyQuoteCard({ quote }: { quote: BuddyQuote }) {
  return (
    <figure className="flex items-start gap-3 px-1">
      <BuddyMark size="md" className="mt-1" />
      <div className="min-w-0">
        <figcaption className="text-xs font-medium text-sage-dark mb-1">Even onthouden</figcaption>
        <blockquote className="font-display text-lg leading-snug text-ink">{quote.text}</blockquote>
      </div>
    </figure>
  )
}
