import type { Metadata } from "next"
import { format, subDays } from "date-fns"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { DoctorSummaryClient } from "@/components/cycle/doctor-summary-client"
import { DoctorAppointmentsSection } from "@/components/cycle/doctor-appointments-section"
import { Page } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { FEATURES } from "@/lib/navigation/features"
import { getDoctorAppointments } from "@/lib/data/doctor-appointments"
import { computeCycleHistory, withActivePeriod } from "@/lib/cycle/history"
import { todayDate, todayISO } from "@/lib/dates/amsterdam"
import { parsePeriAnswers } from "@/lib/cycle/peri-score"

export const metadata: Metadata = { title: FEATURES.voorJeArts.label }

export default async function SamenvattingPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const supabase = await createClient()
  const since = subDays(new Date(), 24 * 7).toISOString().slice(0, 10)
  // Longer window for phase×symptom patterns (same idea as Cyclus hub).
  const patternSince = format(subDays(todayDate(), 200), "yyyy-MM-dd")

  const [
    { data: cycleProfile },
    { data: checkins },
    { data: patternCheckins },
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
      .from("daily_checkins")
      .select("date, symptoms")
      .eq("user_id", user.id)
      .gte("date", patternSince)
      .order("date", { ascending: false }),
    supabase
      .from("cycle_logs")
      .select("date, menstruation, symptoms, flow")
      .eq("user_id", user.id)
      .gte("date", patternSince)
      .order("date", { ascending: true }),
    supabase
      .from("peri_assessments")
      .select("assessed_on, score, answers, notes")
      .eq("user_id", user.id)
      .gte("assessed_on", since)
      .order("assessed_on", { ascending: false }),
    getDoctorAppointments(user.id),
  ])

  const today = todayISO()
  const effectiveLogs = withActivePeriod(
    (logs ?? []).map((l) => ({
      date: l.date,
      menstruation: l.menstruation,
      symptoms: l.symptoms ?? [],
      flow: l.flow,
    })),
    cycleProfile?.active_period_start ?? null,
    today,
  )
  const cycleHistory = computeCycleHistory(effectiveLogs)
  const menstruationDates = effectiveLogs.filter((l) => l.menstruation).map((l) => l.date)

  return (
    <Page>
      <PageHeader
        className="print:hidden"
        title={FEATURES.voorJeArts.label}
        subtitle="Een overzicht van wat je hebt bijgehouden — om sterker het gesprek in te gaan."
      />

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
                average_period_length: cycleProfile.average_period_length,
                regularity: cycleProfile.regularity,
                life_stage: cycleProfile.life_stage,
              }
            : null
        }
        menstruationDates={menstruationDates}
        periScores={(periScores ?? []).map((p) => ({
          assessed_on: p.assessed_on,
          score: p.score,
          answers: parsePeriAnswers(p.answers),
          notes: p.notes,
        }))}
        appointmentNotes={appointments
          .filter((a) => a.notes?.trim())
          .slice(0, 8)
          .map((a) => ({
            date: a.appointment_date,
            notes: a.notes!.trim(),
          }))}
        cycleHistory={cycleHistory}
        patternCheckins={(patternCheckins ?? []).map((c) => ({
          date: c.date,
          symptoms: c.symptoms ?? [],
        }))}
      >
        <DoctorAppointmentsSection appointments={appointments} />
      </DoctorSummaryClient>
    </Page>
  )
}
