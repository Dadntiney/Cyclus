import type { BuddyQuote } from "@/lib/data/buddy-quotes"
import { BUDDY_QUOTE_CATEGORY_ICON } from "@/lib/data/buddy-quote-icons"

export function BuddyQuoteCard({ quote }: { quote: BuddyQuote }) {
  const Icon = BUDDY_QUOTE_CATEGORY_ICON[quote.category]
  return (
    <div className="rounded-3xl bg-sage-soft px-4 py-3.5 flex items-start gap-3">
      <span className="shrink-0 h-7 w-7 rounded-full bg-surface/70 flex items-center justify-center">
        <Icon className="h-4 w-4 text-sage-dark" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-sage-dark mb-0.5">Van je Buddy</p>
        <p className="text-sm text-ink leading-relaxed">{quote.text}</p>
      </div>
    </div>
  )
}
