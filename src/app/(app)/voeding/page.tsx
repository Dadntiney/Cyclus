import Link from "next/link"
import { Heart } from "lucide-react"
import { getRecipeLibrary } from "@/lib/data/nutrition"
import { RecipeLibrary } from "@/components/nutrition/recipe-library"

export default async function VoedingPage() {
  const recipes = await getRecipeLibrary()

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Voeding</h1>
          <p className="text-sm text-ink-soft mt-1">Recepten die passen bij jouw voorkeuren.</p>
        </div>
        <Link
          href="/voeding/favorieten"
          className="flex items-center gap-1.5 text-sm font-medium text-sage-dark"
        >
          <Heart className="h-4 w-4" />
          Favorieten
        </Link>
      </div>

      <RecipeLibrary recipes={recipes} />
    </div>
  )
}
