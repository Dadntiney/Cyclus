"use client"

import { useEffect, useRef } from "react"

type MedicationReminder = {
  id: string
  name: string
  reminder_time: string | null
  reminder_enabled: boolean
  takenToday: boolean
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function minutesNow() {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

function parseTimeToMinutes(time: string | null): number | null {
  if (!time) return null
  const [h, m] = time.split(":").map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

function alreadyFired(key: string) {
  try {
    return localStorage.getItem(key) === "1"
  } catch {
    return false
  }
}

function markFired(key: string) {
  try {
    localStorage.setItem(key, "1")
  } catch {
    // ignore
  }
}

async function notify(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return
  if (Notification.permission !== "granted") return
  try {
    new Notification(title, { body, tag: title })
  } catch {
    // ignore — some browsers block without service worker
  }
}

/**
 * Client-side reminder scheduler. Uses the browser Notification API when the
 * user opted in. No server push required for v1 — works while the app/tab can run.
 */
export function ReminderScheduler({
  enabled,
  checkinReminderEnabled,
  checkinReminderTime,
  workoutReminderEnabled,
  hasCheckinToday,
  hasWorkoutToday,
  isPlannedWorkoutDay,
  medications,
}: {
  enabled: boolean
  checkinReminderEnabled: boolean
  checkinReminderTime: string | null
  workoutReminderEnabled: boolean
  hasCheckinToday: boolean
  hasWorkoutToday: boolean
  isPlannedWorkoutDay: boolean
  medications: MedicationReminder[]
}) {
  const ran = useRef(false)

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("Notification" in window)) return

    const tick = () => {
      const day = todayKey()
      const now = minutesNow()

      if (checkinReminderEnabled && !hasCheckinToday) {
        const target = parseTimeToMinutes(checkinReminderTime)
        if (target !== null && now >= target && now < target + 15) {
          const key = `cyclus-checkin-${day}`
          if (!alreadyFired(key)) {
            markFired(key)
            void notify("Cyclus", "Tijd voor je check-in — hoe voel je je vandaag?")
          }
        }
      }

      if (workoutReminderEnabled && isPlannedWorkoutDay && !hasWorkoutToday) {
        // Soft afternoon nudge if still nothing logged.
        if (now >= 17 * 60 && now < 17 * 60 + 15) {
          const key = `cyclus-workout-${day}`
          if (!alreadyFired(key)) {
            markFired(key)
            void notify("Cyclus", "Je had vandaag beweging gepland — nog zin in een korte sessie?")
          }
        }
      }

      for (const med of medications) {
        if (!med.reminder_enabled || med.takenToday) continue
        const target = parseTimeToMinutes(med.reminder_time)
        if (target === null) continue
        if (now >= target && now < target + 15) {
          const key = `cyclus-med-${med.id}-${day}`
          if (!alreadyFired(key)) {
            markFired(key)
            void notify("Medicijndoosje", `Herinnering: ${med.name}`)
          }
        }
      }
    }

    tick()
    const id = window.setInterval(tick, 60_000)
    ran.current = true
    return () => window.clearInterval(id)
  }, [
    enabled,
    checkinReminderEnabled,
    checkinReminderTime,
    workoutReminderEnabled,
    hasCheckinToday,
    hasWorkoutToday,
    isPlannedWorkoutDay,
    medications,
  ])

  return null
}
