import Link from "next/link"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { estimateCycle } from "@/lib/cycle/estimate"
import { computeCycleHistory, computeSymptomFrequency, getEffectiveLastPeriodStart } from "@/lib/cycle/history"
import { computePhaseSymptomInsights, formatPhaseSymptomInsight } from "@/lib/cycle/patterns"
import { phaseLabel } from "@/lib/cycle/estimate"
import { Calendar } from "@/components/cycle/calendar"
import { PhaseOverview } from "@/components/cycle/phase-overview"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { format, parseISO, subDays } from "date-fns"
import { nl } from "date-fns/locale"
import { Droplet, Sparkles, ChevronRight } from "lucide-react"
import { FLOW_OPTIONS } from "@/lib/constants"

export default async function CyclusPage() {
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) return null

  const sixMonthsAgo = format(subDays(new Date(), 200), "yyyy-MM-dd")

  const [profile, { data: cycleProfile }, { data: logs }, { data: checkins }] = await Promise.all([
    getProfile(user.id),
    supabase.from("cycle_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("cycle_logs")
      .select("date, menstruation, symptoms, flow")
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

  const trackFlowEnabled = profile?.track_flow_intensity ?? false

  const menstruationDates = new Set(
    (logs ?? []).filter((l) => l.menstruation).map((l) => l.date),
  )
  const flowByDate = new Map((logs ?? []).filter((l) => l.menstruation).map((l) => [l.date, l.flow]))

  const history = computeCycleHistory(
    (logs ?? []).map((l) => ({
      date: l.date,
      menstruation: l.menstruation,
      symptoms: l.symptoms,
      flow: l.flow,
    })),
  )
  const recentHistory = [...history].reverse().slice(0, 6)

  const cycleEstimate = cycleProfile
    ? estimateCycle(
        getEffectiveLastPeriodStart(cycleProfile.last_period_start, history),
        cycleProfile.average_cycle_length,
        cycleProfile.has_cycle,
      )
    : null

  const patterns = computeSymptomFrequency(checkins ?? [])
  const phaseInsights = computePhaseSymptomInsights(history, checkins ?? []).slice(0, 3)

  const hasCycle = cycleProfile?.has_cycle ?? true
  const isIrregular = cycleProfile?.regularity === "onregelmatig" || cycleProfile?.regularity === "onbekend"
  const lifeStageLikelyRelevant =
    (profile?.age ?? 0) >= 40 || isIrregular || Boolean(cycleProfile?.perimenopause_information)

  return (
    <div className="w-full max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6 lg:gap-8">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Mijn cyclus</h1>
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
              <p className="text-base text-ink-soft mt-1">{cycleEstimate.phaseLabel} · schatting</p>
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
          {cycleEstimate && (
            <Link
              href="/cyclus/vandaag"
              className="mt-4 pt-4 border-t border-line flex items-center justify-between touch-manipulation"
            >
              <span className="text-sm font-medium text-sage-dark">Wat betekent dit voor jou?</span>
              <ChevronRight className="h-4 w-4 text-sage-dark" strokeWidth={1.75} />
            </Link>
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

      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-lg text-ink">Cyclusfases</h2>
          <Link
            href="/deze-week"
            className="inline-flex items-center gap-0.5 text-xs font-medium text-sage-dark touch-manipulation"
          >
            Deze week
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>
        <PhaseOverview currentPhase={cycleEstimate?.phase ?? null} />
      </div>

      <Link
        href="/cyclus/overgang"
        className="flex items-center justify-between rounded-2xl bg-info-soft border border-transparent px-4 py-3.5 touch-manipulation"
      >
        <span className="min-w-0">
          <span className="block text-sm font-medium text-ink">🌤️ Cyclus & ouder worden</span>
          <span className="block text-xs text-ink-soft mt-0.5">
            {lifeStageLikelyRelevant
              ? "Herkenbaar voor jou? Lees hoe je cyclus kan veranderen."
              : "Hoe je cyclus kan veranderen naarmate je ouder wordt."}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} />
      </Link>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <Calendar
              menstruationDates={menstruationDates}
              flowByDate={flowByDate}
              trackFlowEnabled={trackFlowEnabled}
            />
          </Card>

          <div>
            <h2 className="font-display text-lg text-ink mb-3">Eerdere cycli</h2>
            {recentHistory.length ? (
              <Card className="p-0 divide-y divide-line">
                {recentHistory.map((period) => {
                  const flowOption = FLOW_OPTIONS.find((f) => f.value === period.dominantFlow)
                  return (
                    <div key={period.start} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {format(parseISO(period.start), "d MMM", { locale: nl })} –{" "}
                          {format(parseISO(period.end), "d MMM yyyy", { locale: nl })}
                        </p>
                        <p className="text-xs text-ink-soft mt-0.5">
                          {period.days} dagen menstruatie
                          {trackFlowEnabled && flowOption && ` · ${flowOption.label.toLowerCase()}`}
                        </p>
                      </div>
                      {period.cycleLength && (
                        <p className="text-xs text-ink-soft">{period.cycleLength} dagen cyclus</p>
                      )}
                    </div>
                  )
                })}
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

        <div className="mt-6 lg:mt-0 flex flex-col gap-6">
          {phaseInsights.length > 0 && (
            <div>
              <h2 className="font-display text-lg text-ink mb-3">Wat je cycli laten zien</h2>
              <Card>
                <ul className="flex flex-col gap-3">
                  {phaseInsights.map((insight) => (
                    <li key={`${insight.phase}-${insight.symptom}`} className="text-base text-ink-soft leading-relaxed">
                      {formatPhaseSymptomInsight(insight, phaseLabel(insight.phase))}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-ink-soft mt-4">
                  Gebaseerd op je afgeronde cycli en je check-ins — geen voorspelling, wel een
                  richting die bij jou lijkt te passen.
                </p>
              </Card>
            </div>
          )}

          <div>
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
    </div>
  )
}
