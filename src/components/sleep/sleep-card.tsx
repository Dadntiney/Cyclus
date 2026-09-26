"use client"

import { useState } from "react"
import { Moon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { SleepEntrySheet } from "@/components/sleep/sleep-entry-sheet"
import { computeSleepDurationMinutes, formatSleepDuration } from "@/lib/sleep/duration"
import { WAKE_FEELING_OPTIONS } from "@/lib/constants"
import type { Tables } from "@/types/database"

type SleepEntry = Tables<"sleep_entries">

const WAKE_FEELING_BY_VALUE = new Map<string, (typeof WAKE_FEELING_OPTIONS)[number]>(
  WAKE_FEELING_OPTIONS.map((o) => [o.value, o]),
)

export function SleepCard({ date, entry }: { date: string; entry: SleepEntry | null }) {
  const [open, setOpen] = useState(false)
  const hasDuration = Boolean(entry?.bedtime && entry?.wake_time)
  const durationMinutes = hasDuration ? computeSleepDurationMinutes(entry!.bedtime!, entry!.wake_time!) : null

  return (
    <>
      <Card interactive className="p-4 cursor-pointer touch-manipulation" onClick={() => setOpen(true)}>
        <div className="flex items-center gap-3">
          <span className="shrink-0 h-10 w-10 rounded-full bg-sage-soft flex items-center justify-center">
            <Moon className="h-4.5 w-4.5 text-sage-dark" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            {hasDuration ? (
              <>
                <p className="font-medium text-ink text-base">{formatSleepDuration(durationMinutes!)} geslapen</p>
                {entry?.wake_feeling && WAKE_FEELING_BY_VALUE.has(entry.wake_feeling) && (
                  <p className="text-xs text-ink-soft mt-0.5">
                    {WAKE_FEELING_BY_VALUE.get(entry.wake_feeling)!.emoji}{" "}
                    {WAKE_FEELING_BY_VALUE.get(entry.wake_feeling)!.label}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="font-medium text-ink text-base">Hoe heb je geslapen?</p>
                <p className="text-xs text-ink-soft mt-0.5">Tik om je nacht in te vullen</p>
              </>
            )}
          </div>
        </div>
      </Card>
      <SleepEntrySheet open={open} onClose={() => setOpen(false)} date={date} initial={entry} />
    </>
  )
}
