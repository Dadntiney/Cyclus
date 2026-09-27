"use client"

import { useState, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { saveReminderSettings } from "@/lib/actions/reminders"

export function ReminderSettingsForm({
  initial,
}: {
  initial: {
    checkinReminderEnabled: boolean
    checkinReminderTime: string
    workoutReminderEnabled: boolean
    browserNotificationsEnabled: boolean
  }
}) {
  const [checkinEnabled, setCheckinEnabled] = useState(initial.checkinReminderEnabled)
  const [checkinTime, setCheckinTime] = useState(initial.checkinReminderTime.slice(0, 5))
  const [workoutEnabled, setWorkoutEnabled] = useState(initial.workoutReminderEnabled)
  const [browserEnabled, setBrowserEnabled] = useState(initial.browserNotificationsEnabled)
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function requestPermissionAndSave() {
    setStatus("idle")
    setError(null)
    startTransition(async () => {
      let browser = browserEnabled
      if (browser && typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          const result = await Notification.requestPermission()
          browser = result === "granted"
          setBrowserEnabled(browser)
        } else if (Notification.permission !== "granted") {
          browser = false
          setBrowserEnabled(false)
          setError("Meldingen staan uit in je browser. Zet ze aan in je browserinstellingen.")
        }
      }

      const result = await saveReminderSettings({
        checkinReminderEnabled: checkinEnabled,
        checkinReminderTime: checkinTime,
        workoutReminderEnabled: workoutEnabled,
        browserNotificationsEnabled: browser,
      })
      if (result?.error) {
        setStatus("error")
        setError(result.error)
      } else {
        setStatus("saved")
      }
    })
  }

  return (
    <Card>
      <h2 className="font-display text-lg text-ink mb-1">Herinneringen</h2>
      <p className="text-sm text-ink-soft mb-4">
        Optioneel. Werkt via browsermeldingen terwijl Cyclus open kan staan.
      </p>

      <div className="flex flex-col gap-4">
        <label className="flex items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            className="mt-1"
            checked={checkinEnabled}
            onChange={(e) => setCheckinEnabled(e.target.checked)}
          />
          <span>
            <span className="font-medium">Check-in herinnering</span>
            <span className="block text-ink-soft">Dagelijks een seintje om in te vullen hoe je je voelt.</span>
          </span>
        </label>

        {checkinEnabled && (
          <div>
            <Label htmlFor="checkin-time">Tijdstip</Label>
            <Input
              id="checkin-time"
              type="time"
              value={checkinTime}
              onChange={(e) => setCheckinTime(e.target.value)}
              className="mt-1 max-w-[10rem]"
            />
          </div>
        )}

        <label className="flex items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            className="mt-1"
            checked={workoutEnabled}
            onChange={(e) => setWorkoutEnabled(e.target.checked)}
          />
          <span>
            <span className="font-medium">Bewegingsherinnering</span>
            <span className="block text-ink-soft">
              Aan het eind van de middag als je vandaag beweging had gepland maar nog niets afrondde.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            className="mt-1"
            checked={browserEnabled}
            onChange={(e) => setBrowserEnabled(e.target.checked)}
          />
          <span>
            <span className="font-medium">Browsermeldingen toestaan</span>
            <span className="block text-ink-soft">Nodig om herinneringen te tonen buiten het scherm.</span>
          </span>
        </label>

        <Button type="button" onClick={requestPermissionAndSave} disabled={isPending}>
          {isPending ? "Opslaan…" : "Opslaan"}
        </Button>
        {status === "saved" && <p className="text-sm text-sage-dark">Opgeslagen.</p>}
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Card>
  )
}
