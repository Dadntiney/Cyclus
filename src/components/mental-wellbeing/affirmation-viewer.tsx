"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Affirmation } from "@/lib/data/affirmations"

/**
 * A simple "one at a time" viewer — no long list to scroll through, just the
 * current affirmation and a way to see another one. Starts on a day-seeded
 * pick so reloading the same day doesn't shuffle it, but "Volgende" always
 * moves forward.
 */
export function AffirmationViewer({ affirmations, seed }: { affirmations: Affirmation[]; seed: string }) {
  const startIndex = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % affirmations.length
  const [index, setIndex] = useState(startIndex)

  if (!affirmations.length) return null
  const affirmation = affirmations[index]

  return (
    <Card className="bg-sage-soft border-transparent text-center">
      <p className="font-display text-xl text-ink leading-snug px-2">&ldquo;{affirmation.text}&rdquo;</p>
      <button
        type="button"
        onClick={() => setIndex((i) => (i + 1) % affirmations.length)}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-sage-dark touch-manipulation motion-safe:active:scale-[0.96] transition-transform"
      >
        <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
        Volgende affirmatie
      </button>
    </Card>
  )
}
