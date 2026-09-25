import type { BuddyQuote } from "@/lib/data/buddy-quotes"

export function BuddyQuoteCard({ quote }: { quote: BuddyQuote }) {
  return (
    <div className="rounded-3xl bg-sage-soft px-5 py-4 flex items-start gap-3">
      <span className="text-xl shrink-0" aria-hidden>
        {quote.emoji}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-sage-dark mb-0.5">Van je Buddy</p>
        <p className="text-sm text-ink leading-relaxed">{quote.text}</p>
      </div>
    </div>
  )
}
