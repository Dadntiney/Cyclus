import Link from "next/link"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Check, Moon } from "lucide-react"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { getWorkoutLibrary, getWeekSessions } from "@/lib/data/training"
import { buildWeeklyProgram, type DayFocus } from "@/lib/recommendations/weekly-program"
import { pickTodaysWorkout } from "@/lib/recommendations/engine"
import { WorkoutLibrary } from "@/components/training/workout-library"
import { Card } from "@/components/ui/card"
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

  const [workouts, week, { data: profile }, { data: checkin }] = await Promise.all([
    getWorkoutLibrary(),
    getWeekSessions(user.id),
    supabase
      .from("profiles")
      .select("training_frequency, health_conditions, movement_limitations, training_preferences")
      .eq("id", user.id)
      .single(),
    supabase
      .from("daily_checkins")
      .select("energy, mood, sleep, stress, symptoms, need")
      .eq("user_id", user.id)
      .eq("date", todayISO)
      .maybeSingle(),
  ])

  const program = buildWeeklyProgram({
    frequency: profile?.training_frequency ?? 3,
    healthConditions: profile?.health_conditions ?? [],
    movementLimitations: profile?.movement_limitations ?? [],
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
          <h2 className="font-display text-lg text-ink mb-3">Alle workouts</h2>
          <WorkoutLibrary workouts={workouts} />
        </div>
      </div>
    </div>
  )
}
