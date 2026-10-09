"use client"

import { useEffect } from "react"
import { Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { reportError } from "@/lib/monitoring/report-error"
import { ICON } from "@/lib/ui/icon"

export default function ErrorBoundary({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    reportError(error)
  }, [error])

  return (
    <main className="min-h-dvh flex items-center justify-center bg-cream text-ink px-5">
      <div className="text-center max-w-sm">
        <span
          aria-hidden
          className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-sage-soft text-sage-dark"
        >
          <Leaf {...ICON.lg} />
        </span>
        <h1 className="type-page-title text-ink mb-3">Er ging iets mis</h1>
        <p className="text-sm text-ink-soft mb-6">
          Sorry, dat hadden we niet verwacht. Probeer het opnieuw — als het blijft gebeuren, sluit
          de app dan even af en open hem opnieuw.
        </p>
        {/* retry() fetches the page again before re-rendering (Next 16). */}
        <Button onClick={() => retry()}>Probeer opnieuw</Button>
      </div>
    </main>
  )
}
