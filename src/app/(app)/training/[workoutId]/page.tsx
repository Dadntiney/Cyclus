import type { Metadata } from "next"
import { cache } from "react"
import { notFound } from "next/navigation"
import { after } from "next/server"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { getWorkoutDetail, getFavoriteExerciseIds } from "@/lib/data/training"
import { ensureWorkoutImage } from "@/lib/images/ensure-workout-image"
import { NOT_FOUND_TITLE } from "@/lib/navigation/features"
import { SHOW_WORKOUT_PHOTOS } from "@/components/training/workout-image"
import { WorkoutSession } from "@/components/training/workout-session"
import { workoutDisplayTitle } from "@/components/training/workout-format"
import { Page } from "@/components/layout/page"

// One query per request, shared by the title and the page.
const loadWorkout = cache((workoutId: string) => getWorkoutDetail(workoutId))

export async function generateMetadata({ params }: { params: Promise<{ workoutId: string }> }): Promise<Metadata> {
  const { workoutId } = await params
  const { workout } = await loadWorkout(workoutId)
  return { title: workout ? workoutDisplayTitle(workout.title) : NOT_FOUND_TITLE }
}

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId } = await params
  const user = await getAuthedUser()
  if (!user) return null

  const [{ workout, exercises }, favoriteExerciseIds, profile] = await Promise.all([
    loadWorkout(workoutId),
    getFavoriteExerciseIds(user.id),
    getProfile(user.id),
  ])

  if (!workout) notFound()

  // Same pattern as the recipe detail page: never block this render on
  // fetching a photo, just warm the cache in the background for next time.
  if (SHOW_WORKOUT_PHOTOS && !workout.image_url) {
    after(() => {
      void ensureWorkoutImage(workout)
    })
  }

  return (
    // The intro, the session and its StickyActionBar are direct children
    // of Page, so the action bar can stick for the whole screen.
    <Page>
      <WorkoutSession
        workout={workout}
        exercises={exercises}
        favoriteExerciseIds={[...favoriteExerciseIds]}
        name={profile?.name ?? null}
      />
    </Page>
  )
}
