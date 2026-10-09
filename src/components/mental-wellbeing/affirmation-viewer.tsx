"use client"

import { useId, useState } from "react"
import { RefreshCw } from "lucide-react"
import { textActionClass } from "@/components/ui/button"
import { MomentFavoriteButton } from "@/components/moments/moment-favorite-button"
import type { Affirmation } from "@/lib/data/affirmations"
import { ICON } from "@/lib/ui/icon"

/**
 * One affirmation at a time, as a small quote at the bottom of Mentale
 * rust (no card): "Volgende" and the save-heart under it, both 44px.
 * Starts on a day-seeded pick so reloading the same day doesn't shuffle
 * it, but "Volgende" always moves forward, with a short crossfade.
 */
export function AffirmationViewer({
  affirmations,
  seed,
  savedTexts = [],
}: {
  affirmations: Affirmation[]
  seed: string
  savedTexts?: string[]
}) {
  const titleId = useId()
  const startIndex = affirmations.length
    ? seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % affirmations.length
    : 0
  const [index, setIndex] = useState(startIndex)
  const [saved, setSaved] = useState(() => new Set(savedTexts))

  if (!affirmations.length) return null
  const affirmation = affirmations[index]

  return (
    <section aria-labelledby={titleId}>
      <h2 id={titleId} className="type-eyebrow text-sage-dark">
        Een klein moment voor jezelf
      </h2>
      <blockquote key={affirmation.id} className="mt-2 type-card-title text-ink animate-fade-in">
        &ldquo;{affirmation.text}&rdquo;
      </blockquote>
      <div className="mt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % affirmations.length)}
          className={textActionClass()}
        >
          <RefreshCw {...ICON.sm} aria-hidden />
          Volgende
          <span className="sr-only"> affirmatie</span>
        </button>
        <MomentFavoriteButton
          key={affirmation.id}
          kind="affirmation"
          text={affirmation.text}
          source="affirmations"
          sourceKey={affirmation.id}
          initialFavorited={saved.has(affirmation.text)}
          className="-mr-3"
          onFavoritedChange={(favorited) => {
            setSaved((prev) => {
              const next = new Set(prev)
              if (favorited) next.add(affirmation.text)
              else next.delete(affirmation.text)
              return next
            })
          }}
        />
      </div>
    </section>
  )
}
