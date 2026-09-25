import { createClient } from "@/lib/supabase/server"
import { getVandaagData } from "@/lib/data/vandaag"
import { getDailyTip } from "@/lib/data/daily-tip"
import { TodayCards } from "@/components/today/today-cards"
import { CheckinForm } from "@/components/today/checkin-form"
import { DailyTipCard } from "@/components/today/daily-tip-card"
import { ProgressCard } from "@/components/today/progress-card"
import type { CyclePhase } from "@/lib/cycle/estimate"
import { cn } from "@/lib/utils"
import { greeting } from "@/lib/greeting"

const PHASE_TONE: Record<CyclePhase, { bg: string; text: string; dot: string }> = {
  menstruatie: { bg: "bg-peach-soft", text: "text-ink", dot: "bg-peach" },
  folliculair: { bg: "bg-sage-soft", text: "text-sage-dark", dot: "bg-sage" },
  ovulatie: { bg: "bg-sage-soft", text: "text-sage-dark", dot: "bg-sage-dark" },
  luteaal: { bg: "bg-peach-soft", text: "text-ink", dot: "bg-peach" },
}

export default async function VandaagPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { profile, cycleEstimate, recommendation, checkin, streak, completedThisWeek, today } =
    await getVandaagData(user.id)
  const dailyTip = await getDailyTip(today)
  const tone = cycleEstimate ? PHASE_TONE[cycleEstimate.phase] : null

  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      <div className="flex items-start justify-between gap-3 mb-6 lg:mb-8">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-ink">
            {greeting()}
            {profile?.name ? `, ${profile.name}` : ""} 🌿
          </h1>
          {cycleEstimate && tone ? (
            <div
              className={cn(
                "inline-flex items-center gap-1.5 mt-2 rounded-full px-2.5 py-1 text-xs font-medium",
                tone.bg,
                tone.text,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
              Cyclusdag {cycleEstimate.cycleDay} · {cycleEstimate.phaseLabel} · schatting
            </div>
          ) : (
            <p className="text-sm text-ink-soft mt-1">Fijn dat je er bent.</p>
          )}
        </div>
        {streak >= 2 && (
          <div
            className="shrink-0 flex items-center gap-1 rounded-full bg-sage-soft text-sage-dark text-xs font-semibold px-2.5 py-1.5"
            title={`${streak} dagen op rij een check-in ingevuld`}
          >
            🔥 {streak}
          </div>
        )}
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

          {dailyTip && (
            <div>
              <h2 className="font-display text-lg text-ink mb-3">Kennis</h2>
              <DailyTipCard tip={dailyTip} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
