"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { startMenstruationToday, stopMenstruationToday } from "@/lib/actions/cycle"

/** Compact "menstruatie gestart/gestopt" shortcut for the Vandaag-pagina — see getOpenPeriod for the "open" logic. */
export function MenstruationQuickAction({ isOpen, day }: { isOpen: boolean; day: number | null }) {
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
    <Card
      className={cn(
        "p-3.5 flex items-center justify-between gap-3 mb-6 lg:mb-8",
        isOpen && "bg-peach-soft border-transparent",
      )}
    >
      <div className="min-w-0">
        {isOpen ? (
          <p className="text-sm font-semibold text-ink">
            🩸 {day === 1 ? "Dag 1 van je menstruatie" : `Dag ${day} van je menstruatie`}
          </p>
        ) : (
          <p className="text-sm text-ink-soft">Ben je vandaag ongesteld geworden?</p>
        )}
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1">
        <Button size="sm" variant={isOpen ? "secondary" : "primary"} onClick={handleClick} disabled={isPending}>
          {isPending ? "Bezig..." : isOpen ? "Menstruatie gestopt" : "Menstruatie gestart 🩸"}
        </Button>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </Card>
  )
}
