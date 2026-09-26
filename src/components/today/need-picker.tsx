"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Chip } from "@/components/ui/chip"
import { NEED_OPTIONS } from "@/lib/constants"
import { setTodayNeed } from "@/lib/actions/checkin"

export function NeedPicker({ initialNeed }: { initialNeed: string | null }) {
  const router = useRouter()
  const [need, setNeed] = useState(initialNeed)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSelect(value: string) {
    setError(null)
    const previous = need
    const next = need === value ? null : value
    setNeed(next)
    startTransition(async () => {
      const result = await setTodayNeed(next)
      if (result?.error) {
        setNeed(previous)
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div>
      <p className="text-sm font-medium text-ink-soft mb-2">Waar heb je vandaag behoefte aan?</p>
      <div className="flex flex-wrap gap-2">
        {NEED_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            selected={need === opt.value}
            disabled={isPending}
            onClick={() => handleSelect(opt.value)}
          >
            <span className="mr-1" aria-hidden>
              {opt.emoji}
            </span>
            {opt.label}
          </Chip>
        ))}
      </div>
      {error && <p className="text-xs text-danger mt-2">{error}</p>}
    </div>
  )
}
