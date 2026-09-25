import Link from "next/link"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Check, Moon } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getWorkoutLibrary, getWeekSessions } from "@/lib/data/training"
import { buildWeeklyProgram, type DayFocus } from "@/lib/recommendations/weekly-program"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const DIFFICULTY_LABELS: Record<string, string> = {
  makkelijk: "Makkelijk",
  gemiddeld: "Gemiddeld",
  pittig: "Pittig",
}

const FOCUS_LABELS: Record<DayFocus, string> = {
  kracht: "Kracht",
  cardio: "Cardio",
  mobiliteit: "Mobiliteit",
  herstel: "Herstel",
  rust: "Rustdag",
}

export default async function TrainingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [workouts, week, { data: profile }] = await Promise.all([
    getWorkoutLibrary(),
    getWeekSessions(user.id),
    supabase
      .from("profiles")
      .select("training_frequency, health_conditions, movement_limitations")
      .eq("id", user.id)
      .single(),
  ])
  const todayISO = format(new Date(), "yyyy-MM-dd")

  const program = buildWeeklyProgram({
    frequency: profile?.training_frequency ?? 3,
    healthConditions: profile?.health_conditions ?? [],
    movementLimitations: profile?.movement_limitations ?? [],
    workouts,
    seed: `${user.id}-weekprogram`,
  })

  return (
    <div className="w-full max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6 lg:gap-8">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Training</h1>
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
            {program.map(({ weekday, focus, workout }) =>
              workout ? (
                <Link
                  key={weekday}
                  href={`/training/${workout.id}`}
                  className="block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                >
                  <Card interactive className="p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-ink-soft">
                          {weekday} · {FOCUS_LABELS[focus]}
                        </p>
                        <p className="font-medium text-ink text-sm mt-0.5">{workout.title}</p>
                      </div>
                      <span className="text-xs text-ink-soft shrink-0">{workout.duration} min</span>
                    </div>
                  </Card>
                </Link>
              ) : (
                <Card key={weekday} className="p-3.5 bg-cream-soft border-transparent shadow-none">
                  <div className="flex items-center gap-2.5 text-ink-soft">
                    <Moon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    <div>
                      <p className="text-xs">{weekday}</p>
                      <p className="text-sm font-medium">{FOCUS_LABELS.rust}</p>
                    </div>
                  </div>
                </Card>
              ),
            )}
          </div>
        </div>

        <div className="mt-6 lg:mt-0">
          <h2 className="font-display text-lg text-ink mb-3">Bibliotheek</h2>
          <div className="flex flex-col gap-2">
            {workouts.map((workout) => (
              <Link
                key={workout.id}
                href={`/training/${workout.id}`}
                className="block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                <Card interactive className="p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-ink-soft">
                        {DIFFICULTY_LABELS[workout.difficulty] ?? workout.difficulty}
                      </p>
                      <p className="font-medium text-ink text-sm mt-0.5">{workout.title}</p>
                    </div>
                    <span className="text-xs text-ink-soft shrink-0">{workout.duration} min</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
