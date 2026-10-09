import Link from "next/link"
import { RecipeImage } from "@/components/nutrition/recipe-image"
import { Card } from "@/components/ui/card"
import type { RecipeCardData } from "@/lib/data/nutrition"
import { recipeMetaLine } from "./recipe-format"

/**
 * Compact tile: two per row on a phone so she can compare a few recipes at
 * a glance. Photo in 4:3, the title up to three lines (hyphenated in Dutch
 * where the browser can; otherwise a word too long for the card breaks
 * instead of being cut off at its edge), and one quiet meta line "25 min · Ontbijt ·
 * Budget" instead of pills, so cards in a row stay even.
 */
export function RecipeCard({ recipe }: { recipe: RecipeCardData }) {
  const meta = recipeMetaLine(recipe)
  return (
    <Link href={`/voeding/${recipe.id}`} className="group block h-full rounded-card touch-manipulation">
      <Card padding="none" interactive className="flex h-full flex-col overflow-hidden">
        <RecipeImage
          title={recipe.title}
          imageUrl={recipe.image_url}
          alt=""
          className="aspect-[4/3] w-full"
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
        />
        <div className="flex flex-1 flex-col gap-1 p-4">
          <h3 lang="nl" className="line-clamp-3 hyphens-auto wrap-break-word text-base font-medium text-ink">
            {recipe.title}
          </h3>
          {meta && <p className="text-xs text-ink-soft">{meta}</p>}
        </div>
      </Card>
    </Link>
  )
}
