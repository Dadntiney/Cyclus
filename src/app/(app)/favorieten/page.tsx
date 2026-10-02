import Link from "next/link"
import { Heart, Salad, Dumbbell, ChevronRight, ChefHat, Sparkles } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getFavoriteRecipes } from "@/lib/data/nutrition"
import { getFavoriteExercises } from "@/lib/data/training"
import { getSavedMoments, savedMomentKindLabel } from "@/lib/data/moments"
import { RecipeImage } from "@/components/nutrition/recipe-image"
import { MomentFavoriteButton } from "@/components/moments/moment-favorite-button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { BackButton } from "@/components/ui/back-button"

/**
 * Unified favorites hub — compact rows (same density as Vandaag / Week),
 * not full RecipeCards. Includes hearted tips / quotes / affirmations.
 */
export default async function FavorietenPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const [recipes, exercises, moments] = await Promise.all([
    getFavoriteRecipes(user.id),
    getFavoriteExercises(user.id),
    getSavedMoments(user.id),
  ])

  const isEmpty = recipes.length === 0 && exercises.length === 0 && moments.length === 0

  return (
    <div className="w-full max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6 lg:gap-8">
      <div>
        <BackButton href="/ontdek" label="Ontdek" />
        <h1 className="font-display text-3xl lg:text-4xl text-ink flex items-center gap-2">
          <Heart className="h-6 w-6 text-peach" fill="currentColor" strokeWidth={0} aria-hidden />
          Favorieten
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          Recepten, oefeningen en momenten die je wilt onthouden.
        </p>
      </div>

      {isEmpty ? (
        <EmptyState
          icon={<Heart className="h-6 w-6" strokeWidth={1.5} />}
          title="Nog geen favorieten"
          description="Tik op het hartje bij een recept, oefening, tip of affirmatie — dan vind je ze hier terug."
        />
      ) : (
        <>
          {moments.length > 0 && (
            <section>
              <h2 className="font-display text-xl text-ink inline-flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-sage-dark" strokeWidth={1.75} aria-hidden />
                Bewaarde momenten
              </h2>
              <Card className="p-0 divide-y divide-line">
                {moments.slice(0, 12).map((moment) => (
                  <div key={moment.id} className="flex items-start gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-sage-dark mb-0.5">
                        {savedMomentKindLabel(moment.kind)}
                      </p>
                      <p className="text-sm text-ink leading-relaxed">{moment.text}</p>
                    </div>
                    <MomentFavoriteButton
                      kind={moment.kind}
                      text={moment.text}
                      source={moment.source ?? undefined}
                      sourceKey={moment.sourceKey ?? undefined}
                      initialFavorited
                      size="sm"
                    />
                  </div>
                ))}
              </Card>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="font-display text-xl text-ink inline-flex items-center gap-2">
                <Salad className="h-4 w-4 text-sage-dark" strokeWidth={1.75} aria-hidden />
                Recepten
              </h2>
              {recipes.length > 0 && (
                <Link
                  href="/voeding/favorieten"
                  className="text-xs font-medium text-sage-dark inline-flex items-center gap-0.5 min-h-11 touch-manipulation"
                >
                  Alles
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              )}
            </div>
            {recipes.length ? (
              <Card className="p-0 divide-y divide-line">
                {recipes.slice(0, 6).map((recipe) => (
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
              <p className="text-sm text-ink-soft px-1">
                Nog geen favoriete recepten. Bewaar er een via Voeding.
              </p>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="font-display text-xl text-ink inline-flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-sage-dark" strokeWidth={1.75} aria-hidden />
                Oefeningen
              </h2>
              {exercises.length > 0 && (
                <Link
                  href="/training/favorieten"
                  className="text-xs font-medium text-sage-dark inline-flex items-center gap-0.5 min-h-11 touch-manipulation"
                >
                  Alles
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              )}
            </div>
            {exercises.length ? (
              <Card className="p-0 divide-y divide-line">
                {exercises.slice(0, 8).map((exercise) => (
                  <Link
                    key={exercise.id}
                    href={`/training/${exercise.workout_id}`}
                    className="flex items-center gap-3 px-4 py-3 touch-manipulation hover:bg-sage-soft/70 transition-colors"
                  >
                    <Heart
                      className="h-3.5 w-3.5 text-peach shrink-0"
                      fill="currentColor"
                      strokeWidth={0}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink truncate">{exercise.name}</p>
                      {exercise.muscle_group && (
                        <p className="text-xs text-ink-soft mt-0.5">{exercise.muscle_group}</p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} aria-hidden />
                  </Link>
                ))}
              </Card>
            ) : (
              <p className="text-sm text-ink-soft px-1">
                Nog geen favoriete oefeningen. Bewaar er een tijdens een workout.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  )
}
