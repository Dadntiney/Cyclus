import type { BuddyQuote } from "@/lib/data/buddy-quotes"
import { BuddyMark } from "@/components/buddy/buddy-mark"

/** Soft ambient Buddy line on Vandaag — one sentence, not a task. */
export function BuddyQuoteCard({ quote }: { quote: BuddyQuote }) {
  return (
    <div className="rounded-3xl bg-sage-soft/55 px-4 py-3.5 flex items-start gap-3">
      <BuddyMark size="md" className="mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-sage-dark mb-0.5">Even onthouden</p>
        <p className="text-sm text-ink leading-relaxed">{quote.text}</p>
      </div>
    </div>
  )
}
