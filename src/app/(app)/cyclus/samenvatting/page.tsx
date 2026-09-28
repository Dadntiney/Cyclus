import { subDays } from "date-fns"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { DoctorSummaryClient } from "@/components/cycle/doctor-summary-client"
import { BackButton } from "@/components/ui/back-button"

export default async function SamenvattingPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const supabase = await createClient()
  const since = subDays(new Date(), 24 * 7).toISOString().slice(0, 10)

  const [{ data: cycleProfile }, { data: checkins }, { data: logs }, { data: periScores }] =
    await Promise.all([
      supabase.from("cycle_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("daily_checkins")
        .select("date, energy, mood, sleep, stress, symptoms, notes")
        .eq("user_id", user.id)
        .gte("date", since)
        .order("date", { ascending: false }),
      supabase
        .from("cycle_logs")
        .select("date, menstruation")
        .eq("user_id", user.id)
        .gte("date", since)
        .eq("menstruation", true),
      supabase
        .from("peri_assessments")
        .select("assessed_on, score")
        .eq("user_id", user.id)
        .gte("assessed_on", since)
        .order("assessed_on", { ascending: false }),
    ])

  return (
    <div className="w-full max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6">
      <div className="print:hidden">
        <BackButton href="/cyclus" label="Cyclus" />
        <h1 className="font-display text-2xl lg:text-3xl text-ink mt-3">Voor je arts</h1>
        <p className="text-sm text-ink-soft mt-1">
          Een overzicht van wat je hebt bijgehouden — om sterker het gesprek in te gaan.
        </p>
      </div>

      <DoctorSummaryClient
        checkins={(checkins ?? []).map((c) => ({
          ...c,
          symptoms: c.symptoms ?? [],
        }))}
        cycleProfile={
          cycleProfile
            ? {
                has_cycle: cycleProfile.has_cycle,
                last_period_start: cycleProfile.last_period_start,
                average_cycle_length: cycleProfile.average_cycle_length,
                regularity: cycleProfile.regularity,
                life_stage: cycleProfile.life_stage,
              }
            : null
        }
        menstruationDates={(logs ?? []).map((l) => l.date)}
        periScores={periScores ?? []}
      />
    </div>
  )
}
