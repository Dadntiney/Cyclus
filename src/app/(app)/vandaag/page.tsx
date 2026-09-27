import { Suspense } from "react"
import Link from "next/link"
import { BookOpen, ChevronRight, ClipboardList, NotebookPen } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getVandaagData } from "@/lib/data/vandaag"
import { getDailyTip } from "@/lib/data/daily-tip"
import { TodayCards } from "@/components/today/today-cards"
import { CheckinForm } from "@/components/today/checkin-form"
import { NeedPicker } from "@/components/today/need-picker"
import { DailyTipCard } from "@/components/today/daily-tip-card"
import { ProgressCard } from "@/components/today/progress-card"
import { BuddyQuoteCard } from "@/components/today/buddy-quote-card"
import { MedicationTodayCard } from "@/components/today/medication-today-card"
import { MentalWellbeingSuggestionCard } from "@/components/today/mental-wellbeing-suggestion-card"
import { SleepCard } from "@/components/sleep/sleep-card"
import { MenstruationQuickAction } from "@/components/cycle/menstruation-quick-action"
import { PullToRefresh } from "@/components/ui/pull-to-refresh"
import type { CyclePhase } from "@/lib/cycle/estimate"
import { getDailyBuddyQuote } from "@/lib/data/buddy-quotes"
import { shouldShowBuddyMessage, type BuddyStyle } from "@/lib/buddy/styles"
import { cn } from "@/lib/utils"
import { greeting } from "@/lib/greeting"

async function DailyTip({
  today,
  userId,
  goals,
  recentSymptoms,
}: {
  today: string
  userId: string
  goals: string[] | null | undefined
  recentSymptoms: string[] | null | undefined
}) {
  const dailyTip = await getDailyTip(today, { userId, goals, recentSymptoms })
  if (!dailyTip) return null
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg text-ink">Kennis</h2>
        <Link href="/kennis" className="text-xs font-medium text-sage-dark touch-manipulation">
          Alles
        </Link>
      </div>
      <DailyTipCard tip={dailyTip} />
    </div>
  )
}

function DailyTipSkeleton() {
  return (
    <div>
      <h2 className="font-display text-lg text-ink mb-3">Kennis</h2>
      <div className="rounded-3xl bg-cream-soft h-32 animate-pulse" />
    </div>
  )
}

const PHASE_TONE: Record<CyclePhase, { bg: string; text: string; ring: string }> = {
  menstruatie: { bg: "bg-peach-soft", text: "text-ink", ring: "bg-surface/70" },
  folliculair: { bg: "bg-sage-soft", text: "text-sage-dark", ring: "bg-surface/70" },
  ovulatie: { bg: "bg-sage-soft", text: "text-sage-dark", ring: "bg-surface/70" },
  luteaal: { bg: "bg-peach-soft", text: "text-ink", ring: "bg-surface/70" },
}

const PHASE_TAGLINE: Record<CyclePhase, string> = {
  menstruatie: "Een moment om het rustiger aan te doen.",
  folliculair: "Je energie bouwt zich vaak op in deze fase.",
  ovulatie: "Voor veel vrouwen een piek in energie.",
  luteaal: "Je lichaam bouwt rustig toe naar rust.",
}

export default async function VandaagPage() {
  const user = await getAuthedUser()

  if (!user) return null

  const today = new Date().toISOString().slice(0, 10)

  const {
    profile,
    cycleProfile,
    cycleEstimate,
    isMenstruationActive,
    menstruationDay,
    recommendation,
    checkin,
    streak,
    completedThisWeek,
    medicationItems,
    mentalWellbeingSuggestion,
    sleepEntry,
    sleepObservation,
  } = await getVandaagData(user.id)
  const showMenstruationQuickAction = Boolean(cycleProfile?.has_cycle)
  const showMedicationCard = Boolean(profile?.show_medication_on_dashboard) && medicationItems.length > 0
  const tone = cycleEstimate ? PHASE_TONE[cycleEstimate.phase] : null
  const preferredStyles = (profile?.buddy_styles ?? []) as BuddyStyle[]
  const buddyQuote = getDailyBuddyQuote(`${user.id}-${today}`, cycleEstimate?.phase ?? null, preferredStyles)
  const showBuddyQuote = shouldShowBuddyMessage(
    `${user.id}-${today}-vandaag`,
    profile?.buddy_message_frequency ?? null,
    cycleEstimate !== null,
  )

  return (
    <PullToRefresh>
      <div className="w-full max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
        <h1 className="font-display text-2xl lg:text-3xl text-ink mb-4">
          {greeting()}
          {profile?.name ? `, ${profile.name}` : ""} 🌿
        </h1>

        <div className="flex flex-col gap-4 mb-6 lg:mb-8">
          {cycleEstimate && tone ? (
            <Link
              href="/cyclus/vandaag"
              className={cn(
                "rounded-3xl p-5 lg:p-6 flex items-center gap-4 lg:gap-5 touch-manipulation motion-safe:active:scale-[0.99] transition-transform",
                tone.bg,
              )}
            >
              <div
                className={cn(
                  "shrink-0 h-20 w-20 lg:h-24 lg:w-24 rounded-full flex flex-col items-center justify-center",
                  tone.ring,
                )}
              >
                <span className={cn("font-display text-3xl lg:text-4xl leading-none", tone.text)}>
                  {cycleEstimate.cycleDay}
                </span>
                <span className="text-[10px] text-ink-soft mt-1">cyclusdag</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-semibold", tone.text)}>
                  {cycleEstimate.phaseLabel} · schatting
                </p>
                <p className="text-sm text-ink-soft mt-0.5">{PHASE_TAGLINE[cycleEstimate.phase]}</p>
                <p className={cn("text-xs font-medium mt-1.5 inline-flex items-center gap-0.5", tone.text)}>
                  Wat betekent dit voor jou?
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                </p>
              </div>
            </Link>
          ) : (
            <p className="text-sm text-ink-soft">Fijn dat je er bent.</p>
          )}

          {showMenstruationQuickAction && (
            <MenstruationQuickAction isActive={isMenstruationActive} day={menstruationDay} />
          )}

          {showBuddyQuote && <BuddyQuoteCard quote={buddyQuote} />}

          {mentalWellbeingSuggestion && (
            <MentalWellbeingSuggestionCard suggestion={mentalWellbeingSuggestion} />
          )}

          <Link
            href="/deze-week"
            className="flex items-center justify-between rounded-2xl bg-surface border border-line/70 px-4 py-3.5 touch-manipulation"
          >
            <span className="text-sm font-medium text-ink">📆 Bekijk je hele week</span>
            <ChevronRight className="h-4 w-4 text-ink-soft" strokeWidth={1.75} />
          </Link>

          <NeedPicker initialNeed={checkin?.need ?? null} />
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
          <div className="flex flex-col gap-5 lg:col-span-2">
            {recommendation && <TodayCards recommendation={recommendation} />}
            <CheckinForm initial={checkin ?? null} mentalWellbeingEnabled={profile?.mental_wellbeing_enabled === true} />
          </div>

          <div className="flex flex-col gap-5 mt-5 lg:mt-0">
            {profile?.sleep_tracking_enabled === true && (
              <div>
                <SleepCard date={today} entry={sleepEntry} />
                {sleepObservation && <p className="text-xs text-ink-soft mt-2 px-1 leading-relaxed">{sleepObservation}</p>}
                <Link href="/slaap" className="text-xs font-medium text-sage-dark mt-2 px-1 inline-block touch-manipulation">
                  Bekijk slaapgeschiedenis
                </Link>
              </div>
            )}

            <ProgressCard
              completedThisWeek={completedThisWeek}
              weeklyGoal={profile?.training_frequency ?? null}
              streak={streak}
              movementEnabled={profile?.movement_enabled ?? true}
            />

            {showMedicationCard && <MedicationTodayCard items={medicationItems} date={today} />}

            <Suspense fallback={<DailyTipSkeleton />}>
              <DailyTip
                today={today}
                userId={user.id}
                goals={profile?.goals}
                recentSymptoms={checkin?.symptoms}
              />
            </Suspense>

            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/kennis"
                className="rounded-2xl bg-cream-soft px-2 py-2.5 text-center text-xs font-medium text-ink touch-manipulation"
              >
                <BookOpen className="h-4 w-4 mx-auto mb-1 text-sage-dark" />
                Kennis
              </Link>
              <Link
                href="/dagboek"
                className="rounded-2xl bg-cream-soft px-2 py-2.5 text-center text-xs font-medium text-ink touch-manipulation"
              >
                <NotebookPen className="h-4 w-4 mx-auto mb-1 text-sage-dark" />
                Dagboek
              </Link>
              <Link
                href="/cyclus/samenvatting"
                className="rounded-2xl bg-cream-soft px-2 py-2.5 text-center text-xs font-medium text-ink touch-manipulation"
              >
                <ClipboardList className="h-4 w-4 mx-auto mb-1 text-sage-dark" />
                Voor arts
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PullToRefresh>
  )
}
