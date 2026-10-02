"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { Input, Label, FieldError } from "@/components/ui/input"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"
import { WAKE_FEELING_OPTIONS, SLEEP_QUALITY_OPTIONS, WAKE_COUNT_OPTIONS } from "@/lib/constants"
import { saveSleepEntry } from "@/lib/actions/sleep"
import type { Tables } from "@/types/database"
import { runAction } from "@/lib/client/run-action"

type SleepEntry = Tables<"sleep_entries">

function fieldsFromInitial(initial: SleepEntry | null) {
  return {
    bedtime: initial?.bedtime?.slice(0, 5) ?? "",
    wakeTime: initial?.wake_time?.slice(0, 5) ?? "",
    wakeFeeling: (initial?.wake_feeling ?? null) as string | null,
    sleepQuality: (initial?.sleep_quality ?? null) as string | null,
    wakeCount: initial?.wake_count ?? null,
    showMore: Boolean(initial?.sleep_quality || initial?.wake_count !== null),
  }
}

/**
 * Quick-entry sheet — bedtime, wake time and how she felt waking up are
 * always visible (the three things worth logging in a few seconds); sleep
 * quality and how often she woke up are optional extras behind "meer
 * toevoegen", same progressive-disclosure pattern as the daily check-in.
 */
export function SleepEntrySheet({
  open,
  onClose,
  date,
  initial,
}: {
  open: boolean
  onClose: () => void
  date: string
  initial: SleepEntry | null
}) {
  const router = useRouter()
  const seed = fieldsFromInitial(initial)
  const [bedtime, setBedtime] = useState(seed.bedtime)
  const [wakeTime, setWakeTime] = useState(seed.wakeTime)
  const [wakeFeeling, setWakeFeeling] = useState<string | null>(seed.wakeFeeling)
  const [sleepQuality, setSleepQuality] = useState<string | null>(seed.sleepQuality)
  const [wakeCount, setWakeCount] = useState<number | null>(seed.wakeCount)
  const [showMore, setShowMore] = useState(seed.showMore)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  // When the sheet opens, resync from latest server props (avoid stale edits).
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      const next = fieldsFromInitial(initial)
      setBedtime(next.bedtime)
      setWakeTime(next.wakeTime)
      setWakeFeeling(next.wakeFeeling)
      setSleepQuality(next.sleepQuality)
      setWakeCount(next.wakeCount)
      setShowMore(next.showMore)
      setError(null)
    }
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await runAction(() => saveSleepEntry({
        date,
        bedtime: bedtime || null,
        wakeTime: wakeTime || null,
        wakeFeeling: wakeFeeling as never,
        sleepQuality: sleepQuality as never,
        wakeCount,
      }))
      if (result?.error) {
        setError(result.error)
        return
      }
      onClose()
      router.refresh()
    })
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Hoe heb je geslapen?">
      <div className="flex flex-col gap-4 pb-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="bedtime">Naar bed</Label>
            <Input id="bedtime" type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} />
          </div>
          <div className="flex-1">
            <Label htmlFor="wake-time">Wakker</Label>
            <Input id="wake-time" type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-ink mb-2">Hoe voelde je je bij het wakker worden?</p>
          <div className="flex flex-wrap gap-2">
            {WAKE_FEELING_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                selected={wakeFeeling === opt.value}
                onClick={() => setWakeFeeling(wakeFeeling === opt.value ? null : opt.value)}
              >
                <opt.icon className="h-4 w-4 mr-1 inline" strokeWidth={1.75} aria-hidden />
                {opt.label}
              </Chip>
            ))}
          </div>
        </div>

        {showMore ? (
          <>
            <div>
              <p className="text-sm font-medium text-ink mb-2">Hoe was je slaap?</p>
              <div className="flex flex-wrap gap-2">
                {SLEEP_QUALITY_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    selected={sleepQuality === opt.value}
                    onClick={() => setSleepQuality(sleepQuality === opt.value ? null : opt.value)}
                  >
                    {opt.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-ink mb-2">Hoe vaak werd je wakker?</p>
              <div className="flex flex-wrap gap-2">
                {WAKE_COUNT_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    selected={wakeCount === opt.value}
                    onClick={() => setWakeCount(wakeCount === opt.value ? null : opt.value)}
                  >
                    {opt.label}
                  </Chip>
                ))}
              </div>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowMore(true)}
            className="self-start inline-flex items-center gap-1.5 text-sm font-medium text-sage-dark rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 py-1"
          >
            Meer toevoegen
            <ChevronDown className="h-4 w-4" strokeWidth={2} />
          </button>
        )}

        <FieldError>{error}</FieldError>

        <Button onClick={handleSave} disabled={isPending} className="w-full">
          {isPending ? "Bezig..." : "Opslaan"}
        </Button>
      </div>
    </BottomSheet>
  )
}
