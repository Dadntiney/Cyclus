"use client"

import { useEffect, useState } from "react"
import { X, Bell, Pill, Sun, Stethoscope } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { REMINDER_TYPE_OPTIONS } from "@/lib/constants"
import { getDueReminders, type ReminderLike } from "@/lib/client/reminder-scheduler"
import {
  getDueMedicationReminders,
  type MedicationReminderLike,
} from "@/lib/client/medication-reminder-scheduler"
import {
  doctorAppointmentReminderText,
  getDueDoctorAppointmentReminders,
  type DoctorAppointmentReminderLike,
} from "@/lib/client/doctor-appointment-reminder-scheduler"
import { wasReminderShownToday, markReminderShownToday } from "@/lib/client/reminder-storage"
import { resolveReminderText } from "@/lib/buddy/reminder-labels"
import { isScheduleStartDay, isScheduleStopDay, isAbsoluteMedicationEndDay } from "@/lib/medication/schedule"
import { getMorningMessage } from "@/lib/data/morning-messages"
import { todayISO as amsterdamTodayISO } from "@/lib/dates/amsterdam"
import type { MorningReminderContentType } from "@/lib/constants"
import { IconButton } from "@/components/ui/icon-button"
import { ToastLayer, toastSlotClass } from "@/components/ui/toast"
import { iconProps } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

/** Matches --duration-exit. */
const EXIT_MS = 180

export interface MorningReminderSettings {
  enabled: boolean
  time: string
  days: number[]
  contentTypes: MorningReminderContentType[]
  preferredStyles: string[]
}

const TYPE_BY_VALUE = new Map<string, (typeof REMINDER_TYPE_OPTIONS)[number]>(
  REMINDER_TYPE_OPTIONS.map((t) => [t.value, t]),
)

interface Toast {
  id: string
  icon: LucideIcon
  text: string
}

function reminderToast(reminder: ReminderLike, preferredStyles: string[], todayISO: string): Toast {
  const typeOption = TYPE_BY_VALUE.get(reminder.type)
  return {
    id: reminder.id,
    icon: typeOption?.icon ?? Bell,
    text: resolveReminderText(
      reminder.type,
      reminder.label,
      typeOption?.defaultLabel ?? "",
      preferredStyles,
      `${reminder.id}-${todayISO}`,
    ),
  }
}

function medicationToast(medication: MedicationReminderLike, now: Date): Toast {
  const isStart = isScheduleStartDay(medication, now)
  const isStop = !isStart && isScheduleStopDay(medication, now)
  const text = isStart
    ? `Je schema voor ${medication.name} start vandaag weer.`
    : isStop
      ? isAbsoluteMedicationEndDay(medication, now)
        ? `Je ingestelde periode voor ${medication.name} eindigt vandaag.`
        : `Laatste innamedag voor ${medication.name} — daarna begint je pauze. Je schema loopt daarna gewoon door.`
      : `Herinnering: je hebt vandaag ${medication.name} ingepland.`
  return { id: medication.id, icon: Pill, text }
}

/**
 * Mounted once in the app layout so it can surface a reminder on any page.
 * Purely in-app: while the tab is open, it checks every minute whether a
 * reminder is due (see reminder-scheduler.ts) and shows a small dismissible
 * toast, plus a native browser Notification if she's granted permission.
 * There's no push server behind this — it can't wake up a closed browser —
 * so it only ever fires while Cyclus is actually open.
 *
 * The toasts live in the app's toast layer: 12px above the tab bar (and
 * any StickyActionBar), never under the safe area, readable while a sheet
 * is open. They stay until she closes them, rise in and fade out, and are
 * announced politely.
 */
export function ReminderToastHost({
  reminders,
  medications = [],
  doctorAppointments = [],
  buddyStyles = [],
  morningReminder = null,
}: {
  reminders: ReminderLike[]
  medications?: MedicationReminderLike[]
  doctorAppointments?: DoctorAppointmentReminderLike[]
  buddyStyles?: string[]
  morningReminder?: MorningReminderSettings | null
}) {
  const [visible, setVisible] = useState<Toast[]>([])

  useEffect(() => {
    const hasReminders = reminders.some((r) => r.enabled)
    const hasMedicationReminders = medications.some((m) => m.reminderEnabled)
    const hasDoctorReminders = doctorAppointments.some((a) => a.reminderEnabled)
    const hasMorningReminder = morningReminder?.enabled === true
    if (!hasReminders && !hasMedicationReminders && !hasDoctorReminders && !hasMorningReminder) return

    function check() {
      const now = new Date()
      const dueReminders = getDueReminders(reminders, now, wasReminderShownToday)
      const dueMedications = getDueMedicationReminders(medications, now, wasReminderShownToday)
      const dueDoctor = getDueDoctorAppointmentReminders(
        doctorAppointments,
        now,
        wasReminderShownToday,
      )
      // Synthetic single-item "reminder" so the exact-time due-check logic
      // (day + grace window) is shared, not reimplemented for this one case.
      const dueMorning = hasMorningReminder
        ? getDueReminders(
            [
              {
                id: "morning-reminder",
                type: "goedemorgen",
                label: null,
                enabled: true,
                days: morningReminder!.days,
                time: morningReminder!.time,
              },
            ],
            now,
            wasReminderShownToday,
          )
        : []
      if (!dueReminders.length && !dueMedications.length && !dueDoctor.length && !dueMorning.length) {
        return
      }

      const todayISO = amsterdamTodayISO(now)
      const toasts: Toast[] = []

      for (const reminder of dueReminders) {
        markReminderShownToday(reminder.id, todayISO)
        toasts.push(reminderToast(reminder, buddyStyles, todayISO))
      }
      for (const medication of dueMedications) {
        markReminderShownToday(medication.id, todayISO)
        toasts.push(medicationToast(medication, now))
      }
      for (const appointment of dueDoctor) {
        markReminderShownToday(appointment.id, todayISO)
        toasts.push({
          id: appointment.id,
          icon: Stethoscope,
          text: doctorAppointmentReminderText(appointment),
        })
      }
      for (const reminder of dueMorning) {
        markReminderShownToday(reminder.id, todayISO)
        const message = getMorningMessage({
          contentTypes: morningReminder!.contentTypes,
          seed: `morning-${todayISO}`,
          phase: null,
          preferredStyles: morningReminder!.preferredStyles as Parameters<typeof getMorningMessage>[0]["preferredStyles"],
        })
        toasts.push({ id: reminder.id, icon: Sun, text: message.body })
      }

      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        for (const toast of toasts) {
          try {
            new Notification("GoFiev", { body: toast.text, icon: "/icons/icon-192.png" })
          } catch {
            // Notifications can throw in some contexts (e.g. iOS Safari) —
            // the in-app toast below still covers her either way.
          }
        }
      }
      setVisible((prev) => [...prev, ...toasts])
    }

    check()
    const interval = setInterval(check, 60_000)
    return () => clearInterval(interval)
  }, [reminders, medications, doctorAppointments, buddyStyles, morningReminder])

  const [leaving, setLeaving] = useState<string[]>([])

  function dismiss(id: string) {
    setLeaving((prev) => (prev.includes(id) ? prev : [...prev, id]))
    window.setTimeout(() => {
      setVisible((prev) => prev.filter((r) => r.id !== id))
      setLeaving((prev) => prev.filter((x) => x !== id))
    }, EXIT_MS)
  }

  return (
    <ToastLayer>
      {/* Always mounted, so a screen reader hears a reminder as it appears. */}
      <div role="status" aria-live="polite" className={toastSlotClass("reminders")}>
        {visible.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-card bg-surface-elevated py-1 pr-1 pl-4 shadow-elevated",
              leaving.includes(toast.id) ? "animate-fade-out" : "animate-rise-in",
            )}
          >
            <toast.icon {...iconProps("md", "text-sage-dark")} aria-hidden />
            <p className="flex-1 py-2 text-sm text-ink">{toast.text}</p>
            <IconButton label="Sluiten" icon={X} onClick={() => dismiss(toast.id)} />
          </div>
        ))}
      </div>
    </ToastLayer>
  )
}
