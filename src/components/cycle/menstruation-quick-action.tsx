"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { startMenstruationToday, stopMenstruationToday } from "@/lib/actions/cycle"

/** Compact "menstruatie gestart/gestopt" shortcut for the Vandaag-pagina — see getOpenPeriod for the "open" logic. */
export function MenstruationQuickAction({ isOpen }: { isOpen: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const result = isOpen ? await stopMenstruationToday() : await startMenstruationToday()
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <Card className="p-3.5 flex items-center justify-between gap-3 mb-6 lg:mb-8">
      <p className="text-sm text-ink-soft min-w-0">
        {isOpen ? "Ben je gestopt met menstrueren?" : "Ben je vandaag ongesteld geworden?"}
      </p>
      <div className="shrink-0 flex flex-col items-end gap-1">
        <Button size="sm" variant={isOpen ? "secondary" : "primary"} onClick={handleClick} disabled={isPending}>
          {isPending ? "Bezig..." : isOpen ? "Menstruatie gestopt" : "Menstruatie gestart 🩸"}
        </Button>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </Card>
  )
}
