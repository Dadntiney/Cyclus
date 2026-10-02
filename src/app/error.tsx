"use client"

import { useEffect } from "react"
import { Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { reportError } from "@/lib/monitoring/report-error"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportError(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream text-ink px-6">
      <div className="text-center max-w-sm">
        <Leaf className="h-9 w-9 mx-auto mb-4 text-sage-dark" strokeWidth={1.5} />
        <h1 className="font-display text-3xl text-ink mb-3">Er ging iets mis</h1>
        <p className="text-sm text-ink-soft mb-6">
          Sorry, dat hadden we niet verwacht. Probeer het opnieuw — als het blijft gebeuren, sluit
          de app dan even af en open hem opnieuw.
        </p>
        <Button onClick={reset}>Probeer opnieuw</Button>
      </div>
    </div>
  )
}
