import { notFound } from "next/navigation"
import { getWorkoutDetail } from "@/lib/data/training"
import { WorkoutSession } from "@/components/training/workout-session"

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId } = await params
  const { workout, exercises } = await getWorkoutDetail(workoutId)

  if (!workout) notFound()

  return (
    <div className="max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      <WorkoutSession workout={workout} exercises={exercises} />
    </div>
  )
}
