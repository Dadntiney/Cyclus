import { NextResponse, type NextRequest } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { sendPushToUser } from "@/lib/push/send"
import { getDueReminders, type ReminderLike } from "@/lib/client/reminder-scheduler"
import { getDueMedicationReminders, type MedicationReminderLike } from "@/lib/client/medication-reminder-scheduler"
import { isScheduleStartDay, isScheduleStopDay, type MedicationSchedule } from "@/lib/medication/schedule"
import { resolveReminderText } from "@/lib/buddy/reminder-labels"
import { REMINDER_TYPE_OPTIONS } from "@/lib/constants"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Cyclus is a Dutch-market app with no per-profile timezone setting yet, so
// every user's "now" is computed in Europe/Amsterdam (correctly handling
// CET/CEST) rather than the server's UTC clock. See the deployment report
// for the known limitation this implies for users outside that timezone.
const TIMEZONE = "Europe/Amsterdam"

function nowInTimezone(): { date: Date; hours: number; minutes: number; dateISO: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date())

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00"
  const dateISO = `${get("year")}-${get("month")}-${get("day")}`
  const hours = Number(get("hour"))
  const minutes = Number(get("minute"))
  // A Date built from these local wall-clock parts, purely so the existing
  // getDueReminders/getDueMedicationReminders (which read getHours/getDay
  // etc.) see the right weekday and hour without needing to be rewritten
  // for a specific timezone.
  const date = new Date(`${dateISO}T${get("hour")}:${get("minute")}:00`)
  return { date, hours, minutes, dateISO }
}

const REMINDER_TYPE_URL: Record<string, string> = {
  dagelijkse_checkin: "/vandaag",
  symptomen: "/vandaag",
  beweging: "/training",
  voeding: "/voeding",
  cyclus: "/cyclus",
  herstel: "/vandaag",
  routine: "/vandaag",
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
  const { date: now, dateISO } = nowInTimezone()

  const { data: subscribedUserRows } = await service.from("push_subscriptions").select("user_id")
  const userIds = [...new Set((subscribedUserRows ?? []).map((r) => r.user_id))]

  let notificationsSent = 0
  let usersProcessed = 0

  for (const userId of userIds) {
    try {
      const [{ data: profile }, { data: reminderRows }, { data: medicationRows }, { data: logRows }] =
        await Promise.all([
          service.from("profiles").select("buddy_styles, nutrition_enabled, movement_enabled").eq("id", userId).single(),
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
      const wasShown = (id: string) => alreadySent.has(`reminder:${id}`) || alreadySent.has(`medication_daily:${id}`) || alreadySent.has(`medication_start:${id}`) || alreadySent.has(`medication_stop:${id}`)

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
      const dueReminders = getDueReminders(reminders, now, wasShown).filter((r) => {
        if (r.type === "voeding" && profile?.nutrition_enabled === false) return false
        if (r.type === "beweging" && profile?.movement_enabled === false) return false
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
      const medications: MedicationReminderLike[] = (medicationRows ?? []).map((m) => ({
        id: m.id,
        name: m.name,
        reminderEnabled: m.reminder_enabled,
        timeOfDay: m.time_of_day,
        scheduleType: m.schedule_type as MedicationSchedule["scheduleType"],
        scheduleDays: m.schedule_days,
        scheduleDaysOn: m.schedule_days_on,
        scheduleDaysOff: m.schedule_days_off,
        startDate: m.start_date,
        endDate: m.end_date,
      }))
      const dueMedications = getDueMedicationReminders(medications, now, wasShown)

      for (const medication of dueMedications) {
        const isStart = isScheduleStartDay(medication, now)
        const isStop = !isStart && isScheduleStopDay(medication, now)
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
          url: `/medicatie/${medication.id}`,
          tag: `medication-${medication.id}`,
        })
        if (sent > 0) userHasSend = true
        await service
          .from("push_notification_log")
          .upsert({ user_id: userId, source_type: sourceType, source_id: medication.id, date: dateISO }, { onConflict: "source_type,source_id,date" })
        notificationsSent += sent
      }

      if (userHasSend) usersProcessed++
    } catch (error) {
      console.error(`[cron/send-reminders] Failed for user ${userId}:`, error)
    }
  }

  return NextResponse.json({ ok: true, usersChecked: userIds.length, usersNotified: usersProcessed, notificationsSent })
}
