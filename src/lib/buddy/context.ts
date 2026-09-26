import { createClient } from "@/lib/supabase/server"
import { estimateCycle } from "@/lib/cycle/estimate"
import { computeCycleHistory, getEffectiveLastPeriodStart } from "@/lib/cycle/history"
import { computePhaseSymptomInsights, getTopPhaseSymptomInsight } from "@/lib/cycle/patterns"
import { startOfWeek, subDays } from "date-fns"

export async function buildBuddyContext(userId: string): Promise<string[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString().slice(0, 10)
  const sixMonthsAgo = subDays(new Date(), 200).toISOString().slice(0, 10)

  const [
    { data: profile },
    { data: cycleProfile },
    { data: checkin },
    { data: weekSessions },
    { data: recentCheckins },
    { data: logs },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("cycle_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("daily_checkins").select("*").eq("user_id", userId).eq("date", today).maybeSingle(),
    supabase
      .from("workout_sessions")
      .select("id, completed")
      .eq("user_id", userId)
      .gte("date", weekStart)
      .eq("completed", true),
    supabase.from("daily_checkins").select("date, symptoms").eq("user_id", userId).gte("date", sixMonthsAgo),
    supabase
      .from("cycle_logs")
      .select("date, menstruation, symptoms")
      .eq("user_id", userId)
      .gte("date", sixMonthsAgo)
      .order("date", { ascending: true }),
  ])

  const lines: string[] = []

  if (profile?.name) lines.push(`Naam: ${profile.name}`)
  if (profile?.age) lines.push(`Leeftijd: ${profile.age}`)
  if (profile?.goals?.length) lines.push(`Doelen: ${profile.goals.join(", ")}`)
  if (profile?.movement_enabled === false) {
    lines.push("Gebruikt het Bewegen-onderdeel van de app niet — vermijd trainingsadvies tenzij ze er zelf naar vraagt.")
  } else if (profile?.training_preferences?.length) {
    lines.push(`Bewegingsvoorkeuren: ${profile.training_preferences.join(", ")}`)
  }
  if (profile?.nutrition_enabled === false) {
    lines.push("Gebruikt het Voeding-onderdeel van de app niet — vermijd voedingsadvies tenzij ze er zelf naar vraagt.")
  } else if (profile?.nutrition_preferences?.length) {
    lines.push(`Voedingsvoorkeuren: ${profile.nutrition_preferences.join(", ")}`)
  }
  if (profile?.wellness_preference) lines.push(`Voedings-/bewegingsstijl: ${profile.wellness_preference}`)
  if (profile?.buddy_styles?.length) lines.push(`Buddy-stijl (toon-voorkeur): ${profile.buddy_styles.join(", ")}`)

  const cycleHistory = computeCycleHistory(
    (logs ?? []).map((l) => ({ date: l.date, menstruation: l.menstruation, symptoms: l.symptoms })),
  )
  const cycleEstimate = cycleProfile
    ? estimateCycle(
        getEffectiveLastPeriodStart(cycleProfile.last_period_start, cycleHistory),
        cycleProfile.average_cycle_length,
        cycleProfile.has_cycle,
      )
    : null
  if (cycleEstimate) {
    lines.push(`Cyclusdag ${cycleEstimate.cycleDay} (${cycleEstimate.phaseLabel}, schatting)`)

    const insight = getTopPhaseSymptomInsight(
      computePhaseSymptomInsights(cycleHistory, recentCheckins ?? []),
      cycleEstimate.phase,
    )
    if (insight) {
      lines.push(
        `Herkend patroon: bij ${insight.cyclesWithSymptom} van haar laatste ${insight.cyclesConsidered} cycli gaf ze "${insight.symptom.toLowerCase()}" vaker aan rond de ${cycleEstimate.phaseLabel.toLowerCase()} — je mag hier subtiel naar verwijzen als het gesprek daar natuurlijk toe leidt, maar dring het niet op.`,
      )
    }
  } else if (cycleProfile && !cycleProfile.has_cycle) {
    lines.push("Heeft momenteel geen menstruatiecyclus.")
  }
  if (cycleProfile?.perimenopause_information) {
    lines.push(`Overgangsinformatie: ${cycleProfile.perimenopause_information}`)
  }

  if (checkin) {
    const parts: string[] = []
    if (checkin.energy) parts.push(`energie ${checkin.energy}/5`)
    if (checkin.mood) parts.push(`stemming ${checkin.mood}/5`)
    if (checkin.sleep) parts.push(`slaap ${checkin.sleep}/5`)
    if (checkin.stress) parts.push(`stress ${checkin.stress}/5`)
    if (parts.length) lines.push(`Laatste check-in: ${parts.join(", ")}`)
    if (checkin.symptoms?.length) lines.push(`Klachten: ${checkin.symptoms.join(", ")}`)
  }

  if (profile?.movement_enabled !== false) {
    lines.push(`Trainingen deze week afgerond: ${weekSessions?.length ?? 0}`)
  }

  return lines
}
