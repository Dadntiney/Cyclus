"use client"

import { useCallback, useRef, useState, type ReactNode } from "react"
import { CheckinForm } from "@/components/today/checkin-form"
import type { Tables } from "@/types/database"

type Checkin = Tables<"daily_checkins">

/**
 * Keeps CheckinForm on one React mount for the whole Vandaag visit.
 *
 * Previously the server page swapped the form between an “early” and “late”
 * slot when the first save made the check-in meaningful. That remount reset
 * local `editing` and collapsed the card on the first tap. Here the form
 * stays the first child; only `order` moves it visually.
 */
export function VandaagCheckinSlot({
  hasMeaningfulCheckin,
  initial,
  mentalWellbeingEnabled,
  sleepTrackingEnabled,
  customSymptoms,
  earlyExtras,
  plan,
  lateExtras,
}: {
  hasMeaningfulCheckin: boolean
  initial: Checkin | null
  mentalWellbeingEnabled: boolean
  sleepTrackingEnabled: boolean
  customSymptoms: string[]
  earlyExtras: ReactNode
  plan: ReactNode
  lateExtras: ReactNode
}) {
  const [preferEarly, setPreferEarly] = useState(!hasMeaningfulCheckin)
  // Once she’s collapsed a filled check-in (or loaded with one), keep edits late.
  const settledLateRef = useRef(hasMeaningfulCheckin)

  const handleEditingChange = useCallback((editing: boolean) => {
    if (!editing) {
      settledLateRef.current = true
      setPreferEarly(false)
      return
    }
    if (!settledLateRef.current) {
      setPreferEarly(true)
    }
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <div style={{ order: preferEarly ? 1 : 3 }}>
        <CheckinForm
          initial={initial}
          mentalWellbeingEnabled={mentalWellbeingEnabled}
          sleepTrackingEnabled={sleepTrackingEnabled}
          customSymptoms={customSymptoms}
          onEditingChange={handleEditingChange}
        />
      </div>
      <div style={{ order: preferEarly ? 2 : 1 }} className="flex flex-col gap-6 empty:hidden">
        {earlyExtras}
      </div>
      <div style={{ order: preferEarly ? 3 : 2 }} className="empty:hidden">
        {plan}
      </div>
      <div style={{ order: 4 }} className="flex flex-col gap-8">
        {lateExtras}
      </div>
    </div>
  )
}
