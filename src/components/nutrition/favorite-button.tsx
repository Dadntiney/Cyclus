"use client"

import { useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { toggleFavorite } from "@/lib/actions/nutrition"
import { cn } from "@/lib/utils"

export function FavoriteButton({
  recipeId,
  initialFavorited,
}: {
  recipeId: string
  initialFavorited: boolean
}) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    setFavorited((f) => !f)
    startTransition(async () => {
      const result = await toggleFavorite(recipeId)
      if (result?.favorited !== undefined) {
        setFavorited(result.favorited)
      } else {
        // The save failed — undo the optimistic toggle so the heart doesn't lie.
        setFavorited((f) => !f)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? "Verwijder uit favorieten" : "Voeg toe aan favorieten"}
      className={cn(
        "h-11 w-11 rounded-full flex items-center justify-center border transition-colors touch-manipulation",
        favorited ? "bg-peach-soft border-peach text-peach" : "bg-white border-line text-ink-soft",
      )}
    >
      <Heart className="h-4.5 w-4.5" fill={favorited ? "currentColor" : "none"} strokeWidth={1.75} />
    </button>
  )
}
