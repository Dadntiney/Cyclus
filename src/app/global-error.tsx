"use client"

import { useEffect, type CSSProperties } from "react"
import { Leaf } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { reportError } from "@/lib/monitoring/report-error"
import { APP_DISPLAY_NAME } from "@/lib/theme/brand"
import { ICON } from "@/lib/ui/icon"
// global-error replaces the root layout and does not get its styles
// (Next 16 docs), so it loads the design tokens itself.
import "./globals.css"

/** The root layout's fonts are not loaded here: fall back to system fonts. */
const FALLBACK_FONTS = {
  "--font-body": "system-ui, -apple-system, 'Segoe UI', sans-serif",
  "--font-display": "Georgia, 'Times New Roman', serif",
} as CSSProperties

export default function GlobalError({
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
    <html lang="nl" style={FALLBACK_FONTS}>
      <body className="min-h-dvh flex items-center justify-center bg-cream text-ink font-sans px-5">
        <title>{`Er ging iets mis · ${APP_DISPLAY_NAME}`}</title>
        <main className="text-center max-w-sm">
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
          <button type="button" onClick={() => retry()} className={buttonVariants()}>
            Probeer opnieuw
          </button>
        </main>
      </body>
    </html>
  )
}
