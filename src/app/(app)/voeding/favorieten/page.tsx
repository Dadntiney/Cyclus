import { createClient } from "@/lib/supabase/server"
import { getFavoriteRecipes } from "@/lib/data/nutrition"
import { RecipeCard } from "@/components/nutrition/recipe-card"
import { EmptyState } from "@/components/ui/empty-state"
import { Heart } from "lucide-react"

export default async function FavorietenPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const recipes = await getFavoriteRecipes(user.id)

  return (
    <div className="w-full max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Favorieten</h1>
        <p className="text-sm text-ink-soft mt-1">Jouw opgeslagen recepten.</p>
      </div>

      {recipes.length ? (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
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
