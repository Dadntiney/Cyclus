import { NextResponse, type NextRequest } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { sendPushToUser } from "@/lib/push/send"
import { isReminderDueToday, isoWeekday, type ReminderLike } from "@/lib/client/reminder-scheduler"
import { isDosingDay, isScheduleStartDay, isScheduleStopDay, type MedicationSchedule } from "@/lib/medication/schedule"
import { resolveReminderText } from "@/lib/buddy/reminder-labels"
import { getMorningMessage } from "@/lib/data/morning-messages"
import { REMINDER_TYPE_OPTIONS, type MorningReminderContentType } from "@/lib/constants"

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
const TIMEZONE = "Europe/Amsterdam"

function todayInTimezone(): { date: Date; dateISO: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00"
  const dateISO = `${get("year")}-${get("month")}-${get("day")}`
  return { date: new Date(`${dateISO}T00:00:00`), dateISO }
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

  for (const userId of userIds) {
    try {
      const [{ data: profile }, { data: reminderRows }, { data: medicationRows }, { data: logRows }] =
        await Promise.all([
          service
            .from("profiles")
            .select(
              "buddy_styles, nutrition_enabled, movement_enabled, mental_wellbeing_enabled, morning_reminder_enabled, morning_reminder_time, morning_reminder_days, morning_reminder_content_type",
            )
            .eq("id", userId)
            .single(),
          service.from("reminders").select("*").eq("user_id", userId).eq("enabled", true),
          service
            .from("medications")
            .select(
              "id, name, reminder_enabled, time_of_day, schedule_type, schedule_days, schedule_days_on, schedule_days_off, start_date, end_date",
            )
            .eq("user_id", userId)
            .eq("reminder_enabled", true),
          service
            .from("push_notification_log")
            .select("source_type, source_id")
            .eq("user_id", userId)
            .eq("date", dateISO),
        ])

      const alreadySent = new Set((logRows as LogRow[] | null ?? []).map((l) => `${l.source_type}:${l.source_id}`))
      const buddyStyles = profile?.buddy_styles ?? []
      let userHasSend = false

      // ---- Generic reminders (check-in, movement, nutrition, cycle, rest, routine, custom) ----
      const reminders: ReminderLike[] = (reminderRows ?? []).map((r) => ({
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
        // false = a computed "off" day, stay silent. true or null (e.g.
        // "eigen schema", not automatically trackable) still remind today.
        if (isDosingDay(schedule, today) === false) return false
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

      // ---- Morning reminder (Goedemorgen) ----
      // Day-level match only, same honest limitation as generic reminders
      // above: her chosen time is respected exactly by the in-app toast
      // while Cyclus is open, but this once-daily cron can only send around
      // its own fixed run time (see vercel.json / the TIMEZONE comment).
      if (
        profile?.morning_reminder_enabled === true &&
        profile.morning_reminder_days.includes(weekday) &&
        !alreadySent.has("morning_reminder:singleton")
      ) {
        const message = getMorningMessage({
          contentType: profile.morning_reminder_content_type as MorningReminderContentType,
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
