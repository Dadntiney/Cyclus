"use client"

import { Leaf } from "lucide-react"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="nl">
      <body className="min-h-screen flex items-center justify-center bg-cream text-ink font-sans px-6">
        <div className="text-center max-w-sm">
          <Leaf className="h-9 w-9 mx-auto mb-4 text-sage-dark" strokeWidth={1.5} />
          <h1 className="text-2xl font-semibold text-ink mb-2">Er ging iets mis</h1>
          <p className="text-sm text-ink-soft mb-6">
            Sorry, dat hadden we niet verwacht. Probeer het opnieuw — als het blijft gebeuren, sluit
            de app dan even af en open hem opnieuw.
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 font-medium bg-sage-fill text-white rounded-2xl px-5 py-3 text-base"
          >
            Probeer opnieuw
          </button>
        </div>
      </body>
    </html>
  )
}
