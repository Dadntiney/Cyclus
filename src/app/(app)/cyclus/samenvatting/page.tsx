import { subDays } from "date-fns"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { DoctorSummaryClient } from "@/components/cycle/doctor-summary-client"
import { DoctorAppointmentsSection } from "@/components/cycle/doctor-appointments-section"
import { BackButton } from "@/components/ui/back-button"
import { getDoctorAppointments } from "@/lib/data/doctor-appointments"

export default async function SamenvattingPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const supabase = await createClient()
  const since = subDays(new Date(), 24 * 7).toISOString().slice(0, 10)

  const [
    { data: cycleProfile },
    { data: checkins },
    { data: logs },
    { data: periScores },
    appointments,
  ] = await Promise.all([
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
    getDoctorAppointments(user.id),
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

      <DoctorAppointmentsSection appointments={appointments} />

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
        appointmentNotes={appointments
          .filter((a) => a.notes?.trim())
          .slice(0, 8)
          .map((a) => ({
            date: a.appointment_date,
            notes: a.notes!.trim(),
          }))}
      />
    </div>
  )
}
