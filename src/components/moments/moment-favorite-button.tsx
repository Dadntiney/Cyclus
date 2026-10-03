"use client"

import type { MouseEvent } from "react"
import { toggleSavedMoment } from "@/lib/actions/moments"
import type { SavedMomentKind } from "@/lib/data/moments"
import { IconButton } from "@/components/ui/icon-button"
import { FavoriteHeartIcon, useFavoriteToggle } from "@/components/moments/use-favorite-toggle"

/**
 * Heart for tips / quotes / affirmations — the same "bewaren" gesture as
 * recipes and exercises: a 44px IconButton (aria-pressed), a light haptic
 * and the app-wide toast "Bewaard in Favorieten · Bekijk".
 *
 * `size="sm"` draws a 36px disc inside the same 44px target.
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
  const { favorited, changes, isPending, toggle } = useFavoriteToggle({
    initialFavorited,
    toggle: () => toggleSavedMoment({ kind, text, source, sourceKey }),
    viewHref: "/favorieten?soort=momenten",
    onFavoritedChange,
  })

  function handleClick(e: MouseEvent) {
    // The heart can sit inside a link or a tappable card.
    e.preventDefault()
    e.stopPropagation()
    toggle()
  }

  return (
    <IconButton
      label="Bewaar in favorieten"
      pressed={favorited}
      onClick={handleClick}
      disabled={!text.trim()}
      aria-busy={isPending || undefined}
      size={size}
      className={className}
      icon={<FavoriteHeartIcon favorited={favorited} changes={changes} size={size} />}
    />
  )
}
