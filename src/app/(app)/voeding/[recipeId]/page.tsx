import { notFound } from "next/navigation"
import { Users, ChefHat, Snowflake, PackageOpen } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getRecipeDetail, getFavoriteRecipeIds } from "@/lib/data/nutrition"
import { ensureRecipeImage } from "@/lib/images/ensure-recipe-image"
import { FavoriteButton } from "@/components/nutrition/favorite-button"
import { RecipeImage } from "@/components/nutrition/recipe-image"
import { Card } from "@/components/ui/card"

const DIFFICULTY_LABELS: Record<string, string> = {
  makkelijk: "Makkelijk",
  gemiddeld: "Gemiddeld",
  pittig: "Uitdagend",
}

function parseStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((i): i is string => typeof i === "string") : []
}

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

  const imageUrl = await ensureRecipeImage(recipe)

  const ingredients = parseStringArray(recipe.ingredients)
  const optionalIngredients = parseStringArray(recipe.optional_ingredients)
  const steps = parseStringArray(recipe.steps)
  const nutrition =
    recipe.nutrition_information && typeof recipe.nutrition_information === "object"
      ? (recipe.nutrition_information as Record<string, string | number>)
      : {}

  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      <RecipeImage
        title={recipe.title}
        imageUrl={imageUrl}
        className="aspect-[16/9] w-full rounded-3xl mb-5"
        iconClassName="h-20 w-20"
        sizes="(min-width: 672px) 672px, 100vw"
        priority
      />

      <div className="flex items-start justify-between gap-4 mb-1">
        <h1 className="font-display text-2xl text-ink">{recipe.title}</h1>
        <FavoriteButton recipeId={recipe.id} initialFavorited={favoriteIds.has(recipe.id)} />
      </div>
      {recipe.description && <p className="text-sm text-ink-soft mb-4">{recipe.description}</p>}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-soft mb-4">
        {recipe.preparation_time && (
          <span className="inline-flex items-center gap-1">
            <ChefHat className="h-3.5 w-3.5" strokeWidth={1.75} />
            {recipe.preparation_time} min
          </span>
        )}
        {recipe.servings && (
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
            {recipe.servings} {recipe.servings === 1 ? "portie" : "porties"}
          </span>
        )}
        {recipe.difficulty && <span>{DIFFICULTY_LABELS[recipe.difficulty] ?? recipe.difficulty}</span>}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {recipe.is_budget && (
          <span className="text-[11px] font-medium text-sage-dark bg-sage-soft rounded-full px-2.5 py-1">
            Budgetvriendelijk
          </span>
        )}
        {recipe.category.map((c) => (
          <span
            key={c}
            className="text-[11px] font-medium text-ink-soft bg-cream-soft rounded-full px-2.5 py-1"
          >
            {c}
          </span>
        ))}
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
          <p className="text-sm font-medium text-ink mb-3">
            {recipe.is_budget ? "Basis" : "Ingrediënten"}
          </p>
          <ul className="flex flex-col gap-1.5 text-sm text-ink-soft">
            {ingredients.map((ingredient, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-sage">•</span>
                {ingredient}
              </li>
            ))}
          </ul>
          {optionalIngredients.length > 0 && (
            <>
              <p className="text-sm font-medium text-ink mt-4 mb-3">Optioneel toevoegen</p>
              <ul className="flex flex-col gap-1.5 text-sm text-ink-soft">
                {optionalIngredients.map((ingredient, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-peach">•</span>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      )}

      {(steps.length > 0 || recipe.instructions) && (
        <Card className="mb-4">
          <p className="text-sm font-medium text-ink mb-3">Bereidingswijze</p>
          {steps.length > 0 ? (
            <ol className="flex flex-col gap-2.5">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-ink-soft leading-relaxed">
                  <span className="shrink-0 h-5 w-5 rounded-full bg-sage-soft text-sage-dark text-[11px] font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-ink-soft leading-relaxed">{recipe.instructions}</p>
          )}
        </Card>
      )}

      {recipe.low_carb_variant && (
        <Card className="mb-4">
          <p className="text-sm font-medium text-ink mb-2">Koolhydraatarme variant</p>
          <p className="text-sm text-ink-soft leading-relaxed">{recipe.low_carb_variant}</p>
        </Card>
      )}

      {(recipe.storage_tip || recipe.meal_prep_tip) && (
        <Card>
          <div className="flex flex-col gap-4">
            {recipe.storage_tip && (
              <div className="flex gap-2.5">
                <Snowflake className="h-4 w-4 text-sage-dark shrink-0 mt-0.5" strokeWidth={1.75} />
                <div>
                  <p className="text-xs font-medium text-ink mb-0.5">Bewaartip</p>
                  <p className="text-xs text-ink-soft">{recipe.storage_tip}</p>
                </div>
              </div>
            )}
            {recipe.meal_prep_tip && (
              <div className="flex gap-2.5">
                <PackageOpen className="h-4 w-4 text-sage-dark shrink-0 mt-0.5" strokeWidth={1.75} />
                <div>
                  <p className="text-xs font-medium text-ink mb-0.5">Meal-prep tip</p>
                  <p className="text-xs text-ink-soft">{recipe.meal_prep_tip}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
