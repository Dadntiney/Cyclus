import Link from "next/link"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Check } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getWorkoutLibrary, getWeekSessions } from "@/lib/data/training"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const DIFFICULTY_LABELS: Record<string, string> = {
  makkelijk: "Makkelijk",
  gemiddeld: "Gemiddeld",
  pittig: "Pittig",
}

export default async function TrainingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [workouts, week] = await Promise.all([getWorkoutLibrary(), getWeekSessions(user.id)])
  const todayISO = format(new Date(), "yyyy-MM-dd")

  return (
    <div className="max-w-2xl mx-auto px-5 py-6 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Training</h1>
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
                        ? "bg-sage text-white"
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

      <div>
        <h2 className="font-display text-lg text-ink mb-3">Bibliotheek</h2>
        <div className="flex flex-col gap-3">
          {workouts.map((workout) => (
            <Link key={workout.id} href={`/training/${workout.id}`}>
              <Card className="hover:border-sage/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-lg text-ink">{workout.title}</p>
                    <p className="text-sm text-ink-soft mt-0.5">
                      {workout.duration} minuten · {DIFFICULTY_LABELS[workout.difficulty] ?? workout.difficulty}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
