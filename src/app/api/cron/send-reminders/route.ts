import { NextResponse, type NextRequest } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { sendPushToUser } from "@/lib/push/send"
import { isReminderDueToday, isoWeekday, type ReminderLike } from "@/lib/client/reminder-scheduler"
import { isDosingDay, isScheduleStartDay, isScheduleStopDay, type MedicationSchedule } from "@/lib/medication/schedule"
import { resolveReminderText } from "@/lib/buddy/reminder-labels"
import { getMorningMessage } from "@/lib/data/morning-messages"
import { REMINDER_TYPE_OPTIONS, type MorningReminderContentType } from "@/lib/constants"
import { todayDate, todayISO } from "@/lib/dates/amsterdam"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Cyclus is a Dutch-market app with no per-profile timezone setting yet, so
// "today" is computed in Europe/Amsterdam (correctly handling CET/CEST)
// rather than the server's UTC clock.
//
// Important, honest limitation: this project is on Vercel's Hobby plan,
// which only allows a cron job to run once a day (see vercel.json) — not
// every few minutes. So unlike the in-app toast (getDueReminders, which
// still matches her exact chosen time while Cyclus is open), this route
// can't fire "at 20:00" for an evening reminder. Instead it sends once
// daily, at this cron's fixed time, for whatever is enabled and scheduled
// for today — a day-level match, not a time-of-day match. Upgrading to
// Vercel Pro and tightening vercel.json's schedule (e.g. every 15 minutes)
// is what would be needed for exact per-user times.
function todayInTimezone(): { date: Date; dateISO: string } {
  return { date: todayDate(), dateISO: todayISO() }
}

const REMINDER_TYPE_URL: Record<string, string> = {
  dagelijkse_checkin: "/vandaag",
  symptomen: "/vandaag",
  beweging: "/training",
  voeding: "/voeding",
  cyclus: "/cyclus",
  herstel: "/vandaag",
  routine: "/vandaag",
  mentale_ondersteuning: "/mentale-rust",
  anders: "/vandaag",
}

interface LogRow {
  source_type: string
  source_id: string
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const service = createServiceClient()
  const { date: today, dateISO } = todayInTimezone()
  const weekday = isoWeekday(today)

  const { data: subscribedUserRows } = await service.from("push_subscriptions").select("user_id")
  const userIds = [...new Set((subscribedUserRows ?? []).map((r) => r.user_id))]

  let notificationsSent = 0
  let usersProcessed = 0

  if (userIds.length === 0) {
    return NextResponse.json({ ok: true, usersChecked: 0, usersNotified: 0, notificationsSent: 0 })
  }

  // One round-trip per table (not per user) — avoids N+1 as the subscriber
  // count grows. Sends below still run per user; the expensive reads don't.
  const [
    { data: profileRows },
    { data: allReminderRows },
    { data: allMedicationRows },
    { data: allDoctorAppointmentRows },
    { data: allLogRows },
  ] = await Promise.all([
    service
      .from("profiles")
      .select(
        "id, buddy_styles, nutrition_enabled, movement_enabled, mental_wellbeing_enabled, morning_reminder_enabled, morning_reminder_time, morning_reminder_days, morning_reminder_content_types",
      )
      .in("id", userIds),
    service.from("reminders").select("*").in("user_id", userIds).eq("enabled", true),
    service
      .from("medications")
      .select(
        "id, user_id, name, reminder_enabled, time_of_day, schedule_type, schedule_days, schedule_days_on, schedule_days_off, start_date, end_date, remind_on_start, remind_daily, remind_on_stop",
      )
      .in("user_id", userIds)
      .eq("reminder_enabled", true),
    service
      .from("doctor_appointments")
      .select("id, user_id, appointment_date, notes, reminder_enabled, reminder_time")
      .in("user_id", userIds)
      .eq("reminder_enabled", true)
      .eq("appointment_date", dateISO),
    service
      .from("push_notification_log")
      .select("user_id, source_type, source_id")
      .in("user_id", userIds)
      .eq("date", dateISO),
  ])

  const profileById = new Map((profileRows ?? []).map((p) => [p.id, p]))
  const remindersByUser = new Map<string, NonNullable<typeof allReminderRows>>()
  for (const row of allReminderRows ?? []) {
    const list = remindersByUser.get(row.user_id) ?? []
    list.push(row)
    remindersByUser.set(row.user_id, list)
  }
  const medicationsByUser = new Map<string, NonNullable<typeof allMedicationRows>>()
  for (const row of allMedicationRows ?? []) {
    const list = medicationsByUser.get(row.user_id) ?? []
    list.push(row)
    medicationsByUser.set(row.user_id, list)
  }
  const doctorAppointmentsByUser = new Map<string, NonNullable<typeof allDoctorAppointmentRows>>()
  for (const row of allDoctorAppointmentRows ?? []) {
    const list = doctorAppointmentsByUser.get(row.user_id) ?? []
    list.push(row)
    doctorAppointmentsByUser.set(row.user_id, list)
  }
  const logsByUser = new Map<string, LogRow[]>()
  for (const row of allLogRows ?? []) {
    const list = logsByUser.get(row.user_id) ?? []
    list.push({ source_type: row.source_type, source_id: row.source_id })
    logsByUser.set(row.user_id, list)
  }

  for (const userId of userIds) {
    try {
      const profile = profileById.get(userId) ?? null
      const reminderRows = remindersByUser.get(userId) ?? []
      const medicationRows = medicationsByUser.get(userId) ?? []
      const doctorAppointmentRows = doctorAppointmentsByUser.get(userId) ?? []
      const logRows = logsByUser.get(userId) ?? []

      const alreadySent = new Set(logRows.map((l) => `${l.source_type}:${l.source_id}`))
      const buddyStyles = profile?.buddy_styles ?? []
      let userHasSend = false

      // ---- Generic reminders (check-in, movement, nutrition, cycle, rest, routine, custom) ----
      const reminders: ReminderLike[] = reminderRows.map((r) => ({
        id: r.id,
        type: r.type,
        label: r.label,
        enabled: r.enabled,
        days: r.days,
        time: r.time,
      }))
      const dueReminders = reminders.filter((r) => {
        if (!isReminderDueToday(r, weekday)) return false
        if (alreadySent.has(`reminder:${r.id}`)) return false
        if (r.type === "voeding" && profile?.nutrition_enabled === false) return false
        if (r.type === "beweging" && profile?.movement_enabled === false) return false
        if (r.type === "mentale_ondersteuning" && profile?.mental_wellbeing_enabled !== true) return false
        return true
      })

      for (const reminder of dueReminders) {
        const typeOption = REMINDER_TYPE_OPTIONS.find((t) => t.value === reminder.type)
        const text = resolveReminderText(
          reminder.type,
          reminder.label,
          typeOption?.defaultLabel ?? "",
          buddyStyles,
          `${reminder.id}-${dateISO}`,
        )
        const { sent } = await sendPushToUser(userId, {
          title: "Cyclus",
          body: text,
          url: REMINDER_TYPE_URL[reminder.type] ?? "/vandaag",
          tag: `reminder-${reminder.id}`,
        })
        if (sent > 0) userHasSend = true
        await service
          .from("push_notification_log")
          .upsert({ user_id: userId, source_type: "reminder", source_id: reminder.id, date: dateISO }, { onConflict: "source_type,source_id,date" })
        notificationsSent += sent
      }

      // ---- Medication reminders (daily / cyclisch start / cyclisch stop) ----
      const dueMedications = (medicationRows ?? []).filter((m) => {
        const schedule: MedicationSchedule = {
          scheduleType: m.schedule_type as MedicationSchedule["scheduleType"],
          scheduleDays: m.schedule_days,
          scheduleDaysOn: m.schedule_days_on,
          scheduleDaysOff: m.schedule_days_off,
          startDate: m.start_date,
          endDate: m.end_date,
        }
        const isStop = isScheduleStopDay(schedule, today)
        // false = a computed "off" day, stay silent — except on a
        // user-chosen stop date. true or null (e.g. "eigen schema") still remind.
        if (isDosingDay(schedule, today) === false && !isStop) return false
        return !alreadySent.has(`medication_daily:${m.id}`) && !alreadySent.has(`medication_start:${m.id}`) && !alreadySent.has(`medication_stop:${m.id}`)
      })

      for (const m of dueMedications) {
        const schedule: MedicationSchedule = {
          scheduleType: m.schedule_type as MedicationSchedule["scheduleType"],
          scheduleDays: m.schedule_days,
          scheduleDaysOn: m.schedule_days_on,
          scheduleDaysOff: m.schedule_days_off,
          startDate: m.start_date,
          endDate: m.end_date,
        }
        const isStart = isScheduleStartDay(schedule, today)
        const isStop = !isStart && isScheduleStopDay(schedule, today)

        // Independently toggleable per "cyclisch" event type (see the
        // medicatie-instellingen) — skip sending (and logging) entirely
        // when she turned off this specific moment. Stop only fires when
        // she filled in an optional end date (isScheduleStopDay).
        if (isStart && !m.remind_on_start) continue
        if (isStop && !m.remind_on_stop) continue
        if (!isStart && !isStop && !m.remind_daily) continue

        // Deliberately generic on the lock screen — never the medication's
        // name, hormone or dosage in a push preview (see privacy section of
        // the audit brief). The in-app toast may be specific; this may not.
        const { title, body, sourceType } = isStart
          ? { title: "Je schema start weer", body: "Vandaag begint het schema dat je zelf hebt ingesteld.", sourceType: "medication_start" }
          : isStop
            ? { title: "Je schema eindigt vandaag", body: "De periode die je had ingesteld eindigt vandaag.", sourceType: "medication_stop" }
            : { title: "Cyclus", body: "Je hebt een herinnering van Cyclus.", sourceType: "medication_daily" }

        const { sent } = await sendPushToUser(userId, {
          title,
          body,
          url: `/medicatie/${m.id}`,
          tag: `medication-${m.id}`,
        })
        if (sent > 0) userHasSend = true
        await service
          .from("push_notification_log")
          .upsert({ user_id: userId, source_type: sourceType, source_id: m.id, date: dateISO }, { onConflict: "source_type,source_id,date" })
        notificationsSent += sent
      }

      // ---- Doctor appointment reminders (one-shot on appointment date) ----
      for (const appt of doctorAppointmentRows) {
        if (alreadySent.has(`doctor_appointment:${appt.id}`)) continue
        // Generic on the lock screen — no free-text visit notes in push preview.
        const { sent } = await sendPushToUser(userId, {
          title: "Cyclus",
          body: "Je hebt vandaag een artsafspraak genoteerd.",
          url: "/cyclus/samenvatting",
          tag: `doctor-appointment-${appt.id}`,
        })
        if (sent > 0) userHasSend = true
        await service
          .from("push_notification_log")
          .upsert(
            {
              user_id: userId,
              source_type: "doctor_appointment",
              source_id: appt.id,
              date: dateISO,
            },
            { onConflict: "source_type,source_id,date" },
          )
        notificationsSent += sent
      }

      // ---- Morning reminder (Goedemorgen) ----
      // Day-level match only, same honest limitation as generic reminders
      // above: her chosen time is respected exactly by the in-app toast
      // while Cyclus is open, but this once-daily cron can only send around
      // its own fixed run time (see vercel.json / the Amsterdam-timezone comment).
      if (
        profile?.morning_reminder_enabled === true &&
        profile.morning_reminder_days.includes(weekday) &&
        !alreadySent.has("morning_reminder:singleton")
      ) {
        const message = getMorningMessage({
          contentTypes: (profile.morning_reminder_content_types?.length
            ? profile.morning_reminder_content_types
            : ["reminder"]) as MorningReminderContentType[],
          seed: `morning-${userId}-${dateISO}`,
          phase: null,
          preferredStyles: buddyStyles as Parameters<typeof getMorningMessage>[0]["preferredStyles"],
        })
        const { sent } = await sendPushToUser(userId, {
          title: message.title,
          body: message.body,
          url: "/vandaag",
          tag: "morning-reminder",
        })
        if (sent > 0) userHasSend = true
        await service
          .from("push_notification_log")
          .upsert(
            { user_id: userId, source_type: "morning_reminder", source_id: "singleton", date: dateISO },
            { onConflict: "source_type,source_id,date" },
          )
        notificationsSent += sent
      }

      if (userHasSend) usersProcessed++
    } catch (error) {
      console.error(`[cron/send-reminders] Failed for user ${userId}:`, error)
    }
  }

  return NextResponse.json({ ok: true, usersChecked: userIds.length, usersNotified: usersProcessed, notificationsSent })
}
