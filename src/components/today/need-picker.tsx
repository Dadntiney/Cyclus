"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Chip } from "@/components/ui/chip"
import { NEED_OPTIONS } from "@/lib/constants"
import { setTodayNeed } from "@/lib/actions/checkin"

export function NeedPicker({ initialNeed }: { initialNeed: string | null }) {
  const router = useRouter()
  const [need, setNeed] = useState(initialNeed)
  const [isPending, startTransition] = useTransition()

  function handleSelect(value: string) {
    const next = need === value ? null : value
    setNeed(next)
    startTransition(async () => {
      await setTodayNeed(next)
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
    </div>
  )
}
