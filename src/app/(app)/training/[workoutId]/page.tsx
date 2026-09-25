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
    <div className="max-w-2xl mx-auto px-5 py-6">
      <WorkoutSession workout={workout} exercises={exercises} />
    </div>
  )
}
