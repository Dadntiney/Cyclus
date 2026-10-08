import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, Moon } from "lucide-react"
import { format, subDays } from "date-fns"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { getSleepHistory } from "@/lib/data/sleep"
import { computeSleepDurationMinutes, formatSleepDuration } from "@/lib/sleep/duration"
import {
  computeAverageSleepDuration,
  computeSleepWakeFeelingInsight,
  computeSleepSymptomInsights,
  formatSleepSymptomInsight,
} from "@/lib/sleep/insights"
import { WAKE_FEELING_OPTIONS } from "@/lib/constants"
import { FEATURES } from "@/lib/navigation/features"
import { todayISO } from "@/lib/dates/amsterdam"
import { formatWeekdayDate } from "@/lib/dates/format"
import { Page, PageSections } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { ListGroup, ListRow } from "@/components/ui/list-group"
import { SectionHeader } from "@/components/ui/section-header"
import { buttonVariants } from "@/components/ui/button"
import { ValueSparkline, listNl } from "@/components/cycle/simple-bars"
import { SleepNightButton } from "@/components/sleep/sleep-night-button"
import { ICON } from "@/lib/ui/icon"

export const metadata: Metadata = { title: FEATURES.slaap.label }

const PATTERN_WINDOW_DAYS = 60
const DISPLAYED_NIGHTS = 14

const WAKE_FEELING_BY_VALUE = new Map<string, (typeof WAKE_FEELING_OPTIONS)[number]>(
  WAKE_FEELING_OPTIONS.map((o) => [o.value, o]),
)

/**
 * Slaap (ontwerpvisie §7.8): one primary "Nacht toevoegen" (the existing
 * sheet), one summary card, then sleep & symptoms, the last nights and
 * "Wat kan helpen". Off → a calm empty state with the way to switch it on.
 */
export default async function SlaapPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const profile = await getProfile(user.id)

  if (!profile || profile.sleep_tracking_enabled !== true) {
    return (
      <Page>
        <PageHeader title={FEATURES.slaap.label} subtitle="Je slaapduur en eenvoudige inzichten." />
        <EmptyState
          icon={Moon}
          title="Slaap bijhouden staat uit"
          description="Je ziet nu nergens slaapvragen of slaapkaarten. Zet het aan als je je nachten wilt volgen."
          action={
            <Link href={`${FEATURES.gebruik.href}#slaap`} className={buttonVariants({ variant: "secondary" })}>
              Aanzetten in {FEATURES.gebruik.label}
            </Link>
          }
        />
      </Page>
    )
  }

  const supabase = await createClient()
  const since = format(subDays(new Date(), PATTERN_WINDOW_DAYS - 1), "yyyy-MM-dd")

  const [entries, { data: checkins }] = await Promise.all([
    getSleepHistory(user.id, PATTERN_WINDOW_DAYS),
    supabase
      .from("daily_checkins")
      .select("date, symptoms")
      .eq("user_id", user.id)
      .gte("date", since),
  ])

  const today = todayISO()
  const todayEntry = entries.find((e) => e.date === today) ?? null
  const average = computeAverageSleepDuration(entries)
  const wakeFeelingInsight = computeSleepWakeFeelingInsight(entries)
  const sleepSymptomInsights = computeSleepSymptomInsights(entries, checkins ?? []).slice(0, 2)
  const recentEntries = [...entries].reverse().slice(0, DISPLAYED_NIGHTS) // newest first for the list

  // Chronological (oldest → newest) for a natural left-to-right rhythm.
  const durationMinutes = [...recentEntries]
    .reverse()
    .filter((e) => e.bedtime && e.wake_time)
    .map((e) => computeSleepDurationMinutes(e.bedtime!, e.wake_time!))
    .filter((mins): mins is number => mins != null)
  const showSparkline = durationMinutes.length >= 2
  const hasSummary = Boolean(average || wakeFeelingInsight || showSparkline)
  const hasNights = recentEntries.length > 0

  const nightButton = <SleepNightButton date={today} entry={todayEntry} />

  return (
    <Page>
      <PageHeader
        title={FEATURES.slaap.label}
        subtitle="Je slaapduur en eenvoudige inzichten, puur voor jezelf."
        actions={hasNights ? nightButton : undefined}
      />

      <PageSections>
        {!hasNights && (
          <EmptyState
            icon={Moon}
            title="Nog geen nachten ingevuld"
            description="Vul je bedtijd en opsta-tijd in. Dan zie je hier hoe je slaapt."
            action={nightButton}
          />
        )}

        {hasSummary && (
          <Card as="section" aria-label="Samenvatting van je slaap" className="flex flex-col gap-4">
            {average && (
              <p className="text-base text-ink">
                Je hebt de afgelopen {average.nights} nachten gemiddeld{" "}
                <span className="font-semibold">{formatSleepDuration(average.averageMinutes)}</span> geslapen.
              </p>
            )}
            {showSparkline && (
              <div>
                <p className="text-xs text-ink-soft mb-2">Slaapduur (uren)</p>
                <ValueSparkline
                  values={durationMinutes}
                  formatValue={(mins) => `${Math.round(mins / 60)}u`}
                  barClassName="bg-chart-1/80"
                  label={`Slaapduur van je laatste ${durationMinutes.length} nachten, van oud naar nieuw: ${listNl(
                    durationMinutes.map((mins) => formatSleepDuration(mins)),
                  )}`}
                />
              </div>
            )}
            {wakeFeelingInsight && <p className="text-sm text-ink-soft">{wakeFeelingInsight}</p>}
          </Card>
        )}

        {sleepSymptomInsights.length > 0 && (
          <section aria-labelledby="slaap-klachten">
            <SectionHeader id="slaap-klachten" title="Slaap en klachten" />
            <ul className="flex flex-col gap-3 max-w-prose">
              {sleepSymptomInsights.map((insight) => (
                <li key={insight.symptom} className="text-base text-ink-soft">
                  {formatSleepSymptomInsight(insight)}
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasNights && (
          <section aria-labelledby="laatste-nachten">
            <SectionHeader id="laatste-nachten" title="Laatste nachten" />
            <Card padding="none">
              <ul role="list" className="divide-y divide-line">
                {recentEntries.map((entry) => {
                  const mins =
                    entry.bedtime && entry.wake_time
                      ? computeSleepDurationMinutes(entry.bedtime, entry.wake_time)
                      : null
                  const feeling = entry.wake_feeling ? WAKE_FEELING_BY_VALUE.get(entry.wake_feeling) : null
                  return (
                    <li key={entry.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                      <p className="text-base font-medium text-ink capitalize">
                        {formatWeekdayDate(entry.date)}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-ink-soft">
                        {mins != null && <span>{formatSleepDuration(mins)}</span>}
                        {feeling && (
                          <>
                            <feeling.icon {...ICON.sm} aria-hidden />
                            <span className="sr-only">{feeling.label}</span>
                          </>
                        )}
                      </p>
                    </li>
                  )
                })}
              </ul>
            </Card>
          </section>
        )}

        <ListGroup label="Wat kan helpen">
          <ListRow
            href="/kennis/slaap-en-hormonen"
            icon={BookOpen}
            title="Slaap en hormonen"
            description="Kennis · hoe hormonen je slaap kunnen beïnvloeden"
          />
          {profile.mental_wellbeing_enabled === true && (
            <ListRow
              href={`${FEATURES.mentaleRust.href}/avondroutine-voor-diepe-ontspanning`}
              icon={FEATURES.mentaleRust.icon}
              title="Avondroutine voor diepe ontspanning"
              description="Mentale rust · 15 minuten"
            />
          )}
        </ListGroup>
      </PageSections>
    </Page>
  )
}
