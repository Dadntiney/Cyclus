import Link from "next/link"
import { ChevronLeft, Moon } from "lucide-react"
import { format, parseISO } from "date-fns"
import { nl } from "date-fns/locale"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { getSleepHistory } from "@/lib/data/sleep"
import { computeSleepDurationMinutes, formatSleepDuration } from "@/lib/sleep/duration"
import { computeAverageSleepDuration, computeSleepWakeFeelingInsight } from "@/lib/sleep/insights"
import { WAKE_FEELING_OPTIONS } from "@/lib/constants"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { buttonVariants } from "@/components/ui/button"

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
        <h1 className="font-display text-2xl lg:text-3xl text-ink mb-1">Slaap</h1>
        <p className="text-sm text-ink-soft mb-6">Je slaapduur en eenvoudige inzichten.</p>
        <Card className="text-center py-8">
          <p className="text-3xl mb-3">🌙</p>
          <p className="font-display text-lg text-ink mb-2">Slaap bijhouden staat nu uit</p>
          <p className="text-sm text-ink-soft mb-5 max-w-sm mx-auto">
            Je gaf aan dat je dit op dit moment niet wilt bijhouden. Dat is helemaal prima — je ziet
            hierdoor nergens slaapvragen of slaapkaarten. Wil je dit toch gebruiken?
          </p>
          <Link href="/profiel#slaap" className={buttonVariants()}>
            Zet aan in mijn profiel
          </Link>
        </Card>
      </div>
    )
  }

  const entries = await getSleepHistory(user.id, 14)
  const average = computeAverageSleepDuration(entries)
  const wakeFeelingInsight = computeSleepWakeFeelingInsight(entries)
  const recentEntries = [...entries].reverse() // newest first for the list

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      <Link
        href="/vandaag"
        className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft mb-4 touch-manipulation"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        Vandaag
      </Link>

      <h1 className="font-display text-2xl text-ink mb-1">Slaap</h1>
      <p className="text-sm text-ink-soft mb-6">Je slaapduur en eenvoudige inzichten, puur voor jezelf.</p>

      {(average || wakeFeelingInsight) && (
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
        </div>
      )}

      <h2 className="font-display text-lg text-ink mb-3">Laatste nachten</h2>
      {recentEntries.length ? (
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
                  {hasDuration && <span>{formatSleepDuration(computeSleepDurationMinutes(entry.bedtime!, entry.wake_time!))}</span>}
                  {feeling && <span aria-hidden>{feeling.emoji}</span>}
                </div>
              </div>
            )
          })}
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={<Moon className="h-6 w-6" />}
            title="Nog geen nachten ingevuld."
            description="Vul op Vandaag je bedtijd en opsta-tijd in om je slaap bij te houden."
          />
        </Card>
      )}
    </div>
  )
}
