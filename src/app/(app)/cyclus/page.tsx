import Link from "next/link"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { estimateCycle } from "@/lib/cycle/estimate"
import {
  computeCycleHistory,
  computeSymptomFrequency,
  getEffectiveLastPeriodStart,
  withActivePeriod,
} from "@/lib/cycle/history"
import {
  computePhaseSymptomInsights,
  formatPhaseSymptomInsight,
  computeCycleLengthTrend,
  formatCycleLengthTrendInsight,
} from "@/lib/cycle/patterns"
import { computePersonalInsights } from "@/lib/cycle/insights"
import { estimateNextPeriod, formatNextPeriodEstimate } from "@/lib/cycle/next-period"
import { computeCycleDeviationAlerts } from "@/lib/cycle/deviation"
import { computeMonthChangeInsights } from "@/lib/cycle/month-change"
import { phaseLabel } from "@/lib/cycle/estimate"
import { Calendar } from "@/components/cycle/calendar"
import { PhaseOverview } from "@/components/cycle/phase-overview"
import { PersonalInsights } from "@/components/cycle/personal-insights"
import { CycleLengthSparkline, SimpleBars } from "@/components/cycle/simple-bars"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { format, parseISO, subDays } from "date-fns"
import { nl } from "date-fns/locale"
import { Droplet, Sparkles, ChevronRight, Sunset, Activity, ClipboardList } from "lucide-react"
import { FLOW_OPTIONS, LIFE_STAGE_OPTIONS } from "@/lib/constants"

export default async function CyclusPage() {
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) return null

  const sixMonthsAgo = format(subDays(new Date(), 200), "yyyy-MM-dd")

  const [profile, { data: cycleProfile }, { data: logs }, { data: checkins }, { data: periRows }] =
    await Promise.all([
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
        .select("date, energy, mood, sleep, stress, symptoms")
        .eq("user_id", user.id)
        .gte("date", sixMonthsAgo)
        .order("date", { ascending: false }),
      supabase
        .from("peri_assessments")
        .select("assessed_on, score")
        .eq("user_id", user.id)
        .order("assessed_on", { ascending: false })
        .limit(1),
    ])
  const periLatest = periRows?.[0] ?? null

  const trackFlowEnabled = profile?.track_flow_intensity ?? false
  const today = format(new Date(), "yyyy-MM-dd")
  const lifeStage = cycleProfile?.life_stage ?? null
  const lifeStageLabel = LIFE_STAGE_OPTIONS.find((o) => o.value === lifeStage)?.label
  const postCycleMode = lifeStage === "menopauze" || cycleProfile?.has_cycle === false
  const overgangMode =
    lifeStage === "perimenopauze" || lifeStage === "veranderend" || lifeStage === "menopauze"

  const insightCheckins = (checkins ?? []).map((c) => ({
    date: c.date,
    energy: c.energy,
    mood: c.mood,
    sleep: c.sleep,
    stress: c.stress,
    symptoms: c.symptoms ?? [],
  }))
  const personalInsights = computePersonalInsights(
    insightCheckins,
    cycleProfile
      ? {
          has_cycle: cycleProfile.has_cycle,
          last_period_start: cycleProfile.last_period_start,
          average_cycle_length: cycleProfile.average_cycle_length,
        }
      : null,
  )

  const effectiveLogs = withActivePeriod(
    (logs ?? []).map((l) => ({
      date: l.date,
      menstruation: l.menstruation,
      symptoms: l.symptoms,
      flow: l.flow,
    })),
    cycleProfile?.active_period_start ?? null,
    today,
  )

  const menstruationDates = new Set(effectiveLogs.filter((l) => l.menstruation).map((l) => l.date))
  const flowByDate = new Map(effectiveLogs.filter((l) => l.menstruation).map((l) => [l.date, l.flow ?? null]))

  const history = computeCycleHistory(effectiveLogs)
  const recentHistory = [...history].reverse().slice(0, 6)
  const completedLengths = history
    .filter((p): p is (typeof history)[number] & { cycleLength: number } => p.cycleLength !== null)
    .slice(-6)
    .map((p) => p.cycleLength)

  const effectiveLastStart = cycleProfile
    ? getEffectiveLastPeriodStart(cycleProfile.last_period_start, history)
    : null

  const cycleEstimate =
    cycleProfile && !postCycleMode
      ? estimateCycle(effectiveLastStart, cycleProfile.average_cycle_length, cycleProfile.has_cycle)
      : null

  const nextPeriod =
    cycleProfile && !postCycleMode
      ? estimateNextPeriod({
          lastPeriodStart: effectiveLastStart,
          averageCycleLength: cycleProfile.average_cycle_length,
          hasCycle: cycleProfile.has_cycle,
          regularity: cycleProfile.regularity,
          lifeStage,
          history,
        })
      : null

  const checkinsForPatterns = (checkins ?? []).map((c) => ({
    date: c.date,
    symptoms: c.symptoms ?? [],
  }))
  const patterns = computeSymptomFrequency(checkinsForPatterns)
  const phaseInsights = computePhaseSymptomInsights(history, checkinsForPatterns).slice(0, 3)
  const cycleLengthTrend = computeCycleLengthTrend(history)
  const deviationAlerts = computeCycleDeviationAlerts({
    history,
    lengthTrend: cycleLengthTrend,
    lifeStage,
    age: profile?.age ?? null,
  })
  const monthChanges = computeMonthChangeInsights(insightCheckins)

  const shownPhaseSymptoms = new Set(phaseInsights.map((i) => `${i.phase}:${i.symptom}`))
  const dedupedPersonalInsights = personalInsights.filter(
    (insight) => !(insight.phase && insight.symptom && shownPhaseSymptoms.has(`${insight.phase}:${insight.symptom}`)),
  )

  const hasCycle = cycleProfile?.has_cycle ?? true
  const isIrregular = cycleProfile?.regularity === "onregelmatig" || cycleProfile?.regularity === "onbekend"
  const lifeStageLikelyRelevant =
    overgangMode ||
    (profile?.age ?? 0) >= 40 ||
    isIrregular ||
    Boolean(cycleProfile?.perimenopause_information)

  return (
    <div className="w-full max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6 lg:gap-8">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl text-ink">
          {postCycleMode ? "Mijn lichaam & klachten" : overgangMode ? "Mijn cyclus & overgang" : "Mijn cyclus"}
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          {postCycleMode
            ? "Focus op klachten, slaap, energie en wat jij wilt bespreken met een zorgverlener."
            : "Een overzicht van je cyclus, patronen en klachten."}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
          <Link href="/cyclus/samenvatting" className="text-sage-dark font-medium underline touch-manipulation">
            Samenvatting voor je arts
          </Link>
          <Link href="/cyclus/klachtenlast" className="text-sage-dark font-medium underline touch-manipulation">
            Klachtenlast-score
          </Link>
          {lifeStageLabel && (
            <Link href="/profiel#cyclus" className="text-ink-soft touch-manipulation">
              Levensfase: {lifeStageLabel}
            </Link>
          )}
        </div>
      </div>

      {!lifeStage && (
        <Card className="bg-cream-soft border-transparent">
          <p className="text-sm font-medium text-ink mb-1">Welke fase past bij jou?</p>
          <p className="text-sm text-ink-soft mb-3">
            Stel in of je cyclus regelmatig is, verandert, of dat je in de overgang zit. De app past
            de uitleg daarop aan — geen diagnose.
          </p>
          <Link href="/profiel#cyclus" className="text-sm font-medium text-sage-dark underline">
            Levensfase kiezen in profiel
          </Link>
        </Card>
      )}

      {postCycleMode ? (
        <Card>
          <p className="text-sm text-sage-dark font-medium mb-1">Zonder menstruatiekalender</p>
          <p className="font-display text-xl text-ink mb-2">Jouw klachten staan centraal</p>
          <p className="text-sm text-ink-soft leading-relaxed">
            Je kunt check-ins, slaap, medicatie/HT en de klachtenlast-score blijven gebruiken. De
            fasekalender staat uit zolang menstruatie niet relevant is.
          </p>
          {periLatest?.score != null && (
            <p className="text-sm text-ink mt-3">
              Laatste klachtenlast: <span className="font-medium">{periLatest.score}/100</span> (
              {periLatest.assessed_on})
            </p>
          )}
        </Card>
      ) : hasCycle ? (
        <Card>
          {cycleEstimate ? (
            <>
              <p className="text-sm text-sage-dark font-medium mb-1">Vandaag</p>
              <p className="font-display text-2xl text-ink">Cyclusdag {cycleEstimate.cycleDay}</p>
              <p className="text-base text-ink-soft mt-1">{cycleEstimate.phaseLabel} · schatting</p>
            </>
          ) : (
            <p className="text-sm text-ink-soft">
              We hebben nog niet genoeg gegevens om je huidige cyclusdag te schatten. Markeer je
              menstruatiedagen hieronder in de kalender.
            </p>
          )}

          {nextPeriod && (
            <div className="mt-4 rounded-xl bg-cream-soft px-3 py-2.5">
              <p className="text-sm font-medium text-ink">Volgende menstruatie (schatting)</p>
              <p className="text-sm text-ink-soft mt-1 leading-relaxed">
                {formatNextPeriodEstimate(nextPeriod)}
              </p>
              <p className="text-xs text-ink-soft mt-1.5">
                Venster {format(parseISO(nextPeriod.windowStart), "d MMM", { locale: nl })} –{" "}
                {format(parseISO(nextPeriod.windowEnd), "d MMM", { locale: nl })}
                {nextPeriod.isIrregularFriendly
                  ? " · ruimere band omdat je cyclus wisselt"
                  : ""}
              </p>
            </div>
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
          {(isIrregular || nextPeriod?.isIrregularFriendly) && (
            <p className="text-xs text-ink-soft mt-4 bg-cream-soft rounded-xl px-3 py-2.5">
              Jouw cyclus wisselt of is onregelmatig, dus schattingen zijn een richting — geen exacte
              voorspelling. Dit is geen medisch advies.
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
            Je gaf aan momenteel geen menstruatiecyclus te hebben. Je kunt hieronder nog wel klachten
            en patronen bijhouden.
          </p>
        </Card>
      )}

      {deviationAlerts.length > 0 && (
        <div>
          <h2 className="font-display text-lg text-ink mb-3">Je cyclus verandert</h2>
          <div className="flex flex-col gap-3">
            {deviationAlerts.map((alert) => (
              <Card
                key={alert.kind}
                className={alert.severity === "attention" ? "border-peach/40 bg-peach/10" : undefined}
              >
                <div className="flex gap-2.5">
                  <Activity className="h-4 w-4 text-ink-soft shrink-0 mt-0.5" strokeWidth={1.75} />
                  <div>
                    <p className="text-sm font-medium text-ink">{alert.title}</p>
                    <p className="text-sm text-ink-soft mt-1 leading-relaxed">{alert.body}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {monthChanges.length > 0 && (
        <div>
          <h2 className="font-display text-lg text-ink mb-3">Wat veranderde deze maand?</h2>
          <Card>
            <ul className="flex flex-col gap-3">
              {monthChanges.map((change) => (
                <li key={change.title}>
                  <p className="text-sm font-medium text-ink">{change.title}</p>
                  <p className="text-sm text-ink-soft mt-0.5 leading-relaxed">{change.body}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {!postCycleMode && (
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
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          href="/cyclus/overgang"
          className="flex items-center justify-between rounded-2xl bg-info-soft border border-transparent px-4 py-3.5 touch-manipulation"
        >
          <span className="min-w-0">
            <span className="block text-sm font-medium text-ink inline-flex items-center gap-1.5">
              <Sunset className="h-4 w-4 text-info" strokeWidth={1.75} />
              Cyclus & ouder worden
            </span>
            <span className="block text-xs text-ink-soft mt-0.5">
              {lifeStageLikelyRelevant
                ? "Herkenbaar voor jou? Lees hoe je cyclus kan veranderen."
                : "Hoe je cyclus kan veranderen naarmate je ouder wordt."}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} />
        </Link>
        <Link
          href="/cyclus/klachtenlast"
          className="flex items-center justify-between rounded-2xl bg-sage-soft border border-transparent px-4 py-3.5 touch-manipulation"
        >
          <span className="min-w-0">
            <span className="block text-sm font-medium text-ink inline-flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-sage-dark" strokeWidth={1.75} />
              Klachtenlast-score
            </span>
            <span className="block text-xs text-ink-soft mt-0.5">
              {periLatest?.score != null
                ? `Laatste score: ${periLatest.score}/100`
                : "Maandelijkse check voor jezelf of je arts."}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} />
        </Link>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {!postCycleMode && (
            <Card>
              <Calendar
                menstruationDates={menstruationDates}
                flowByDate={flowByDate}
                trackFlowEnabled={trackFlowEnabled}
              />
            </Card>
          )}

          {!postCycleMode && (
            <div>
              <h2 className="font-display text-lg text-ink mb-3">Eerdere cycli</h2>
              {recentHistory.length ? (
                <Card className="p-0 divide-y divide-line">
                  {completedLengths.length >= 2 && (
                    <div className="px-5 py-3.5">
                      <p className="text-xs text-ink-soft mb-2">Cyclusduur (recente cycli)</p>
                      <CycleLengthSparkline lengths={completedLengths} />
                    </div>
                  )}
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
          )}
        </div>

        <div className="mt-6 lg:mt-0 flex flex-col gap-6">
          <PersonalInsights insights={dedupedPersonalInsights} checkinCount={insightCheckins.length} />

          {phaseInsights.length > 0 && !postCycleMode && (
            <div>
              <h2 className="font-display text-lg text-ink mb-3">Wat je cycli laten zien</h2>
              <Card>
                <ul className="flex flex-col gap-3">
                  {phaseInsights.map((insight) => (
                    <li
                      key={`${insight.phase}-${insight.symptom}`}
                      className="text-base text-ink-soft leading-relaxed"
                    >
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

          {cycleLengthTrend && !postCycleMode && (
            <div>
              <h2 className="font-display text-lg text-ink mb-3">Je cyclusduur door de tijd</h2>
              <Card>
                <p className="text-base text-ink-soft leading-relaxed">
                  {formatCycleLengthTrendInsight(cycleLengthTrend)}
                </p>
              </Card>
            </div>
          )}

          <div>
            <h2 className="font-display text-lg text-ink mb-3">Persoonlijke patronen</h2>
            {patterns.length ? (
              <Card>
                <SimpleBars
                  items={patterns.slice(0, 6).map((p) => ({ label: p.symptom, value: p.count }))}
                />
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
