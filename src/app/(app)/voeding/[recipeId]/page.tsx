import type { Metadata } from "next"
import { cache } from "react"
import { notFound } from "next/navigation"
import { after } from "next/server"
import { Clock, Gauge, PackageOpen, Snowflake, WheatOff, type LucideIcon } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getRecipeDetail, getFavoriteRecipeIds } from "@/lib/data/nutrition"
import { ensureRecipeImage } from "@/lib/images/ensure-recipe-image"
import { FavoriteButton } from "@/components/nutrition/favorite-button"
import { RecipeImage } from "@/components/nutrition/recipe-image"
import {
  RecipeIngredientsWithServings,
  RecipeServingsMeta,
} from "@/components/nutrition/recipe-ingredients-with-servings"
import { DIFFICULTY_LABELS, formatPrepTime, nutritionStats } from "@/components/nutrition/recipe-format"
import { Page } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { SectionHeader } from "@/components/ui/section-header"
import { ICON, iconProps } from "@/lib/ui/icon"

// One query per request, shared by the document title and the page.
const loadRecipe = cache((recipeId: string) => getRecipeDetail(recipeId))

export async function generateMetadata({ params }: { params: Promise<{ recipeId: string }> }): Promise<Metadata> {
  const { recipeId } = await params
  const recipe = await loadRecipe(recipeId)
  return { title: recipe?.title ?? "Recept" }
}

function parseStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((i): i is string => typeof i === "string") : []
}

/**
 * One recipe (ontwerpvisie §7.4): hero, title with the save-heart next to
 * it on every screen size (besluit 12), one meta line (time, porties as
 * she chose them, difficulty), the nutrition values as a small summary,
 * then Ingrediënten (the one card: porties and the list), Bereiding and
 * Variëren & bewaren flat on the page. On desktop: 2/3 + 1/3.
 */
export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ recipeId: string }>
}) {
  const { recipeId } = await params
  const user = await getAuthedUser()
  if (!user) return null

  const [recipe, favoriteIds] = await Promise.all([loadRecipe(recipeId), getFavoriteRecipeIds(user.id)])

  if (!recipe) notFound()

  // Never block the page on image generation — show what's already saved
  // (or the illustrated placeholder) immediately, and let a missing photo
  // warm up in the background via after() so the *next* visit has it,
  // instead of stalling this request for however long the AI/stock-photo
  // provider takes.
  const imageUrl = recipe.image_url
  if (!imageUrl) {
    after(() => {
      void ensureRecipeImage(recipe)
    })
  }

  const ingredients = parseStringArray(recipe.ingredients)
  const optionalIngredients = parseStringArray(recipe.optional_ingredients)
  const steps = parseStringArray(recipe.steps)
  const stats = nutritionStats(recipe.nutrition_information)
  const difficulty = recipe.difficulty ? (DIFFICULTY_LABELS[recipe.difficulty] ?? recipe.difficulty) : null

  const tips: { icon: LucideIcon; title: string; text: string }[] = []
  if (recipe.low_carb_variant) tips.push({ icon: WheatOff, title: "Koolhydraatarme variant", text: recipe.low_carb_variant })
  if (recipe.storage_tip) tips.push({ icon: Snowflake, title: "Bewaartip", text: recipe.storage_tip })
  if (recipe.meal_prep_tip) tips.push({ icon: PackageOpen, title: "Meal-prep tip", text: recipe.meal_prep_tip })

  return (
    <Page width="wide">
      <PageHeader
        media={
          <RecipeImage
            title={recipe.title}
            imageUrl={imageUrl}
            alt=""
            className="aspect-[4/3] max-h-105 w-full rounded-card lg:aspect-[21/9]"
            iconClassName="h-20 w-20"
            sizes="(min-width: 1152px) 1088px, 100vw"
            priority
          />
        }
        title={recipe.title}
        inlineAction={<FavoriteButton recipeId={recipe.id} initialFavorited={favoriteIds.has(recipe.id)} />}
        subtitle={
          <>
            {recipe.description && <span className="mb-3 block max-w-2xl">{recipe.description}</span>}
            <span className="flex flex-wrap gap-x-4 gap-y-1">
              {recipe.preparation_time ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock {...ICON.sm} aria-hidden />
                  {formatPrepTime(recipe.preparation_time)}
                </span>
              ) : null}
              <RecipeServingsMeta userId={user.id} recipeId={recipe.id} recipeServings={recipe.servings} />
              {difficulty && (
                <span className="inline-flex items-center gap-1.5">
                  <Gauge {...ICON.sm} aria-hidden />
                  {difficulty}
                </span>
              )}
            </span>
          </>
        }
      />

      {/* Mobile: values, Ingrediënten, Bereiding, Variëren & bewaren. Desktop:
          the recipe on the left (2/3), values and tips on the right (1/3);
          the second row is 1fr so the tips sit right under the values. */}
      <div className="grid gap-8 lg:grid-cols-3 lg:grid-rows-[auto_1fr] lg:items-start">
        {stats.length > 0 && (
          <section aria-labelledby="voedingswaarden" className="lg:col-start-3 lg:row-start-1">
            <p id="voedingswaarden" className="mb-2 text-sm text-ink-soft">
              Voedingswaarden per portie, bij benadering
            </p>
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
              {stats.map((stat) => (
                <div key={stat.key} className="flex flex-col-reverse rounded-inset bg-cream-soft px-3 py-3 text-center">
                  <dt className="text-xs text-ink-soft">{stat.label}</dt>
                  <dd className="text-base font-semibold text-ink tabular-nums">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <div className="flex flex-col gap-8 lg:col-span-2 lg:col-start-1 lg:row-span-2 lg:row-start-1">
          {ingredients.length > 0 && (
            <section aria-labelledby="ingredienten">
              <SectionHeader id="ingredienten" title="Ingrediënten" />
              <RecipeIngredientsWithServings
                userId={user.id}
                recipeId={recipe.id}
                recipeServings={recipe.servings}
                ingredients={ingredients}
                optionalIngredients={optionalIngredients}
              />
            </section>
          )}

          {(steps.length > 0 || recipe.instructions) && (
            <section aria-labelledby="bereiding">
              <SectionHeader id="bereiding" title="Bereiding" />
              {steps.length > 0 ? (
                <ol className="flex flex-col gap-4">
                  {steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-base text-ink">
                      <span
                        aria-hidden
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sm font-semibold text-sage-darker tabular-nums"
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-base text-ink">{recipe.instructions}</p>
              )}
            </section>
          )}
        </div>

        {tips.length > 0 && (
          <section
            aria-labelledby="varieren"
            className={stats.length > 0 ? "lg:col-start-3 lg:row-start-2" : "lg:col-start-3 lg:row-start-1"}
          >
            <SectionHeader id="varieren" title="Variëren & bewaren" />
            <ul className="flex flex-col gap-5">
              {tips.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <Icon {...iconProps("sm", "mt-1 text-sage-dark")} aria-hidden />
                  <div className="min-w-0">
                    <h3 className="text-base font-medium text-ink">{title}</h3>
                    <p className="mt-0.5 text-sm text-ink-soft">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Page>
  )
}
