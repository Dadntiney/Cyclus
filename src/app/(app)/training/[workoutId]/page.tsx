import { notFound } from "next/navigation"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { getWorkoutDetail, getFavoriteExerciseIds } from "@/lib/data/training"
import { WorkoutSession } from "@/components/training/workout-session"
import { BackButton } from "@/components/ui/back-button"

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId } = await params
  const user = await getAuthedUser()
  if (!user) return null

  const [{ workout, exercises }, favoriteExerciseIds, profile] = await Promise.all([
    getWorkoutDetail(workoutId),
    getFavoriteExerciseIds(user.id),
    getProfile(user.id),
  ])

  if (!workout) notFound()

  return (
    <div className="w-full max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      <BackButton href="/training" label="Beweging" />

      <WorkoutSession
        workout={workout}
        exercises={exercises}
        favoriteExerciseIds={[...favoriteExerciseIds]}
        name={profile?.name ?? null}
      />
    </div>
  )
}
