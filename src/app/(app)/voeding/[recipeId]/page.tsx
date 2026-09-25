import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getRecipeDetail, getFavoriteRecipeIds } from "@/lib/data/nutrition"
import { FavoriteButton } from "@/components/nutrition/favorite-button"
import { Card } from "@/components/ui/card"

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ recipeId: string }>
}) {
  const { recipeId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [recipe, favoriteIds] = await Promise.all([
    getRecipeDetail(recipeId),
    getFavoriteRecipeIds(user.id),
  ])

  if (!recipe) notFound()

  const ingredients = Array.isArray(recipe.ingredients)
    ? (recipe.ingredients as unknown[]).filter((i): i is string => typeof i === "string")
    : []
  const nutrition =
    recipe.nutrition_information && typeof recipe.nutrition_information === "object"
      ? (recipe.nutrition_information as Record<string, string | number>)
      : {}

  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      <div className="flex items-start justify-between gap-4 mb-1">
        <h1 className="font-display text-2xl text-ink">{recipe.title}</h1>
        <FavoriteButton recipeId={recipe.id} initialFavorited={favoriteIds.has(recipe.id)} />
      </div>
      {recipe.description && <p className="text-sm text-ink-soft mb-5">{recipe.description}</p>}

      <div className="flex flex-wrap gap-1.5 mb-6">
        {recipe.category.map((c) => (
          <span
            key={c}
            className="text-[11px] font-medium text-sage-dark bg-sage-soft rounded-full px-2.5 py-1"
          >
            {c}
          </span>
        ))}
        {recipe.preparation_time && (
          <span className="text-[11px] font-medium text-ink-soft bg-cream-soft rounded-full px-2.5 py-1">
            {recipe.preparation_time} min
          </span>
        )}
      </div>

      {Object.keys(nutrition).length > 0 && (
        <Card className="mb-4">
          <p className="text-sm font-medium text-ink mb-3">Voedingswaarden (per portie)</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {Object.entries(nutrition).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-ink-soft capitalize">{key}</span>
                <span className="text-ink font-medium">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {ingredients.length > 0 && (
        <Card className="mb-4">
          <p className="text-sm font-medium text-ink mb-3">Ingrediënten</p>
          <ul className="flex flex-col gap-1.5 text-sm text-ink-soft">
            {ingredients.map((ingredient, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-sage">•</span>
                {ingredient}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {recipe.instructions && (
        <Card>
          <p className="text-sm font-medium text-ink mb-3">Bereidingswijze</p>
          <p className="text-sm text-ink-soft leading-relaxed">{recipe.instructions}</p>
        </Card>
      )}
    </div>
  )
}
