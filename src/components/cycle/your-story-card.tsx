import { BookOpen, Heart, Compass } from "lucide-react"
import type { YourStory } from "@/lib/cycle/your-story"
import { Card } from "@/components/ui/card"

/**
 * Calm Cyclus hub block: wat werkt, en wat past deze week
 * (and optional “in beeld” only when it adds something Nu doesn’t already say).
 */
export function YourStoryCard({ story }: { story: YourStory }) {
  const showInView = Boolean(story.cycleInView.trim())
  const subtitle = showInView
    ? "Wat er speelt, wat bij jou werkt en wat deze week past."
    : "Wat bij jou werkt en wat deze week past."

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div>
          <p className="font-display text-xl text-ink mb-1">Jouw verhaal</p>
          <p className="text-sm text-ink-soft leading-relaxed">{subtitle}</p>
        </div>

        {showInView && (
          <div className="flex gap-2.5">
            <BookOpen className="h-4 w-4 text-sage-dark shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden />
            <div className="min-w-0">
              <p className="text-xs font-medium text-ink-soft mb-0.5">In beeld</p>
              <p className="text-sm text-ink leading-relaxed">{story.cycleInView}</p>
            </div>
          </div>
        )}

        {story.whatWorks.length > 0 && (
          <div className="flex gap-2.5">
            <Heart
              className="h-4 w-4 text-peach shrink-0 mt-0.5"
              fill="currentColor"
              strokeWidth={0}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-ink-soft mb-0.5">Wat werkt</p>
              <ul className="flex flex-col gap-1.5">
                {story.whatWorks.map((line) => (
                  <li key={line} className="text-sm text-ink leading-relaxed">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {story.whatFitsThisWeek && (
          <div className="flex gap-2.5">
            <Compass className="h-4 w-4 text-sage-dark shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden />
            <div className="min-w-0">
              <p className="text-xs font-medium text-ink-soft mb-0.5">Deze week</p>
              <p className="text-sm text-ink leading-relaxed">{story.whatFitsThisWeek}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
