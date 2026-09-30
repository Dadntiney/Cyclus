import Link from "next/link"
import { Heart } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getFavoriteExercises } from "@/lib/data/training"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { BackButton } from "@/components/ui/back-button"

export default async function TrainingFavorietenPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const exercises = await getFavoriteExercises(user.id)

  return (
    <div className="w-full max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6">
      <div>
        <BackButton href="/training" label="Beweging" />
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Favoriete oefeningen</h1>
        <p className="text-sm text-ink-soft mt-1">Jouw opgeslagen oefeningen.</p>
      </div>

      {exercises.length ? (
        <Card className="p-0 divide-y divide-sage/20">
          {exercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/training/${exercise.workout_id}`}
              className="flex items-center gap-2 px-4 py-3 touch-manipulation hover:bg-sage-soft/70 transition-colors"
            >
              <Heart className="h-3.5 w-3.5 text-peach shrink-0" fill="currentColor" strokeWidth={0} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{exercise.name}</p>
                {exercise.muscle_group && (
                  <p className="text-xs text-ink-soft mt-0.5">{exercise.muscle_group}</p>
                )}
              </div>
            </Link>
          ))}
        </Card>
      ) : (
        <EmptyState
          icon={<Heart className="h-6 w-6" />}
          title="Je hebt nog geen oefeningen opgeslagen."
          description="Tik op het hartje bij een oefening die bij je past om het hier terug te vinden."
        />
      )}
    </div>
  )
}
