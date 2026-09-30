"use client"

import { useState } from "react"
import { Moon } from "lucide-react"
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
  const hasTimes = Boolean(entry?.bedtime && entry?.wake_time)
  const durationMinutes = hasTimes ? computeSleepDurationMinutes(entry!.bedtime!, entry!.wake_time!) : null
  const showDuration = durationMinutes != null && durationMinutes > 0

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-left rounded-2xl bg-cream-soft/70 px-3.5 py-3 touch-manipulation transition-colors duration-150 motion-safe:active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
      >
        <div className="flex items-center gap-3">
          <span className="shrink-0 h-10 w-10 rounded-full bg-sage-soft flex items-center justify-center" aria-hidden>
            <Moon className="h-4.5 w-4.5 text-sage-dark" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            {showDuration ? (
              <>
                <p className="font-medium text-ink text-sm">{formatSleepDuration(durationMinutes!)} geslapen</p>
                {entry?.wake_feeling && WAKE_FEELING_BY_VALUE.has(entry.wake_feeling) && (
                  <p className="text-xs text-ink-soft mt-0.5 inline-flex items-center gap-1">
                    {(() => {
                      const FeelingIcon = WAKE_FEELING_BY_VALUE.get(entry.wake_feeling)!.icon
                      return <FeelingIcon className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                    })()}
                    {WAKE_FEELING_BY_VALUE.get(entry.wake_feeling)!.label}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="font-medium text-ink text-sm">Hoe heb je geslapen?</p>
                <p className="text-xs text-ink-soft mt-0.5">Tik om je nacht in te vullen</p>
              </>
            )}
          </div>
        </div>
      </button>
      <SleepEntrySheet open={open} onClose={() => setOpen(false)} date={date} initial={entry} />
    </>
  )
}
