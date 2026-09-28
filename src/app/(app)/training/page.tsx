import Link from "next/link"
import { format } from "date-fns"
import { Settings2, Dumbbell, Heart } from "lucide-react"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { getWorkoutLibrary } from "@/lib/data/training"
import { getPersonalSleepContext } from "@/lib/data/sleep"
import { pickTodaysWorkout } from "@/lib/recommendations/engine"
import { WorkoutLibrary } from "@/components/training/workout-library"
import { WorkoutImage } from "@/components/training/workout-image"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { buttonVariants } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
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
        <BackButton href="/voor-jou" label="Voor jou" />
        <h1 className="font-display text-2xl lg:text-3xl text-ink mb-1">Beweging</h1>
        <p className="text-sm text-ink-soft mb-6">Jouw weekplanning en trainingsbibliotheek.</p>
        <Card>
          <EmptyState
            icon={<Dumbbell className="h-8 w-8" strokeWidth={1.5} />}
            title="Beweging staat nu uit"
            description="Je ziet hierdoor nergens trainingsadvies. Wil je dit toch weer gebruiken?"
            action={
              <Link href="/profiel#beweging" className={buttonVariants({ variant: "secondary" })}>
                Zet aan in mijn profiel
              </Link>
            }
          />
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

  // Same personal sleep/symptom pattern Vandaag uses, and same seed — so
  // this page never picks a different workout than Vandaag on a day the
  // pattern applies.
  const { todaySleepDurationMinutes, personalSleepPattern } =
    profile?.sleep_tracking_enabled === true
      ? await getPersonalSleepContext(user.id, todayISO)
      : { todaySleepDurationMinutes: null, personalSleepPattern: null }

  const todaysPick = pickTodaysWorkout({
    profile: {
      training_preferences: profile?.training_preferences ?? [],
      health_conditions: profile?.health_conditions ?? [],
      movement_limitations: profile?.movement_limitations ?? [],
    },
    latestCheckin: checkin ?? null,
    todaySleepDurationMinutes,
    personalSleepPattern,
    workouts,
    seed: `${user.id}-${todayISO}`,
  })

  return (
    <div className="w-full max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6 lg:gap-8">
      <div>
        <BackButton href="/voor-jou" label="Voor jou" />
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl text-ink">Beweging</h1>
            <p className="text-sm text-ink-soft mt-1">Jouw trainingsbibliotheek, afgestemd op jouw voorkeuren.</p>
          </div>
          <Link
            href="/training/favorieten"
            className="flex items-center gap-1.5 text-sm font-medium text-sage-dark"
          >
            <Heart className="h-4 w-4" />
            Favorieten
          </Link>
        </div>
      </div>

      {todaysPick.workout && (
        <Card className="bg-sage-soft border-transparent">
          <p className="text-sm font-medium text-sage-dark mb-1">Suggestie voor vandaag</p>
          <div className="flex items-start gap-3">
            <WorkoutImage
              type={todaysPick.workout.type}
              title={todaysPick.workout.title}
              imageUrl={todaysPick.workout.image_url}
              className="h-16 w-16 rounded-xl shrink-0"
              sizes="64px"
            />
            <div className="min-w-0">
              <p className="font-display text-xl text-ink">{todaysPick.workout.title}</p>
              <p className="text-sm text-ink-soft mt-0.5">{todaysPick.workout.duration} minuten</p>
              <p className="text-base text-ink-soft mt-2">{todaysPick.reason}</p>
              <Link href={`/training/${todaysPick.workout.id}`} className={cn(buttonVariants(), "mt-3")}>
                Start training
              </Link>
            </div>
          </div>
        </Card>
      )}

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
