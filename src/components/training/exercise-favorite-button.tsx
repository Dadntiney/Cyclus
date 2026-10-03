"use client"

import { toggleExerciseFavorite } from "@/lib/actions/training"
import { IconButton } from "@/components/ui/icon-button"
import { FavoriteHeartIcon, useFavoriteToggle } from "@/components/moments/use-favorite-toggle"

/**
 * Save an exercise — the same "bewaren" gesture as recipes and moments:
 * a 44px IconButton (aria-pressed), a light haptic and the app-wide toast
 * "Bewaard in Favorieten · Bekijk".
 */
export function ExerciseFavoriteButton({
  exerciseId,
  initialFavorited,
  className,
}: {
  exerciseId: string
  initialFavorited: boolean
  className?: string
}) {
  const { favorited, changes, isPending, toggle } = useFavoriteToggle({
    initialFavorited,
    toggle: () => toggleExerciseFavorite(exerciseId),
    viewHref: "/favorieten?soort=beweging",
  })

  return (
    <IconButton
      label="Bewaar oefening in favorieten"
      pressed={favorited}
      onClick={toggle}
      aria-busy={isPending || undefined}
      className={className}
      icon={<FavoriteHeartIcon favorited={favorited} changes={changes} />}
    />
  )
}
