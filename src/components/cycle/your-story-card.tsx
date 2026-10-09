import { CalendarDays, Eye, Sparkles } from "lucide-react"
import type { ReactNode } from "react"
import type { YourStory } from "@/lib/cycle/your-story"
import { iconProps } from "@/lib/ui/icon"

function StoryLine({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-soft mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  )
}

/**
 * "Jouw verhaal": wat er speelt, wat bij jou werkt en wat deze week past —
 * only the parts there is something to say about, each with its own label,
 * so the block never promises what it doesn't show. A block inside the one
 * "Jouw patronen" card on Cyclus. (No heart icon here: in GoFiev a heart
 * only means "bewaard"; no Kennis or Ontdek icon either — one icon per
 * concept, so "Deze week" borrows the Deze week icon.)
 */
export function YourStoryBlock({ story }: { story: YourStory }) {
  const showInView = Boolean(story.cycleInView.trim())

  return (
    <div>
      <h3 className="type-card-title text-ink">Jouw verhaal</h3>
      <div className="flex flex-col gap-4 mt-3">
        {showInView && (
          <StoryLine icon={<Eye {...iconProps("sm", "text-sage-dark")} aria-hidden />} label="In beeld">
            <p className="text-sm text-ink">{story.cycleInView}</p>
          </StoryLine>
        )}

        {story.whatWorks.length > 0 && (
          <StoryLine
            icon={<Sparkles {...iconProps("sm", "text-sage-dark")} aria-hidden />}
            label="Wat werkt"
          >
            <ul className="flex flex-col gap-1.5">
              {story.whatWorks.map((line) => (
                <li key={line} className="text-sm text-ink">
                  {line}
                </li>
              ))}
            </ul>
          </StoryLine>
        )}

        {story.whatFitsThisWeek && (
          <StoryLine icon={<CalendarDays {...iconProps("sm", "text-sage-dark")} aria-hidden />} label="Deze week">
            <p className="text-sm text-ink">{story.whatFitsThisWeek}</p>
          </StoryLine>
        )}
      </div>
    </div>
  )
}
