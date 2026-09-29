import Link from "next/link"
import { Moon } from "lucide-react"
import { format, parseISO, subDays } from "date-fns"
import { nl } from "date-fns/locale"
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
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { buttonVariants } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { ValueSparkline } from "@/components/cycle/simple-bars"

const PATTERN_WINDOW_DAYS = 60
const DISPLAYED_NIGHTS = 14

const WAKE_FEELING_BY_VALUE = new Map<string, (typeof WAKE_FEELING_OPTIONS)[number]>(
  WAKE_FEELING_OPTIONS.map((o) => [o.value, o]),
)

export default async function SlaapPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const profile = await getProfile(user.id)

  if (!profile || profile.sleep_tracking_enabled !== true) {
    return (
      <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
        <BackButton href="/vandaag" label="Vandaag" />
        <h1 className="font-display text-2xl lg:text-3xl text-ink mb-1">Slaap</h1>
        <p className="text-sm text-ink-soft mb-6">Je slaapduur en eenvoudige inzichten.</p>
        <Card>
          <EmptyState
            icon={<Moon className="h-8 w-8" strokeWidth={1.5} />}
            title="Slaap bijhouden staat nu uit"
            description="Je ziet hierdoor nergens slaapvragen of slaapkaarten. Wil je dit toch gebruiken?"
            action={
              <Link href="/profiel/gebruik#slaap" className={buttonVariants({ variant: "secondary" })}>
                Zet aan in mijn profiel
              </Link>
            }
          />
        </Card>
      </div>
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

  const average = computeAverageSleepDuration(entries)
  const wakeFeelingInsight = computeSleepWakeFeelingInsight(entries)
  const sleepSymptomInsights = computeSleepSymptomInsights(entries, checkins ?? []).slice(0, 2)
  const recentEntries = [...entries].reverse().slice(0, DISPLAYED_NIGHTS) // newest first for the list

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      <BackButton href="/vandaag" label="Vandaag" />

      <h1 className="font-display text-2xl text-ink mb-1">Slaap</h1>
      <p className="text-sm text-ink-soft mb-6">Je slaapduur en eenvoudige inzichten, puur voor jezelf.</p>

      {(average || wakeFeelingInsight || sleepSymptomInsights.length > 0) && (
        <div className="flex flex-col gap-3 mb-6">
          {average && (
            <Card className="bg-sage-soft border-transparent">
              <p className="text-base text-ink leading-relaxed">
                Je hebt de afgelopen {average.nights} nachten gemiddeld{" "}
                <span className="font-semibold">{formatSleepDuration(average.averageMinutes)}</span> geslapen.
              </p>
            </Card>
          )}
          {wakeFeelingInsight && (
            <Card>
              <p className="text-base text-ink-soft leading-relaxed">{wakeFeelingInsight}</p>
            </Card>
          )}
          {sleepSymptomInsights.length > 0 && (
            <div>
              <h2 className="font-display text-lg text-ink mb-3">Slaap & klachten</h2>
              <Card className="p-0 divide-y divide-line">
                {sleepSymptomInsights.map((insight) => (
                  <p key={insight.symptom} className="text-base text-ink-soft leading-relaxed px-5 py-3.5">
                    {formatSleepSymptomInsight(insight)}
                  </p>
                ))}
              </Card>
            </div>
          )}
        </div>
      )}

      <h2 className="font-display text-lg text-ink mb-3">Laatste nachten</h2>
      {recentEntries.length ? (
        <>
          {(() => {
            // Chronological (oldest → newest) for a natural left-to-right rhythm.
            const durationMinutes = [...recentEntries]
              .reverse()
              .filter((e) => e.bedtime && e.wake_time)
              .map((e) => computeSleepDurationMinutes(e.bedtime!, e.wake_time!))
            if (durationMinutes.length < 2) return null
            return (
              <Card className="mb-3">
                <p className="text-xs text-ink-soft mb-2">Slaapduur (uren)</p>
                <ValueSparkline
                  values={durationMinutes}
                  formatValue={(mins) => `${Math.round(mins / 60)}u`}
                  barClassName="bg-chart-1/80"
                />
              </Card>
            )
          })()}
          <Card className="p-0 divide-y divide-line">
            {recentEntries.map((entry) => {
              const hasDuration = Boolean(entry.bedtime && entry.wake_time)
              const feeling = entry.wake_feeling ? WAKE_FEELING_BY_VALUE.get(entry.wake_feeling) : null
              return (
                <div key={entry.id} className="flex items-center justify-between px-5 py-3.5">
                  <p className="text-sm font-medium text-ink capitalize">
                    {format(parseISO(entry.date), "EEEE d MMM", { locale: nl })}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-ink-soft">
                    {hasDuration && (
                      <span>
                        {formatSleepDuration(
                          computeSleepDurationMinutes(entry.bedtime!, entry.wake_time!),
                        )}
                      </span>
                    )}
                    {feeling && <feeling.icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
                  </div>
                </div>
              )
            })}
          </Card>
        </>
      ) : (
        <EmptyState
          icon={<Moon className="h-6 w-6" />}
          title="Nog geen nachten ingevuld"
          description="Vul op Vandaag je bedtijd en opsta-tijd in om je slaap bij te houden."
        />
      )}
    </div>
  )
}
