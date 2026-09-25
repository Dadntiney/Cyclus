import { createClient } from "@/lib/supabase/server"
import { estimateCycle } from "@/lib/cycle/estimate"
import { computeCycleHistory, computeSymptomFrequency } from "@/lib/cycle/history"
import { Calendar } from "@/components/cycle/calendar"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { format, parseISO, subDays } from "date-fns"
import { nl } from "date-fns/locale"
import { Droplet, Sparkles } from "lucide-react"

export default async function CyclusPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const sixMonthsAgo = format(subDays(new Date(), 200), "yyyy-MM-dd")

  const [{ data: cycleProfile }, { data: logs }, { data: checkins }] = await Promise.all([
    supabase.from("cycle_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("cycle_logs")
      .select("date, menstruation, symptoms")
      .eq("user_id", user.id)
      .gte("date", sixMonthsAgo)
      .order("date", { ascending: true }),
    supabase
      .from("daily_checkins")
      .select("date, symptoms")
      .eq("user_id", user.id)
      .gte("date", sixMonthsAgo)
      .order("date", { ascending: false }),
  ])

  const cycleEstimate = cycleProfile
    ? estimateCycle(
        cycleProfile.last_period_start,
        cycleProfile.average_cycle_length,
        cycleProfile.has_cycle,
      )
    : null

  const menstruationDates = new Set(
    (logs ?? []).filter((l) => l.menstruation).map((l) => l.date),
  )

  const history = computeCycleHistory(
    (logs ?? []).map((l) => ({ date: l.date, menstruation: l.menstruation, symptoms: l.symptoms })),
  )
  const recentHistory = [...history].reverse().slice(0, 6)

  const patterns = computeSymptomFrequency(checkins ?? [])

  const hasCycle = cycleProfile?.has_cycle ?? true
  const isIrregular = cycleProfile?.regularity === "onregelmatig" || cycleProfile?.regularity === "onbekend"

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6 lg:gap-8">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Jouw cyclus</h1>
        <p className="text-sm text-ink-soft mt-1">
          Een overzicht van je cyclus, patronen en klachten.
        </p>
      </div>

      {hasCycle ? (
        <Card>
          {cycleEstimate ? (
            <>
              <p className="text-sm text-sage-dark font-medium mb-1">Vandaag</p>
              <p className="font-display text-2xl text-ink">
                Cyclusdag {cycleEstimate.cycleDay}
              </p>
              <p className="text-sm text-ink-soft mt-1">{cycleEstimate.phaseLabel} · schatting</p>
            </>
          ) : (
            <p className="text-sm text-ink-soft">
              We hebben nog niet genoeg gegevens om je huidige cyclusdag te schatten. Markeer
              je menstruatiedagen hieronder in de kalender.
            </p>
          )}
          <div className="flex gap-6 mt-4 pt-4 border-t border-line">
            <div>
              <p className="text-xs text-ink-soft">Gemiddelde cyclusduur</p>
              <p className="text-sm font-medium text-ink mt-0.5">
                {cycleProfile?.average_cycle_length
                  ? `${cycleProfile.average_cycle_length} dagen`
                  : "Onbekend"}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-soft">Regelmaat</p>
              <p className="text-sm font-medium text-ink mt-0.5 capitalize">
                {cycleProfile?.regularity ?? "Onbekend"}
              </p>
            </div>
          </div>
          {isIrregular && (
            <p className="text-xs text-ink-soft mt-4 bg-cream-soft rounded-xl px-3 py-2.5">
              Jouw cyclus is onregelmatig, dus fase-inschattingen zijn slechts een richting —
              geen exacte voorspelling. Dit is geen medisch advies.
            </p>
          )}
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-ink-soft">
            Je gaf aan momenteel geen menstruatiecyclus te hebben. Je kunt hieronder nog wel
            klachten en patronen bijhouden.
          </p>
        </Card>
      )}

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <Calendar menstruationDates={menstruationDates} />
          </Card>

          <div>
            <h2 className="font-display text-lg text-ink mb-3">Eerdere cycli</h2>
            {recentHistory.length ? (
              <Card className="p-0 divide-y divide-line">
                {recentHistory.map((period) => (
                  <div key={period.start} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {format(parseISO(period.start), "d MMM", { locale: nl })} –{" "}
                        {format(parseISO(period.end), "d MMM yyyy", { locale: nl })}
                      </p>
                      <p className="text-xs text-ink-soft mt-0.5">{period.days} dagen menstruatie</p>
                    </div>
                    {period.cycleLength && (
                      <p className="text-xs text-ink-soft">{period.cycleLength} dagen cyclus</p>
                    )}
                  </div>
                ))}
              </Card>
            ) : (
              <Card>
                <EmptyState
                  icon={<Droplet className="h-6 w-6" />}
                  title="Voeg je eerste cyclusdag toe."
                  description="Tik in de kalender hierboven op een dag om je menstruatie bij te houden."
                />
              </Card>
            )}
          </div>
        </div>

        <div className="mt-6 lg:mt-0">
          <h2 className="font-display text-lg text-ink mb-3">Persoonlijke patronen</h2>
          {patterns.length ? (
            <Card>
              <ul className="flex flex-col gap-2.5">
                {patterns.slice(0, 6).map(({ symptom, count }) => (
                  <li key={symptom} className="flex items-center justify-between text-sm">
                    <span className="text-ink">{symptom}</span>
                    <span className="text-ink-soft">
                      {count}x in je check-ins
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-ink-soft mt-4">
                Gebaseerd op de klachten die je bij je dagelijkse check-ins hebt aangevinkt.
              </p>
            </Card>
          ) : (
            <Card>
              <EmptyState
                icon={<Sparkles className="h-6 w-6" />}
                title="Nog geen patronen zichtbaar."
                description="Vul een paar dagelijkse check-ins in op Vandaag om je persoonlijke patronen te zien."
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
