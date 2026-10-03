import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import { differenceInCalendarDays, format, parseISO, subDays } from "date-fns"
import { Activity, Droplet, Lightbulb, Sparkles } from "lucide-react"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { estimateCycle, phaseLabel } from "@/lib/cycle/estimate"
import { resolvePresentedForDate } from "@/lib/cycle/presented-estimate"
import {
  computeCycleHistory,
  computeSymptomFrequency,
  getEffectiveLastPeriodStart,
  withActivePeriod,
  type CycleHistoryEntry,
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
import { isLowDay, mostlyLowRecently, phaseTagline, usesChangingCycleLens } from "@/lib/cycle/day-lens"
import { composeCycleRecap, composeInsightProgress } from "@/lib/cycle/cycle-recap"
import { estimateNextPeriod } from "@/lib/cycle/next-period"
import { computeCycleDeviationAlerts } from "@/lib/cycle/deviation"
import { computeMonthChangeInsights } from "@/lib/cycle/month-change"
import { FEATURES } from "@/lib/navigation/features"
import { InsightProgressBlock } from "@/components/cycle/insight-progress-card"
import { CycleRecapBlock } from "@/components/cycle/cycle-recap-card"
import { YourStoryBlock } from "@/components/cycle/your-story-card"
import { Calendar } from "@/components/cycle/calendar"
import { LifeStageBanner } from "@/components/cycle/life-stage-banner"
import { CycleLengthSparkline, SimpleBars } from "@/components/cycle/simple-bars"
import { formatPeriodRange } from "@/components/cycle/date-format"
import { PhaseContextCard } from "@/components/today/phase-context-card"
import { CycleSetupCard } from "@/components/today/cycle-setup-card"
import { Page } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { textActionClass } from "@/components/ui/button"
import { Card, CardTitle } from "@/components/ui/card"
import { Disclosure } from "@/components/ui/disclosure"
import { EmptyState } from "@/components/ui/empty-state"
import { IconButton } from "@/components/ui/icon-button"
import { ListGroup, ListRow } from "@/components/ui/list-group"
import { SectionHeader } from "@/components/ui/section-header"
import { todayDate, todayISO } from "@/lib/dates/amsterdam"
import { FLOW_OPTIONS, LIFE_STAGE_OPTIONS, symptomLabel } from "@/lib/constants"
import { iconProps } from "@/lib/ui/icon"

export const metadata: Metadata = { title: FEATURES.cyclus.label }

/** "Meest genoteerde klachten" only once there is something to compare. */
const MIN_CHECKINS_FOR_BARS = 5
const MIN_COUNT_FOR_BARS = 2
/** Eerdere cycli: the newest few in view, the rest behind "Alle … tonen". */
const VISIBLE_CYCLES = 3

function PeriodRow({
  period,
  currentYear,
  showFlow,
}: {
  period: CycleHistoryEntry
  currentYear: number
  showFlow: boolean
}) {
  const flowOption = showFlow ? FLOW_OPTIONS.find((f) => f.value === period.dominantFlow) : undefined
  const details = [
    period.cycleLength ? `Cyclus van ${period.cycleLength} dagen` : null,
    `${period.days} ${period.days === 1 ? "dag" : "dagen"} menstruatie`,
    flowOption ? flowOption.label.toLowerCase() : null,
  ].filter(Boolean)

  return (
    <li className="px-4 py-3.5">
      <p className="text-base font-medium text-ink">
        {formatPeriodRange(period.start, period.end, currentYear)}
      </p>
      <p className="text-sm text-ink-soft mt-0.5">{details.join(" · ")}</p>
    </li>
  )
}

/**
 * Cyclus (ontwerpvisie §7.8): the phase status on top (the same surface as
 * Vandaag), the calendar as the one logging action, then her patterns in
 * one calm card, the tools, earlier cycles and — only when relevant —
 * changes. On xl the status + calendar stay left, the reading goes right.
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
  const sleepEnabled = profile?.sleep_tracking_enabled === true
  const today = todayISO()
  const currentYear = todayDate().getFullYear()
  const lifeStage = cycleProfile?.life_stage ?? null
  const lifeStageLabel = LIFE_STAGE_OPTIONS.find((o) => o.value === lifeStage)?.label
  const postCycleMode = lifeStage === "menopauze" || cycleProfile?.has_cycle === false

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
  const upcomingPeriod = nextPeriod && nextPeriod.daysUntil >= 0 ? nextPeriod : null

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
    // The phase status already states day + phase — don’t repeat it in Jouw verhaal.
    omitDaySummary: Boolean(cycleEstimate) && !postCycleMode,
    // Checkins are newest first: her last week decides the week line.
    recentlyLow: mostlyLowRecently(
      (checkins ?? []).filter((c) => c.date >= format(subDays(todayDate(), 7), "yyyy-MM-dd")),
    ),
  })
  const changingCycle = usesChangingCycleLens({
    lifeStage,
    age: profile?.age ?? null,
    regularity: cycleProfile?.regularity ?? null,
    perimenopauseInfo: cycleProfile?.perimenopause_information ?? null,
    recentSymptoms: (checkins ?? []).slice(0, 30).flatMap((c) => c.symptoms ?? []),
  })
  const cycleRecap = postCycleMode ? null : composeCycleRecap(history, checkins ?? [])
  const insightProgress = composeInsightProgress({
    hasCycle: Boolean(cycleProfile?.has_cycle) && !postCycleMode,
    completedCycles: history.filter((p) => p.cycleLength !== null).length,
    checkinCount: (checkins ?? []).length,
    hasPersonalPattern:
      allPhaseInsights.length > 0 || whatHelpedInsights.length > 0 || coOccurrences.length > 0,
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

  // ── Phase status: the same props Vandaag derives ──────────────────────
  const activePeriodStart = cycleProfile?.active_period_start ?? null
  const isMenstruationActive = activePeriodStart !== null
  const menstruationDay = activePeriodStart
    ? differenceInCalendarDays(parseISO(today), parseISO(activePeriodStart)) + 1
    : null
  const todayCheckin = (checkins ?? []).find((c) => c.date === today) ?? null
  const lowDay = isLowDay(todayCheckin)
  const phaseSubtitle =
    cycleEstimate && !(presentedToday.predictedMenstruation && !isMenstruationActive)
      ? phaseTagline(cycleEstimate.phase, { lowDay, changingCycle })
      : ""

  // ── Jouw patronen: one card, only the blocks with something to say ────
  const barItems = patterns
    .filter((p) => p.count >= MIN_COUNT_FOR_BARS)
    .slice(0, 5)
    .map((p) => ({ label: symptomLabel(p.symptom), value: p.count }))
  const showBars = (checkins ?? []).length >= MIN_CHECKINS_FOR_BARS && barItems.length > 0

  const patternBlocks: { key: string; node: ReactNode }[] = []
  if (insightProgress) {
    patternBlocks.push({ key: "progress", node: <InsightProgressBlock progress={insightProgress} /> })
  }
  if (yourStory) {
    patternBlocks.push({ key: "story", node: <YourStoryBlock story={yourStory} /> })
  }
  if (cycleRecap) {
    patternBlocks.push({ key: "recap", node: <CycleRecapBlock recap={cycleRecap} /> })
  }
  if (insightLines.length > 0) {
    patternBlocks.push({
      key: "insights",
      node: (
        <div>
          <h3 className="type-card-title text-ink">Wat opvalt</h3>
          <ul className="flex flex-col gap-3 mt-3">
            {insightLines.map((text) => (
              <li key={text} className="flex gap-3">
                <Lightbulb {...iconProps("sm", "mt-0.5 text-sage-dark")} aria-hidden />
                <p className="text-sm text-ink">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      ),
    })
  }
  if (showBars) {
    patternBlocks.push({
      key: "bars",
      node: (
        <div>
          <h3 className="type-card-title text-ink mb-3">Meest genoteerde klachten</h3>
          <SimpleBars items={barItems} />
        </div>
      ),
    })
  }

  // ── Eerdere cycli: finished periods, newest first ─────────────────────
  const lastPeriod = history.length ? history[history.length - 1] : null
  const pastPeriods = [...history]
    .reverse()
    .filter((p) => !(isMenstruationActive && lastPeriod && p.start === lastPeriod.start))
  const visiblePeriods = pastPeriods.slice(0, VISIBLE_CYCLES)
  const morePeriods = pastPeriods.slice(VISIBLE_CYCLES)

  const settings = FEATURES.cyclusinstellingen
  const checkinHref = "/vandaag#checkin"

  return (
    <Page className="xl:max-w-6xl">
      <PageHeader
        title={FEATURES.cyclus.label}
        subtitle={
          postCycleMode
            ? "Je lichaam en klachten in beeld."
            : "Houd je menstruatie bij en zie wat er verandert."
        }
        action={<IconButton label={settings.label} icon={settings.icon} href={settings.href} />}
      />

      <div className="flex flex-col gap-8 xl:grid xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] xl:items-start xl:gap-12">
        <div className="flex flex-col gap-8">
          {postCycleMode ? (
            <Card>
              <p className="type-eyebrow text-sage-dark">Zonder menstruatiekalender</p>
              <CardTitle as="h2" className="text-ink mt-1">
                Jouw klachten staan centraal
              </CardTitle>
              <p className="text-sm text-ink-soft mt-2">
                Check-ins, slaap, medicatie/HT en de klachtenlast-score blijven beschikbaar.
              </p>
              {periLatest?.score != null && (
                <p className="text-sm text-ink mt-3">
                  Laatste klachtenlast: <span className="font-medium">{periLatest.score}/100</span>
                </p>
              )}
            </Card>
          ) : cycleEstimate ? (
            <PhaseContextCard
              phase={cycleEstimate.phase}
              phaseLabel={cycleEstimate.phaseLabel}
              roughEstimate={changingCycle}
              cycleDay={cycleEstimate.cycleDay}
              subtitle={phaseSubtitle}
              hasCycle={Boolean(cycleProfile?.has_cycle)}
              isMenstruationActive={isMenstruationActive}
              menstruationDay={menstruationDay}
              predictedMenstruation={presentedToday.predictedMenstruation}
              menstruationSoftHint={menstruationSoftHint}
              cycleLength={cycleProfile?.average_cycle_length ?? null}
              periodLength={cycleProfile?.average_period_length ?? null}
              nextPeriodStart={upcomingPeriod?.estimatedStart ?? null}
            />
          ) : isMenstruationActive && menstruationDay ? (
            <PhaseContextCard
              phase="menstruatie"
              phaseLabel="Menstruatie"
              cycleDay={menstruationDay}
              subtitle="Je hebt menstruatie gestart. Vul je cyclusgegevens aan voor een volledige fase-inschatting."
              hasCycle
              isMenstruationActive
              menstruationDay={menstruationDay}
            />
          ) : (
            <CycleSetupCard />
          )}

          {!postCycleMode && (
            <Calendar
              predictedStart={upcomingPeriod?.estimatedStart ?? null}
              predictedLength={cycleProfile?.average_period_length ?? 5}
              predictedWindowDays={upcomingPeriod?.windowDays ?? null}
              menstruationDates={menstruationDates}
              flowByDate={flowByDate}
              trackFlowEnabled={trackFlowEnabled}
            />
          )}

          {!lifeStage && <LifeStageBanner changingCycle={changingCycle} />}
        </div>

        <div className="flex flex-col gap-8">
          <section aria-labelledby="jouw-verhaal">
            <SectionHeader
              id="jouw-verhaal"
              title="Jouw patronen"
              description="Uit wat je bijhoudt: ter herkenning, geen diagnose."
            />
            {patternBlocks.length > 0 ? (
              <Card className="divide-y divide-line">
                {patternBlocks.map((block) => (
                  <div key={block.key} className="py-5 first:pt-0 last:pb-0">
                    {block.node}
                  </div>
                ))}
              </Card>
            ) : (
              <EmptyState
                icon={Sparkles}
                titleAs="h3"
                title="Nog weinig patronen"
                description="Vul een paar check-ins in op Vandaag. Dan verschijnen hier verbanden."
                action={
                  <Link href={checkinHref} className={textActionClass()}>
                    Naar de check-in
                  </Link>
                }
              />
            )}
          </section>

          <ListGroup label="Hulpmiddelen">
            <ListRow
              href={FEATURES.voorJeArts.href}
              icon={FEATURES.voorJeArts.icon}
              title={FEATURES.voorJeArts.label}
              description="Samenvatting om mee te nemen naar je afspraak"
            />
            <ListRow
              href={FEATURES.klachtenlast.href}
              icon={FEATURES.klachtenlast.icon}
              title={FEATURES.klachtenlast.label}
              description={
                periLatest?.score != null
                  ? `Laatste score: ${periLatest.score}/100`
                  : "Maandelijkse check voor jezelf of je arts"
              }
            />
            <ListRow
              href={FEATURES.slaap.href}
              icon={FEATURES.slaap.icon}
              title={FEATURES.slaap.label}
              description="Je nachten en wat kan helpen"
              badge={sleepEnabled ? undefined : <Badge>staat uit</Badge>}
              muted={!sleepEnabled}
            />
            <ListRow
              href={FEATURES.overgang.href}
              icon={FEATURES.overgang.icon}
              title={FEATURES.overgang.label}
              description="Hoe je cyclus kan veranderen"
            />
          </ListGroup>

          {!postCycleMode && (
            <section aria-labelledby="eerdere-cycli">
              <SectionHeader id="eerdere-cycli" title="Eerdere cycli" />
              {pastPeriods.length > 0 ? (
                <Card padding="none" className="overflow-hidden">
                  {completedLengths.length >= 2 && (
                    <div className="px-4 py-3.5 border-b border-line">
                      <p className="text-xs text-ink-soft mb-2">Cyclusduur in dagen (recent)</p>
                      <CycleLengthSparkline lengths={completedLengths} />
                    </div>
                  )}
                  <ul role="list" className="divide-y divide-line">
                    {visiblePeriods.map((period) => (
                      <PeriodRow
                        key={period.start}
                        period={period}
                        currentYear={currentYear}
                        showFlow={trackFlowEnabled}
                      />
                    ))}
                  </ul>
                  {morePeriods.length > 0 && (
                    <Disclosure
                      label={`Alle ${pastPeriods.length} cycli tonen`}
                      openLabel="Minder tonen"
                      className="border-t border-line"
                      triggerClassName="px-4"
                      contentClassName="pt-0"
                    >
                      <ul role="list" className="divide-y divide-line border-t border-line">
                        {morePeriods.map((period) => (
                          <PeriodRow
                            key={period.start}
                            period={period}
                            currentYear={currentYear}
                            showFlow={trackFlowEnabled}
                          />
                        ))}
                      </ul>
                    </Disclosure>
                  )}
                </Card>
              ) : (
                <EmptyState
                  icon={Droplet}
                  titleAs="h3"
                  title="Nog geen afgeronde cycli"
                  description="Markeer menstruatiedagen in de kalender. Afgeronde periodes verschijnen hier."
                  action={
                    <a href="#kalender" className={textActionClass()}>
                      Naar de kalender
                    </a>
                  }
                />
              )}
            </section>
          )}

          {uniqueChanges.length > 0 && (
            <section aria-labelledby="veranderingen">
              <SectionHeader id="veranderingen" title="Veranderingen" />
              <ul className="flex flex-col gap-4">
                {uniqueChanges.map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <Activity {...iconProps("sm", "mt-1 text-ink-soft")} aria-hidden />
                    <div className="min-w-0">
                      <p className="text-base font-medium text-ink">{item.title}</p>
                      <p className="text-sm text-ink-soft mt-0.5">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </Page>
  )
}
