import Link from "next/link"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Check, Moon, Settings2 } from "lucide-react"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { getWorkoutLibrary, getWeekSessions } from "@/lib/data/training"
import { buildWeeklyProgram, type DayFocus } from "@/lib/recommendations/weekly-program"
import { pickTodaysWorkout } from "@/lib/recommendations/engine"
import { WorkoutLibrary } from "@/components/training/workout-library"
import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { TRAINING_PREFERENCE_TO_TYPE } from "@/lib/constants"
import { cn } from "@/lib/utils"

const FOCUS_LABELS: Record<DayFocus, string> = {
  kracht: "Kracht",
  cardio: "Cardio",
  mobiliteit: "Mobiliteit",
  herstel: "Herstel",
  rust: "Rustdag",
}

export default async function TrainingPage() {
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) return null

  const todayISO = format(new Date(), "yyyy-MM-dd")

  const [workouts, week, profile, { data: checkin }] = await Promise.all([
    getWorkoutLibrary(),
    getWeekSessions(user.id),
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

  const program = buildWeeklyProgram({
    frequency: profile?.training_frequency ?? 3,
    healthConditions: profile?.health_conditions ?? [],
    movementLimitations: profile?.movement_limitations ?? [],
    trainingPreferences: rawPreferences,
    workouts,
    seed: `${user.id}-weekprogram`,
  })

  // Today's slot in the week plan is replaced with the same, check-in-aware
  // pick Vandaag shows (same seed, so both pages agree) — the weekday
  // rotation can't know she has low energy or asked for rest today, but the
  // one live signal we have should win over a fixed schedule. A rest day
  // stays a rest day: this only steps in on days she already planned to move.
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
  const todayIndex = week.findIndex((d) => d.date === todayISO)

  return (
    <div className="w-full max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6 lg:gap-8">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Beweging</h1>
        <p className="text-sm text-ink-soft mt-1">Jouw weekplanning en trainingsbibliotheek.</p>
      </div>

      <div>
        <h2 className="font-display text-lg text-ink mb-3">Deze week</h2>
        <Card className="p-3">
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {week.map(({ date, sessions }) => {
              const done = sessions.some((s) => s.completed)
              return (
                <div key={date} className="flex flex-col items-center gap-1.5 py-2">
                  <span className="text-[11px] text-ink-soft capitalize">
                    {format(new Date(date), "EEEEEE", { locale: nl })}
                  </span>
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium",
                      done
                        ? "bg-sage-dark text-white"
                        : date === todayISO
                          ? "border border-sage text-sage-dark"
                          : "bg-cream-soft text-ink-soft",
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : format(new Date(date), "d")}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
        <div>
          <h2 className="font-display text-lg text-ink mb-3">Jouw weekprogramma</h2>
          <p className="text-sm text-ink-soft mb-3">
            Gebaseerd op {profile?.training_frequency ?? 3}x per week uit je profiel. Pas dit aan
            bij Profiel als dit niet meer klopt.
          </p>
          <div className="flex flex-col gap-2">
            {program.map((day, i) => {
              const isToday = i === todayIndex
              const workout = isToday && day.focus !== "rust" ? (todaysPick.workout ?? day.workout) : day.workout

              if (!workout) {
                return (
                  <Card key={day.weekday} className="p-3.5 bg-cream-soft border-transparent shadow-none">
                    <div className="flex items-center gap-2.5 text-ink-soft">
                      <Moon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      <div>
                        <p className="text-xs">{day.weekday}</p>
                        <p className="text-sm font-medium">{FOCUS_LABELS.rust}</p>
                      </div>
                    </div>
                  </Card>
                )
              }

              return (
                <Link
                  key={day.weekday}
                  href={`/training/${workout.id}`}
                  className="block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                >
                  <Card interactive className={cn("p-3.5", isToday && "bg-sage-soft border-transparent")}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className={cn("text-xs", isToday ? "text-sage-dark font-medium" : "text-ink-soft")}>
                          {isToday ? "Vandaag voor jou" : `${day.weekday} · ${FOCUS_LABELS[day.focus]}`}
                        </p>
                        <p className="font-medium text-ink text-sm mt-0.5">{workout.title}</p>
                        {isToday && (
                          <p className="text-xs text-ink-soft mt-1">{todaysPick.reason}</p>
                        )}
                      </div>
                      <span className="text-xs text-ink-soft shrink-0">{workout.duration} min</span>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="mt-6 lg:mt-0">
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
    </div>
  )
}
