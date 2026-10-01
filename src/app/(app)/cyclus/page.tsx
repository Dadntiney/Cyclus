import Link from "next/link"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { estimateCycle, phaseLabel } from "@/lib/cycle/estimate"
import {
  resolvePresentedForDate,
  formatPresentedCycleHeadline,
  softMenstruationNote,
} from "@/lib/cycle/presented-estimate"
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
  getTopPhaseSymptomInsight,
} from "@/lib/cycle/patterns"
import { computePersonalInsights } from "@/lib/cycle/insights"
import { computeSymptomCoOccurrences } from "@/lib/cycle/co-occurrence"
import { computeWhatHelpedInsights } from "@/lib/cycle/what-helped"
import { composeYourStory } from "@/lib/cycle/your-story"
import { YourStoryCard } from "@/components/cycle/your-story-card"
import { estimateNextPeriod, formatNextPeriodEstimate } from "@/lib/cycle/next-period"
import { computeCycleDeviationAlerts } from "@/lib/cycle/deviation"
import { computeMonthChangeInsights } from "@/lib/cycle/month-change"
import { Calendar } from "@/components/cycle/calendar"
import { CycleLengthSparkline, SimpleBars } from "@/components/cycle/simple-bars"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { format, parseISO, subDays } from "date-fns"
import { nl } from "date-fns/locale"
import { todayDate, todayISO } from "@/lib/dates/amsterdam"
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
 * Cyclus hub IA:
 * 1) Now  2) Your story / insights  3) Calendar  4) History  5) Changes  6) More
 * Buddy value (patterns) sits near the top; calendar stays the primary logging action.
 */
export default async function CyclusPage() {
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) return null

  const sixMonthsAgo = format(subDays(todayDate(), 200), "yyyy-MM-dd")

  const [profile, { data: cycleProfile }, { data: logs }, { data: checkins }, { data: periRows }, { data: historySessions }] =
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
        .select("date, energy, mood, sleep, stress, symptoms, needs")
        .eq("user_id", user.id)
        .gte("date", sixMonthsAgo)
        .order("date", { ascending: false }),
      supabase
        .from("peri_assessments")
        .select("assessed_on, score")
        .eq("user_id", user.id)
        .order("assessed_on", { ascending: false })
        .limit(1),
      supabase
        .from("workout_sessions")
        .select("date, workout_id")
        .eq("user_id", user.id)
        .eq("completed", true)
        .gte("date", sixMonthsAgo),
    ])
  const periLatest = periRows?.[0] ?? null

  const workoutTypeById = new Map<string, string>()
  const sessionIds = [...new Set((historySessions ?? []).map((s) => s.workout_id).filter(Boolean))]
  if (sessionIds.length) {
    const { data: workoutRows } = await supabase.from("workouts").select("id, type").in("id", sessionIds)
    for (const w of workoutRows ?? []) {
      workoutTypeById.set(w.id, w.type)
    }
  }

  const trackFlowEnabled = profile?.track_flow_intensity ?? false
  const today = todayISO()
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
  const completedLengths = history
    .filter((p): p is (typeof history)[number] & { cycleLength: number } => p.cycleLength !== null)
    .slice(-6)
    .map((p) => p.cycleLength)

  const effectiveLastStart = cycleProfile
    ? getEffectiveLastPeriodStart(cycleProfile.last_period_start, history)
    : null

  const rawCycleEstimate =
    cycleProfile && !postCycleMode
      ? estimateCycle(
          effectiveLastStart,
          cycleProfile.average_cycle_length,
          cycleProfile.has_cycle,
          undefined,
          cycleProfile.average_period_length,
        )
      : null

  // Same soft gate as Vandaag / Week: no hard menstruatiedag until Bezig.
  // Use effective last start (same as raw estimate) so hub and soft gate agree.
  const presentedToday =
    cycleProfile && !postCycleMode
      ? resolvePresentedForDate(
          today,
          {
            last_period_start: effectiveLastStart,
            average_cycle_length: cycleProfile.average_cycle_length,
            average_period_length: cycleProfile.average_period_length,
            has_cycle: cycleProfile.has_cycle,
            active_period_start: cycleProfile.active_period_start,
          },
          menstruationDates,
        )
      : {
          estimate: null,
          predictedMenstruation: false,
          menstruationSoftHint: null,
        }

  // Prefer presented; fall back only if soft gate had nothing (shouldn't happen).
  const cycleEstimate = presentedToday.estimate ?? rawCycleEstimate
  const menstruationSoftHint = presentedToday.menstruationSoftHint
  const softMenstruationMode = Boolean(menstruationSoftHint)

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

  const lastPeriod = history.length ? history[history.length - 1] : null
  const lastPeriodIsActive = Boolean(
    lastPeriod && cycleProfile?.active_period_start != null,
  )
  // “Eerdere cycli” = finished periods only — the open one already lives under Nu.
  const recentHistory = [...history]
    .reverse()
    .filter((p) => !(lastPeriodIsActive && lastPeriod && p.start === lastPeriod.start))
    .slice(0, 6)

  const checkinsForPatterns = (checkins ?? []).map((c) => ({
    date: c.date,
    symptoms: c.symptoms ?? [],
  }))
  const patterns = computeSymptomFrequency(checkinsForPatterns)
  const allPhaseInsights = computePhaseSymptomInsights(history, checkinsForPatterns)
  const phaseInsights = allPhaseInsights.slice(0, 2)
  const cycleLengthTrend = computeCycleLengthTrend(history)
  const coOccurrences = computeSymptomCoOccurrences(checkinsForPatterns)
  const whatHelpedInsights = computeWhatHelpedInsights(
    (checkins ?? []).map((c) => ({
      date: c.date,
      needs: c.needs ?? null,
      energy: c.energy ?? null,
      mood: c.mood ?? null,
    })),
    (historySessions ?? []).map((s) => ({
      date: s.date,
      workoutType: workoutTypeById.get(s.workout_id) ?? null,
    })),
  )
  const yourStory = composeYourStory({
    phase: cycleEstimate?.phase ?? null,
    phaseLabel: cycleEstimate?.phaseLabel ?? null,
    cycleDay: cycleEstimate?.cycleDay ?? null,
    hasCycle: Boolean(cycleProfile?.has_cycle) && !postCycleMode,
    lifeStageLabel: lifeStageLabel ?? null,
    cycleLengthTrend,
    phaseInsight: cycleEstimate
      ? getTopPhaseSymptomInsight(allPhaseInsights, cycleEstimate.phase)
      : null,
    coOccurrence: coOccurrences[0] ?? null,
    whatHelped: whatHelpedInsights.slice(0, 2),
    includeWeekGuide: Boolean(cycleEstimate) && !postCycleMode,
    // Nu card already states day + phase — don’t repeat it in Jouw verhaal.
    omitDaySummary: Boolean(cycleEstimate) && !postCycleMode,
  })
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
  ]
    .filter((text) => !(yourStory?.whatWorks.includes(text)))
    .slice(0, 2)

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
  const nuHeadline =
    cycleEstimate && cycleProfile
      ? formatPresentedCycleHeadline(
          cycleEstimate,
          today,
          cycleProfile.active_period_start ?? null,
          presentedToday.predictedMenstruation,
          menstruationSoftHint,
        )
      : null
  const nuSoftNote = softMenstruationNote(menstruationSoftHint)

  const insightsBlock = (
      <section>
        <h2 className="font-display text-lg text-ink mb-1">Jouw inzichten</h2>
        <p className="text-sm text-ink-soft mb-3">
          Gebaseerd op je check-ins — ter herkenning, geen diagnose.
        </p>

        {yourStory && (
          <div className="mb-3">
            <YourStoryCard story={yourStory} />
          </div>
        )}

        {insightLines.length > 0 ? (
          <Card className="p-0 divide-y divide-sage/20 mb-3">
            {insightLines.map((text) => (
              <div key={text} className="flex gap-3 px-4 py-3.5">
                <Lightbulb className="h-4 w-4 shrink-0 text-sage-dark mt-0.5" strokeWidth={1.75} />
                <p className="text-sm text-ink leading-relaxed">{text}</p>
              </div>
            ))}
          </Card>
        ) : !yourStory ? (
          <Card className="mb-3">
            <EmptyState
              icon={<Sparkles className="h-6 w-6" />}
              title="Nog weinig inzichten"
              description="Vul een paar check-ins in op Vandaag. Dan verschijnen hier verbanden."
            />
          </Card>
        ) : null}

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
  )

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
        <Card className="bg-cream-soft">
          <p className="text-sm font-medium text-ink mb-1">Welke fase past bij jou?</p>
          <p className="text-sm text-ink-soft mb-3">
            Regelmatig, veranderend, overgang of daarna: dan past de uitleg beter. Geen diagnose.
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
        <Card className={cn(phaseTone?.bg)}>
          {cycleEstimate ? (
            <>
              <p className={cn("text-sm font-medium mb-1", phaseTone?.text ?? "text-sage-dark")}>Nu</p>
              {softMenstruationMode ? (
                <>
                  <p className="font-display text-2xl text-ink">{nuHeadline}</p>
                  {nuSoftNote && (
                    <p className="text-sm text-ink-soft mt-1 leading-relaxed">{nuSoftNote}</p>
                  )}
                </>
              ) : (
                <>
                  <p className="font-display text-2xl text-ink">
                    {cycleEstimate.phase === "menstruatie" && cycleProfile?.active_period_start
                      ? nuHeadline
                      : `Cyclusdag ${cycleEstimate.cycleDay}`}
                  </p>
                  <p className="text-sm text-ink-soft mt-1">
                    {cycleEstimate.phase === "menstruatie" && cycleProfile?.active_period_start
                      ? "Bezig · op jouw start"
                      : `${cycleEstimate.phaseLabel} · schatting`}
                  </p>
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-ink-soft">
              Markeer je menstruatiedagen in de kalender hieronder. Dan kunnen we je cyclusdag schatten.
            </p>
          )}

          {lastPeriod && (
            <div className="mt-4 rounded-xl bg-surface/70 px-3 py-2.5 space-y-2">
              <div>
                <p className="text-sm font-medium text-ink">Laatste menstruatie</p>
                <p className="text-sm text-ink-soft mt-1 leading-relaxed">
                  {format(parseISO(lastPeriod.start), "d MMMM yyyy", { locale: nl })}
                  {" · "}
                  {lastPeriodIsActive
                    ? `nog bezig (${lastPeriod.days} ${lastPeriod.days === 1 ? "dag" : "dagen"} tot nu)`
                    : `tot ${format(parseISO(lastPeriod.end), "d MMMM yyyy", { locale: nl })} (${lastPeriod.days} ${lastPeriod.days === 1 ? "dag" : "dagen"})`}
                </p>
              </div>
              {nextPeriod && (
                <div className="pt-2 border-t border-ink/5">
                  <p className="text-sm font-medium text-ink">Volgende menstruatie</p>
                  <p className="text-sm text-ink-soft mt-1 leading-relaxed">
                    {formatNextPeriodEstimate(nextPeriod)}
                  </p>
                </div>
              )}
            </div>
          )}

          {!lastPeriod && nextPeriod && (
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
            Je hebt aangegeven geen menstruatiecyclus te hebben. Hieronder zie je wel
            klachtenpatronen.
          </p>
        </Card>
      )}

      {/* 3. Insights — buddy value right under Nu */}
      {insightsBlock}

      {/* 4. Calendar — primary logging action */}
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

      {/* 5. History */}
      {!postCycleMode && (
        <section>
          <h2 className="font-display text-lg text-ink mb-3">Eerdere cycli</h2>
          {recentHistory.length ? (
            <Card className="p-0 divide-y divide-sage/20">
              {completedLengths.length >= 2 && (
                <div className="px-4 py-3.5">
                  <p className="text-xs text-ink-soft mb-2">Cyclusduur (recent)</p>
                  <CycleLengthSparkline lengths={completedLengths} />
                </div>
              )}
              {recentHistory.map((period) => {
                const flowOption = FLOW_OPTIONS.find((f) => f.value === period.dominantFlow)
                return (
                  <div key={period.start} className="flex items-center justify-between px-4 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {format(parseISO(period.start), "d MMM", { locale: nl })} –{" "}
                        {format(parseISO(period.end), "d MMM yyyy", { locale: nl })}
                      </p>
                      <p className="text-xs text-ink-soft mt-0.5">
                        {period.days} {period.days === 1 ? "dag" : "dagen"} menstruatie
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
                title="Nog geen afgeronde cycli"
                description="Markeer menstruatiedagen in de kalender. Afgeronde periodes verschijnen hier."
              />
            </Card>
          )}
        </section>
      )}

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
            className="flex items-center justify-between rounded-3xl bg-sage-soft/50 px-4 py-3.5 touch-manipulation"
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
            className="flex items-center justify-between rounded-3xl bg-sage-soft/50 px-4 py-3.5 touch-manipulation"
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
            href="/kennis"
            className="flex items-center justify-between rounded-3xl bg-sage-soft/50 px-4 py-3.5 touch-manipulation"
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink inline-flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-sage-dark" strokeWidth={1.75} />
                Kennis
              </span>
              <span className="block text-xs text-ink-soft mt-0.5">
                Uitleg over hormonen, overgang en leefstijl.
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} />
          </Link>

          <Link
            href="/cyclus/overgang"
            className="flex items-center justify-between rounded-3xl bg-sage-soft/50 px-4 py-3.5 touch-manipulation"
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink inline-flex items-center gap-1.5">
                <Sunset className="h-4 w-4 text-info" strokeWidth={1.75} />
                {overgangMode ? "Overgang & verandering" : "Cyclus & ouder worden"}
              </span>
              <span className="block text-xs text-ink-soft mt-0.5">
                Wat er kan veranderen naarmate je ouder wordt.
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} />
          </Link>
        </div>
      </section>
    </div>
  )
}
