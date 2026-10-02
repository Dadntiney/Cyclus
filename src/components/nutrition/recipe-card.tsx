import Link from "next/link"
import { RecipeImage } from "@/components/nutrition/recipe-image"
import type { RecipeCardData } from "@/lib/data/nutrition"

/**
 * Compact tile: two per row on a phone so she can compare a few recipes at a
 * glance instead of scrolling past one full-width photo at a time.
 */
export function RecipeCard({ recipe }: { recipe: RecipeCardData }) {
  return (
    <Link
      href={`/voeding/${recipe.id}`}
      className="group flex flex-col rounded-[1.25rem] bg-surface border border-line overflow-hidden transition-[border-color,transform] duration-150 motion-safe:active:scale-[0.985] hover:border-ink/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
    >
      <RecipeImage
        title={recipe.title}
        imageUrl={recipe.image_url}
        className="aspect-square sm:aspect-[4/3] w-full"
        sizes="(min-width: 1024px) 25vw, 50vw"
      />
      <div className="flex flex-col flex-1 p-3 sm:p-4">
        <p className="font-display text-base sm:text-lg leading-snug text-ink line-clamp-2">
          {recipe.title}
        </p>
        {recipe.description && (
          <p className="hidden sm:block text-sm text-ink-soft mt-1 line-clamp-2">
            {recipe.description}
          </p>
        )}
        {(recipe.preparation_time || recipe.servings) && (
          <p className="text-xs text-ink-soft mt-1.5">
            {recipe.preparation_time ? `${recipe.preparation_time} min` : ""}
            {recipe.preparation_time && recipe.servings ? " · " : ""}
            {recipe.servings ? `${recipe.servings} ${recipe.servings === 1 ? "portie" : "porties"}` : ""}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2.5">
          {recipe.is_budget && (
            <span className="text-xs font-medium text-white bg-sage-fill rounded-full px-2 py-0.5">
              Budget
            </span>
          )}
          {recipe.category.slice(0, recipe.is_budget ? 1 : 2).map((c) => (
            <span
              key={c}
              className="text-xs font-medium text-sage-dark bg-sage-soft rounded-full px-2 py-0.5"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
