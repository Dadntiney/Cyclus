"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Chip } from "@/components/ui/chip"
import { NEED_OPTIONS } from "@/lib/constants"
import { setTodayNeeds } from "@/lib/actions/checkin"

export function NeedPicker({ initialNeeds }: { initialNeeds: string[] }) {
  const router = useRouter()
  const [needs, setNeeds] = useState(initialNeeds)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleToggle(value: string) {
    setError(null)
    const previous = needs
    const next = needs.includes(value)
      ? needs.filter((n) => n !== value)
      : [...needs, value]
    setNeeds(next)
    startTransition(async () => {
      const result = await setTodayNeeds(next)
      if (result?.error) {
        setNeeds(previous)
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-ink-soft mb-0.5">Waar heb je vandaag behoefte aan?</h2>
      <p className="text-xs text-ink-soft mb-2">Je mag er meer dan één kiezen.</p>
      <div className="flex flex-wrap gap-2">
        {NEED_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            selected={needs.includes(opt.value)}
            disabled={isPending}
            onClick={() => handleToggle(opt.value)}
          >
            <opt.icon className="h-4 w-4 mr-1 inline" strokeWidth={1.75} aria-hidden />
            {opt.label}
          </Chip>
        ))}
      </div>
      {error && <p className="text-xs text-danger mt-2">{error}</p>}
    </div>
  )
}
