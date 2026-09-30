import Link from "next/link"
import { ChefHat, ChevronRight, Heart } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getFavoriteRecipes } from "@/lib/data/nutrition"
import { RecipeImage } from "@/components/nutrition/recipe-image"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { BackButton } from "@/components/ui/back-button"

/** Compact recipe favorites — same row density as the Favorieten hub. */
export default async function FavorietenPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const recipes = await getFavoriteRecipes(user.id)

  return (
    <div className="w-full max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6">
      <div>
        <BackButton href="/voeding" label="Voeding" />
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Favorieten</h1>
        <p className="text-sm text-ink-soft mt-1">Jouw opgeslagen recepten.</p>
      </div>

      {recipes.length ? (
        <Card className="p-0 divide-y divide-sage/20">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/voeding/${recipe.id}`}
              className="flex items-center gap-3 px-4 py-3 touch-manipulation hover:bg-sage-soft/70 transition-colors"
            >
              <RecipeImage
                title={recipe.title}
                imageUrl={recipe.image_url}
                className="h-12 w-12 rounded-xl shrink-0"
                sizes="48px"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink truncate">{recipe.title}</p>
                {(recipe.preparation_time || recipe.category[0]) && (
                  <p className="text-xs text-ink-soft mt-0.5 inline-flex items-center gap-1 truncate">
                    {recipe.preparation_time ? (
                      <>
                        <ChefHat className="h-3 w-3 shrink-0" strokeWidth={1.75} aria-hidden />
                        {recipe.preparation_time} min
                      </>
                    ) : null}
                    {recipe.preparation_time && recipe.category[0] ? " · " : null}
                    {recipe.category[0] ?? null}
                  </p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} aria-hidden />
            </Link>
          ))}
        </Card>
      ) : (
        <EmptyState
          icon={<Heart className="h-6 w-6" />}
          title="Je hebt nog geen recepten opgeslagen."
          description="Tik op het hartje bij een recept om het hier terug te vinden."
        />
      )}
    </div>
  )
}
