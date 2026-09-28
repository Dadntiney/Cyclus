"use client"

import { useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { toggleExerciseFavorite } from "@/lib/actions/training"
import { triggerHaptic } from "@/lib/platform"
import { ActionToast, useActionToast } from "@/components/ui/action-toast"
import { cn } from "@/lib/utils"

export function ExerciseFavoriteButton({
  exerciseId,
  initialFavorited,
}: {
  exerciseId: string
  initialFavorited: boolean
}) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [isPending, startTransition] = useTransition()
  const toast = useActionToast()

  function handleClick() {
    triggerHaptic("light")
    const next = !favorited
    setFavorited(next)
    toast.show(next ? "Opgeslagen" : "Verwijderd")
    startTransition(async () => {
      const result = await toggleExerciseFavorite(exerciseId)
      if (result?.favorited !== undefined) {
        setFavorited(result.favorited)
      } else {
        setFavorited((f) => !f)
        toast.clear()
      }
    })
  }

  return (
    <span className="inline-flex items-center gap-2">
      <ActionToast message={toast.message} />
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={favorited}
        aria-label={favorited ? "Verwijder uit favoriete oefeningen" : "Voeg toe aan favoriete oefeningen"}
        className={cn(
          "h-11 w-11 rounded-full flex items-center justify-center border transition-colors shrink-0 touch-manipulation",
          favorited ? "bg-peach-soft border-peach text-peach" : "bg-surface border-line text-ink-soft",
        )}
      >
        <Heart className="h-4 w-4" fill={favorited ? "currentColor" : "none"} strokeWidth={1.75} />
      </button>
    </span>
  )
}
