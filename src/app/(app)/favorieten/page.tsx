import type { Metadata } from "next"
import { getAuthedUser } from "@/lib/supabase/server"
import { getFavoriteRecipes } from "@/lib/data/nutrition"
import { getFavoriteExercises } from "@/lib/data/training"
import { getSavedMoments, savedMomentKindLabel } from "@/lib/data/moments"
import { FEATURES } from "@/lib/navigation/features"
import { muscleGroupLabel } from "@/components/training/workout-format"
import { Page } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { FavoritesView, type FavoriteExerciseItem, type FavoriteMomentItem, type FavoriteRecipeItem } from "./favorites-view"

export const metadata: Metadata = { title: FEATURES.favorieten.label }

/**
 * The one Favorieten page (ontwerpvisie §4.5, §7.7): everything she saved —
 * recipes, exercises and moments (tips, quotes, affirmations) — loaded
 * once. The filter (Alles · Recepten · Beweging · Momenten) runs on the
 * client and keeps `?soort=` in the URL, so /voeding/favorieten and
 * /training/favorieten (redirects in next.config.ts) land on the right one.
 */
export default async function FavorietenPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const [recipes, exercises, moments] = await Promise.all([
    getFavoriteRecipes(user.id),
    getFavoriteExercises(user.id),
    getSavedMoments(user.id),
  ])

  const recipeItems: FavoriteRecipeItem[] = recipes.map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    imageUrl: recipe.image_url,
    meta: [recipe.preparation_time ? `${recipe.preparation_time} min` : null, recipe.category[0] ?? null]
      .filter(Boolean)
      .join(" · "),
  }))

  const exerciseItems: FavoriteExerciseItem[] = exercises.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    meta: muscleGroupLabel(exercise.muscle_group),
    href: `/training/${exercise.workout_id}`,
  }))

  const momentItems: FavoriteMomentItem[] = moments.map((moment) => ({
    id: moment.id,
    kind: moment.kind,
    kindLabel: savedMomentKindLabel(moment.kind),
    text: moment.text,
    source: moment.source ?? undefined,
    sourceKey: moment.sourceKey ?? undefined,
  }))

  return (
    <Page>
      <PageHeader title={FEATURES.favorieten.label} subtitle="Wat je hebt bewaard om op terug te komen." />
      <FavoritesView recipes={recipeItems} exercises={exerciseItems} moments={momentItems} />
    </Page>
  )
}
