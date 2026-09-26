import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { MentalWellbeingSuggestion } from "@/lib/mental-wellbeing/suggestions"

/**
 * Optional, check-in-driven suggestion — only ever rendered when she has
 * opted into mental wellbeing AND today's check-in flagged something
 * relevant (see pickMentalWellbeingSuggestion). Never a permanent widget:
 * no signal, no card, exactly per the product brief's "optioneel moet echt
 * optioneel zijn".
 */
export function MentalWellbeingSuggestionCard({ suggestion }: { suggestion: MentalWellbeingSuggestion }) {
  return (
    <Link
      href={`/mentale-rust/${suggestion.exercise.id}`}
      className="block rounded-3xl bg-info-soft px-5 py-4 touch-manipulation motion-safe:active:scale-[0.99] transition-transform"
    >
      <p className="text-[11px] font-medium text-info mb-0.5">Voor je hoofd, vandaag</p>
      <p className="text-base text-ink leading-relaxed">{suggestion.text}</p>
      <p className="text-sm font-medium text-info mt-2.5 inline-flex items-center gap-0.5">
        {suggestion.exercise.title} · {suggestion.exercise.durationMinutes} min
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
      </p>
    </Link>
  )
}
