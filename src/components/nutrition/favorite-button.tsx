"use client"

import { toggleFavorite } from "@/lib/actions/nutrition"
import { IconButton } from "@/components/ui/icon-button"
import { FavoriteHeartIcon, useFavoriteToggle } from "@/components/moments/use-favorite-toggle"
import { RECIPE_FAVORITES_HREF } from "./recipe-format"

/**
 * Save a recipe: the app-wide "bewaren" gesture (ontwerpvisie §6.2), the
 * same hook as moments and exercises (`useFavoriteToggle`), so every heart
 * behaves alike. The heart itself is the feedback (it fills and settles
 * in, a light haptic), and the confirmation is the toast above the tab
 * bar, "Bewaard in Favorieten · Bekijk". Nothing is inserted next to the
 * title, so the h1 never reflows (NUT-6).
 *
 * The server action is called exactly as before (it toggles).
 */
export function FavoriteButton({
  recipeId,
  initialFavorited,
}: {
  recipeId: string
  initialFavorited: boolean
}) {
  const { favorited, changes, isPending, toggle } = useFavoriteToggle({
    initialFavorited,
    toggle: () => toggleFavorite(recipeId),
    viewHref: RECIPE_FAVORITES_HREF,
  })

  return (
    <IconButton
      label="Bewaar recept in favorieten"
      pressed={favorited}
      aria-busy={isPending || undefined}
      onClick={toggle}
      icon={<FavoriteHeartIcon favorited={favorited} changes={changes} />}
    />
  )
}
