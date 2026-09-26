"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream text-ink px-6">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4">🌿</p>
        <h1 className="font-display text-2xl text-ink mb-2">Er ging iets mis</h1>
        <p className="text-sm text-ink-soft mb-6">
          Sorry, dat hadden we niet verwacht. Probeer het opnieuw — als het blijft gebeuren, sluit
          de app dan even af en open hem opnieuw.
        </p>
        <Button onClick={reset}>Probeer opnieuw</Button>
      </div>
    </div>
  )
}
