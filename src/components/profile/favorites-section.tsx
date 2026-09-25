import Link from "next/link"
import { Heart } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { RecipeCardData } from "@/lib/data/nutrition"

type Recipe = RecipeCardData
type FavoriteExercise = { id: string; name: string; muscle_group: string | null; workout_id: string }

export function FavoritesSection({
  favoriteRecipes,
  favoriteExercises,
}: {
  favoriteRecipes: Recipe[]
  favoriteExercises: FavoriteExercise[]
}) {
  const isEmpty = favoriteRecipes.length === 0 && favoriteExercises.length === 0

  return (
    <Card>
      <h2 className="font-display text-lg text-ink mb-3">Mijn favorieten</h2>
      {isEmpty ? (
        <p className="text-sm text-ink-soft">
          Nog geen favorieten opgeslagen. Tik op het hartje bij een recept of oefening die bij je
          past — dan vind je ze hier terug.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {favoriteRecipes.length > 0 && (
            <div>
              <p className="text-xs font-medium text-ink-soft mb-2">Recepten</p>
              <div className="flex flex-col gap-2">
                {favoriteRecipes.slice(0, 4).map((r) => (
                  <Link
                    key={r.id}
                    href={`/voeding/${r.id}`}
                    className="flex items-center gap-2 text-sm text-ink hover:text-sage-dark rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
                  >
                    <Heart className="h-3.5 w-3.5 text-peach shrink-0" fill="currentColor" strokeWidth={0} />
                    <span className="truncate">{r.title}</span>
                  </Link>
                ))}
              </div>
              {favoriteRecipes.length > 4 && (
                <Link href="/voeding/favorieten" className="text-xs text-sage-dark mt-2 inline-block">
                  Alle favoriete recepten →
                </Link>
              )}
            </div>
          )}

          {favoriteExercises.length > 0 && (
            <div>
              <p className="text-xs font-medium text-ink-soft mb-2">Oefeningen</p>
              <div className="flex flex-col gap-2">
                {favoriteExercises.slice(0, 4).map((e) => (
                  <Link
                    key={e.id}
                    href={`/training/${e.workout_id}`}
                    className="flex items-center gap-2 text-sm text-ink hover:text-sage-dark rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
                  >
                    <Heart className="h-3.5 w-3.5 text-peach shrink-0" fill="currentColor" strokeWidth={0} />
                    <span className="truncate">{e.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
