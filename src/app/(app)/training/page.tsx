import Link from "next/link"
import { format } from "date-fns"
import { ChevronRight, Settings2 } from "lucide-react"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { getWorkoutLibrary } from "@/lib/data/training"
import { pickTodaysWorkout } from "@/lib/recommendations/engine"
import { WorkoutLibrary } from "@/components/training/workout-library"
import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { TRAINING_PREFERENCE_TO_TYPE } from "@/lib/constants"
import { cn } from "@/lib/utils"

export default async function TrainingPage() {
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) return null

  const todayISO = format(new Date(), "yyyy-MM-dd")

  const [workouts, profile, { data: checkin }] = await Promise.all([
    getWorkoutLibrary(),
    getProfile(user.id),
    supabase
      .from("daily_checkins")
      .select("energy, mood, sleep, stress, symptoms, need")
      .eq("user_id", user.id)
      .eq("date", todayISO)
      .maybeSingle(),
  ])

  if (profile && !profile.movement_enabled) {
    return (
      <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
        <h1 className="font-display text-2xl lg:text-3xl text-ink mb-1">Beweging</h1>
        <p className="text-sm text-ink-soft mb-6">Jouw weekplanning en trainingsbibliotheek.</p>
        <Card className="text-center py-8">
          <p className="text-3xl mb-3">🌿</p>
          <p className="font-display text-lg text-ink mb-2">Beweging staat nu uit</p>
          <p className="text-sm text-ink-soft mb-5 max-w-sm mx-auto">
            Je gaf aan dat beweging op dit moment niet relevant voor je is. Dat is helemaal prima —
            je ziet hierdoor nergens trainingsadvies. Wil je dit toch weer gebruiken?
          </p>
          <Link href="/profiel#beweging" className={buttonVariants()}>
            Zet aan in mijn profiel
          </Link>
        </Card>
      </div>
    )
  }

  const rawPreferences = profile?.training_preferences ?? []
  const preferredTypes = rawPreferences
    .map((p) => TRAINING_PREFERENCE_TO_TYPE[p])
    .filter((t): t is string => Boolean(t))
  const libraryWorkouts = rawPreferences.length
    ? workouts.filter((w) => preferredTypes.includes(w.type))
    : workouts

  const todaysPick = pickTodaysWorkout({
    profile: {
      training_preferences: profile?.training_preferences ?? [],
      health_conditions: profile?.health_conditions ?? [],
      movement_limitations: profile?.movement_limitations ?? [],
    },
    latestCheckin: checkin ?? null,
    workouts,
    seed: `${user.id}-${todayISO}`,
  })

  return (
    <div className="w-full max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6 lg:gap-8">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Beweging</h1>
        <p className="text-sm text-ink-soft mt-1">Jouw trainingsbibliotheek, afgestemd op jouw voorkeuren.</p>
      </div>

      {todaysPick.workout && (
        <Card className="bg-sage-soft border-transparent">
          <p className="text-sm font-medium text-sage-dark mb-1">Voor jou vandaag</p>
          <p className="font-display text-xl text-ink">{todaysPick.workout.title}</p>
          <p className="text-sm text-ink-soft mt-0.5">{todaysPick.workout.duration} minuten</p>
          <p className="text-base text-ink-soft mt-2">{todaysPick.reason}</p>
          <Link href={`/training/${todaysPick.workout.id}`} className={cn(buttonVariants(), "mt-3")}>
            Start training
          </Link>
        </Card>
      )}

      <Link
        href="/deze-week"
        className="flex items-center justify-between rounded-2xl bg-white border border-line/70 px-4 py-3.5 touch-manipulation"
      >
        <span className="text-sm font-medium text-ink">📆 Bekijk je weekplanning</span>
        <ChevronRight className="h-4 w-4 text-ink-soft" strokeWidth={1.75} />
      </Link>

      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-lg text-ink">
            {rawPreferences.length ? "Trainingen voor jou" : "Alle trainingen"}
          </h2>
          <Link
            href="/profiel#beweging"
            className="inline-flex items-center gap-1 text-xs font-medium text-sage-dark touch-manipulation"
          >
            <Settings2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Voorkeuren
          </Link>
        </div>
        {rawPreferences.length > 0 && (
          <p className="text-xs text-ink-soft mb-3">
            Gefilterd op basis van je gekozen bewegingsvormen ({rawPreferences.join(", ")}).
          </p>
        )}
        {libraryWorkouts.length ? (
          <WorkoutLibrary workouts={libraryWorkouts} />
        ) : (
          <Card>
            <p className="text-sm text-ink-soft">
              We hebben nog geen workouts voor de vorm(en) van bewegen die je koos. Pas je
              voorkeuren aan in je profiel, of laat het ons weten.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
