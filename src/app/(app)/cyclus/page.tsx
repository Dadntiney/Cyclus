import Link from "next/link"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { estimateCycle, phaseLabel } from "@/lib/cycle/estimate"
import {
  computeCycleHistory,
  computeSymptomFrequency,
  getEffectiveLastPeriodStart,
  withActivePeriod,
} from "@/lib/cycle/history"
import {
  computePhaseSymptomInsights,
  formatPhaseSymptomInsightShort,
  computeCycleLengthTrend,
  formatCycleLengthTrendInsight,
} from "@/lib/cycle/patterns"
import { computePersonalInsights } from "@/lib/cycle/insights"
import { estimateNextPeriod, formatNextPeriodEstimate } from "@/lib/cycle/next-period"
import { computeCycleDeviationAlerts } from "@/lib/cycle/deviation"
import { computeMonthChangeInsights } from "@/lib/cycle/month-change"
import { Calendar } from "@/components/cycle/calendar"
import { CycleLengthSparkline, SimpleBars } from "@/components/cycle/simple-bars"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { format, parseISO, subDays } from "date-fns"
import { nl } from "date-fns/locale"
import {
  Droplet,
  Sparkles,
  ChevronRight,
  Sunset,
  Activity,
  ClipboardList,
  Stethoscope,
  Lightbulb,
} from "lucide-react"
import { FLOW_OPTIONS, LIFE_STAGE_OPTIONS, symptomLabel } from "@/lib/constants"
import { getPhaseContent } from "@/lib/cycle/phase-content"
import { cn } from "@/lib/utils"

/**
 * Cyclus hub IA (see competitive/UX analysis):
 * 1) Now  2) Calendar  3) History  4) Insights  5) Changes  6) More
 * Generic phase lifestyle tips live on Deze week / Cyclusdag — not here.
 */
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
  const flowByDate = new Map(
    effectiveLogs.filter((l) => l.menstruation).map((l) => [l.date, l.flow ?? null]),
  )

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
  const phaseInsights = computePhaseSymptomInsights(history, checkinsForPatterns).slice(0, 2)
  const cycleLengthTrend = computeCycleLengthTrend(history)
  const deviationAlerts = computeCycleDeviationAlerts({
    history,
    lengthTrend: cycleLengthTrend,
    lifeStage,
    age: profile?.age ?? null,
  }).filter((a) => a.kind !== "lengte_stabieler" && a.kind !== "life_stage_hint")
  const monthChanges = computeMonthChangeInsights(insightCheckins).slice(0, 2)

  const shownPhaseSymptoms = new Set(phaseInsights.map((i) => `${i.phase}:${i.symptom}`))
  const personalInsights = computePersonalInsights(
    insightCheckins,
    cycleProfile
      ? {
          has_cycle: cycleProfile.has_cycle,
          last_period_start: cycleProfile.last_period_start,
          average_cycle_length: cycleProfile.average_cycle_length,
        }
      : null,
  ).filter(
    (insight) =>
      !(insight.phase && insight.symptom && shownPhaseSymptoms.has(`${insight.phase}:${insight.symptom}`)),
  )

  const insightLines: string[] = [
    ...phaseInsights.map((i) => formatPhaseSymptomInsightShort(i, phaseLabel(i.phase))),
    ...personalInsights.map((i) => i.text),
  ].slice(0, 2)

  const changeItems: { title: string; body: string }[] = [
    ...deviationAlerts.map((a) => ({ title: a.title, body: a.body })),
    ...monthChanges.map((c) => ({ title: c.title, body: c.body })),
  ]
  if (cycleLengthTrend?.direction === "onregelmatiger") {
    changeItems.push({
      title: "Je cyclusduur wisselt meer",
      body: formatCycleLengthTrendInsight(cycleLengthTrend),
    })
  }
  const uniqueChanges = changeItems
    .filter((item, index, arr) => arr.findIndex((x) => x.title === item.title) === index)
    .slice(0, 3)

  const hasCycle = cycleProfile?.has_cycle ?? true
  const isIrregular =
    cycleProfile?.regularity === "onregelmatig" || cycleProfile?.regularity === "onbekend"
  const phaseTone = cycleEstimate ? getPhaseContent(cycleEstimate.phase).colors : null

  return (
    <div className="w-full max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6 lg:gap-8">
      {/* 1. Title */}
      <div>
        <h1 className="font-display text-2xl lg:text-3xl text-ink">
          {postCycleMode ? "Mijn lichaam & klachten" : "Mijn cyclus"}
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          {postCycleMode
            ? "Houd bij wat speelt — zonder menstruatiekalender."
            : "Houd je menstruatie bij en zie wat er bij jou verandert."}
        </p>
        {lifeStageLabel && (
          <Link
            href="/profiel/cyclus"
            className="inline-block text-xs text-ink-soft mt-2 touch-manipulation"
          >
            Levensfase: {lifeStageLabel}
          </Link>
        )}
      </div>

      {!lifeStage && (
        <Card className="bg-cream-soft border-transparent">
          <p className="text-sm font-medium text-ink mb-1">Welke fase past bij jou?</p>
          <p className="text-sm text-ink-soft mb-3">
            Regelmatig, veranderend, overgang of daarna — dan past de uitleg beter. Geen diagnose.
          </p>
          <Link href="/profiel/cyclus" className="text-sm font-medium text-sage-dark underline">
            Levensfase kiezen
          </Link>
        </Card>
      )}

      {/* 2. Now */}
      {postCycleMode ? (
        <Card>
          <p className="text-sm text-sage-dark font-medium mb-1">Zonder menstruatiekalender</p>
          <p className="font-display text-xl text-ink mb-2">Jouw klachten staan centraal</p>
          <p className="text-sm text-ink-soft leading-relaxed">
            Check-ins, slaap, medicatie/HT en de klachtenlast-score blijven beschikbaar.
          </p>
          {periLatest?.score != null && (
            <p className="text-sm text-ink mt-3">
              Laatste klachtenlast: <span className="font-medium">{periLatest.score}/100</span>
            </p>
          )}
        </Card>
      ) : hasCycle ? (
        <Card className={cn(phaseTone && "border-transparent", phaseTone?.bg)}>
          {cycleEstimate ? (
            <>
              <p className={cn("text-sm font-medium mb-1", phaseTone?.text ?? "text-sage-dark")}>Nu</p>
              <p className="font-display text-2xl text-ink">Cyclusdag {cycleEstimate.cycleDay}</p>
              <p className="text-base text-ink-soft mt-1">{cycleEstimate.phaseLabel} · schatting</p>
            </>
          ) : (
            <p className="text-sm text-ink-soft">
              Markeer je menstruatiedagen in de kalender hieronder om je cyclusdag te schatten.
            </p>
          )}

          {nextPeriod && (
            <div className="mt-4 rounded-xl bg-surface/70 px-3 py-2.5">
              <p className="text-sm font-medium text-ink">Volgende menstruatie</p>
              <p className="text-sm text-ink-soft mt-1 leading-relaxed">
                {formatNextPeriodEstimate(nextPeriod)}
              </p>
            </div>
          )}

          {(isIrregular || nextPeriod?.isIrregularFriendly) && (
            <p className="text-xs text-ink-soft mt-3">
              Schattingen zijn een richting — geen exacte voorspelling.
            </p>
          )}

          {cycleEstimate && (
            <Link
              href="/cyclus/vandaag"
              className={cn(
                "mt-4 pt-4 border-t flex items-center justify-between touch-manipulation",
                phaseTone ? "border-ink/10" : "border-line",
              )}
            >
              <span className={cn("text-sm font-medium", phaseTone?.text ?? "text-sage-dark")}>
                Wat betekent deze fase voor jou?
              </span>
              <ChevronRight
                className={cn("h-4 w-4", phaseTone?.text ?? "text-sage-dark")}
                strokeWidth={1.75}
              />
            </Link>
          )}
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-ink-soft">
            Je hebt aangegeven geen menstruatiecyclus te hebben. Hieronder zie je wel je
            klachtenpatronen.
          </p>
        </Card>
      )}

      {/* 3. Calendar — primary action */}
      {!postCycleMode && (
        <section>
          <h2 className="font-display text-lg text-ink mb-3">Kalender</h2>
          <Card>
            <Calendar
              menstruationDates={menstruationDates}
              flowByDate={flowByDate}
              trackFlowEnabled={trackFlowEnabled}
            />
          </Card>
        </section>
      )}

      {/* 4. History */}
      {!postCycleMode && (
        <section>
          <h2 className="font-display text-lg text-ink mb-3">Eerdere cycli</h2>
          {recentHistory.length ? (
            <Card className="p-0 divide-y divide-line">
              {completedLengths.length >= 2 && (
                <div className="px-5 py-3.5">
                  <p className="text-xs text-ink-soft mb-2">Cyclusduur (recent)</p>
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
                      <p className="text-xs text-ink-soft">{period.cycleLength} d cyclus</p>
                    )}
                  </div>
                )
              })}
            </Card>
          ) : (
            <Card>
              <EmptyState
                icon={<Droplet className="h-6 w-6" />}
                title="Nog geen cyclusgeschiedenis"
                description="Markeer menstruatiedagen in de kalender hierboven."
              />
            </Card>
          )}
        </section>
      )}

      {/* 5. Insights — one section */}
      <section>
        <h2 className="font-display text-lg text-ink mb-1">Jouw inzichten</h2>
        <p className="text-sm text-ink-soft mb-3">
          Op basis van je check-ins — geen diagnose, wel herkenning.
        </p>

        {insightLines.length > 0 ? (
          <Card className="p-0 divide-y divide-line mb-3">
            {insightLines.map((text) => (
              <div key={text} className="flex gap-3 px-5 py-3.5">
                <Lightbulb className="h-4 w-4 shrink-0 text-sage-dark mt-0.5" strokeWidth={1.75} />
                <p className="text-sm text-ink leading-relaxed">{text}</p>
              </div>
            ))}
          </Card>
        ) : (
          <Card className="mb-3">
            <EmptyState
              icon={<Sparkles className="h-6 w-6" />}
              title="Nog weinig inzichten"
              description="Vul een aantal check-ins in op Vandaag. Daarna verschijnen hier verbanden."
            />
          </Card>
        )}

        {patterns.length > 0 && (
          <Card>
            <p className="text-sm font-medium text-ink mb-3">Meest genoteerde klachten</p>
            <SimpleBars
              items={patterns.slice(0, 5).map((p) => ({
                label: symptomLabel(p.symptom),
                value: p.count,
              }))}
            />
          </Card>
        )}
      </section>

      {/* 6. Changes — only when relevant */}
      {uniqueChanges.length > 0 && (
        <section>
          <h2 className="font-display text-lg text-ink mb-3">Veranderingen</h2>
          <div className="flex flex-col gap-3">
            {uniqueChanges.map((item) => (
              <Card key={item.title}>
                <div className="flex gap-2.5">
                  <Activity className="h-4 w-4 text-ink-soft shrink-0 mt-0.5" strokeWidth={1.75} />
                  <div>
                    <p className="text-sm font-medium text-ink">{item.title}</p>
                    <p className="text-sm text-ink-soft mt-1 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 7. More — secondary tools & education */}
      <section>
        <h2 className="font-display text-lg text-ink mb-3">Meer</h2>
        <div className="flex flex-col gap-2">
          <Link
            href="/cyclus/samenvatting"
            className="flex items-center justify-between rounded-2xl border border-line/70 px-4 py-3.5 touch-manipulation"
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink inline-flex items-center gap-1.5">
                <Stethoscope className="h-4 w-4 text-sage-dark" strokeWidth={1.75} />
                Voor je arts
              </span>
              <span className="block text-xs text-ink-soft mt-0.5">
                Samenvatting om mee te nemen naar een afspraak.
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} />
          </Link>

          <Link
            href="/cyclus/klachtenlast"
            className="flex items-center justify-between rounded-2xl border border-line/70 px-4 py-3.5 touch-manipulation"
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink inline-flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4 text-sage-dark" strokeWidth={1.75} />
                Klachtenlast
              </span>
              <span className="block text-xs text-ink-soft mt-0.5">
                {periLatest?.score != null
                  ? `Laatste score: ${periLatest.score}/100`
                  : "Maandelijkse check voor jezelf of je arts."}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} />
          </Link>

          <Link
            href="/cyclus/overgang"
            className="flex items-center justify-between rounded-2xl border border-line/70 px-4 py-3.5 touch-manipulation"
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink inline-flex items-center gap-1.5">
                <Sunset className="h-4 w-4 text-info" strokeWidth={1.75} />
                {overgangMode ? "Overgang & verandering" : "Cyclus & ouder worden"}
              </span>
              <span className="block text-xs text-ink-soft mt-0.5">
                Uitleg over hoe je cyclus kan veranderen.
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} />
          </Link>
        </div>
      </section>
    </div>
  )
}
