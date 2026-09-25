import { Suspense } from "react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getVandaagData } from "@/lib/data/vandaag"
import { getDailyTip } from "@/lib/data/daily-tip"
import { TodayCards } from "@/components/today/today-cards"
import { CheckinForm } from "@/components/today/checkin-form"
import { NeedPicker } from "@/components/today/need-picker"
import { DailyTipCard } from "@/components/today/daily-tip-card"
import { ProgressCard } from "@/components/today/progress-card"
import type { CyclePhase } from "@/lib/cycle/estimate"
import { cn } from "@/lib/utils"
import { greeting } from "@/lib/greeting"

async function DailyTip({ promise }: { promise: ReturnType<typeof getDailyTip> }) {
  const dailyTip = await promise
  if (!dailyTip) return null
  return (
    <div>
      <h2 className="font-display text-lg text-ink mb-3">Kennis</h2>
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
  menstruatie: { bg: "bg-peach-soft", text: "text-ink", ring: "bg-white/70" },
  folliculair: { bg: "bg-sage-soft", text: "text-sage-dark", ring: "bg-white/70" },
  ovulatie: { bg: "bg-sage-soft", text: "text-sage-dark", ring: "bg-white/70" },
  luteaal: { bg: "bg-peach-soft", text: "text-ink", ring: "bg-white/70" },
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
  const dailyTipPromise = getDailyTip(today)

  const { profile, cycleEstimate, recommendation, checkin, streak, completedThisWeek } =
    await getVandaagData(user.id)
  const tone = cycleEstimate ? PHASE_TONE[cycleEstimate.phase] : null

  return (
    <div className="w-full max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      <div className="flex items-start justify-between gap-3 mb-5">
        <h1 className="font-display text-2xl lg:text-3xl text-ink">
          {greeting()}
          {profile?.name ? `, ${profile.name}` : ""} 🌿
        </h1>
        {streak >= 2 && (
          <div
            className="shrink-0 flex items-center gap-1 rounded-full bg-sage-soft text-sage-dark text-xs font-semibold px-2.5 py-1.5"
            title={`${streak} dagen op rij een check-in ingevuld`}
          >
            🔥 {streak}
          </div>
        )}
      </div>

      {cycleEstimate && tone ? (
        <div className={cn("rounded-3xl p-5 lg:p-6 flex items-center gap-4 lg:gap-5 mb-6 lg:mb-8", tone.bg)}>
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
          <div className="min-w-0">
            <p className={cn("text-sm font-semibold", tone.text)}>
              {cycleEstimate.phaseLabel} · schatting
            </p>
            <p className="text-sm text-ink-soft mt-0.5">{PHASE_TAGLINE[cycleEstimate.phase]}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-ink-soft mb-6 lg:mb-8">Fijn dat je er bent.</p>
      )}

      <div className="mb-6 lg:mb-8">
        <NeedPicker initialNeed={checkin?.need ?? null} />
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {recommendation && <TodayCards recommendation={recommendation} />}
          <CheckinForm initial={checkin ?? null} />
        </div>

        <div className="flex flex-col gap-6 mt-6 lg:mt-0">
          <ProgressCard
            completedThisWeek={completedThisWeek}
            weeklyGoal={profile?.training_frequency ?? null}
            streak={streak}
          />

          <Suspense fallback={<DailyTipSkeleton />}>
            <DailyTip promise={dailyTipPromise} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
