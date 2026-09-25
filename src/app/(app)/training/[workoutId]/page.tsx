import { notFound } from "next/navigation"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { getWorkoutDetail, getFavoriteExerciseIds } from "@/lib/data/training"
import { WorkoutSession } from "@/components/training/workout-session"

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId } = await params
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) return null

  const [{ workout, exercises }, favoriteExerciseIds, { data: profile }] = await Promise.all([
    getWorkoutDetail(workoutId),
    getFavoriteExerciseIds(user.id),
    supabase.from("profiles").select("name").eq("id", user.id).single(),
  ])

  if (!workout) notFound()

  return (
    <div className="w-full max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      <WorkoutSession
        workout={workout}
        exercises={exercises}
        favoriteExerciseIds={[...favoriteExerciseIds]}
        name={profile?.name ?? null}
      />
    </div>
  )
}
