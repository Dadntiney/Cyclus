"use client"

import { useState, useTransition, type MouseEvent } from "react"
import { Heart } from "lucide-react"
import { toggleSavedMoment } from "@/lib/actions/moments"
import type { SavedMomentKind } from "@/lib/data/moments"
import { ActionToast, useActionToast } from "@/components/ui/action-toast"
import { cn } from "@/lib/utils"
import { runAction } from "@/lib/client/run-action"

/**
 * Heart for tips / quotes / affirmations — same gesture as recipe favorites.
 */
export function MomentFavoriteButton({
  kind,
  text,
  source,
  sourceKey,
  initialFavorited,
  size = "md",
  className,
  onFavoritedChange,
}: {
  kind: SavedMomentKind
  text: string
  source?: string
  sourceKey?: string
  initialFavorited: boolean
  size?: "sm" | "md"
  className?: string
  onFavoritedChange?: (favorited: boolean) => void
}) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [isPending, startTransition] = useTransition()
  const toast = useActionToast()

  function handleClick(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const next = !favorited
    setFavorited(next)
    onFavoritedChange?.(next)
    toast.show(next ? "Opgeslagen" : "Verwijderd")
    startTransition(async () => {
      const result = await runAction(() => toggleSavedMoment({ kind, text, source, sourceKey }))
      if (result?.favorited !== undefined) {
        setFavorited(result.favorited)
        onFavoritedChange?.(result.favorited)
      } else {
        setFavorited((f) => !f)
        onFavoritedChange?.(!next)
        toast.clear()
      }
    })
  }

  return (
    <span className={cn("inline-flex items-center gap-2 shrink-0", className)}>
      <ActionToast message={toast.message} />
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending || !text.trim()}
        aria-pressed={favorited}
        aria-label={favorited ? "Verwijder uit favorieten" : "Bewaar als favoriet"}
        className={cn(
          "rounded-full flex items-center justify-center transition-colors touch-manipulation",
          // Small variant keeps its look but still gets a 44px hit area.
          size === "sm" ? "relative h-9 w-9 after:absolute after:-inset-1" : "h-11 w-11",
          favorited ? "bg-peach-soft text-peach" : "bg-surface/70 text-ink-soft hover:text-peach",
        )}
      >
        <Heart
          className={size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5"}
          fill={favorited ? "currentColor" : "none"}
          strokeWidth={1.75}
        />
      </button>
    </span>
  )
}
