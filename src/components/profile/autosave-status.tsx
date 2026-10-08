"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { textActionClass } from "@/components/ui/button"
import { ToastLayer, toastSlotClass } from "@/components/ui/toast"
import { CHECK_ICON, iconProps } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

export type AutosaveStatus = "idle" | "saving" | "saved" | "error"

/** "Opgeslagen" is announced only once it has held this long (besluit 24). */
const ANNOUNCE_DELAY_MS = 600
/** Matches --duration-exit. */
const EXIT_MS = 180

/**
 * One shared, quiet status pill for the whole (auto-saving) profile form.
 * It floats in the app's toast layer (above the tab bar and safe area,
 * never trapped by a page transition) so it stays visible wherever on a
 * long page the change was made. Renders nothing at rest; appears while
 * saving, briefly after saving, and on error (where it stays until the
 * next successful save). Rises in, fades out.
 *
 * Screen readers hear only what matters: "Opgeslagen" once a burst of
 * changes has settled (not every "Opslaan…"), and errors right away.
 */
export function AutosaveStatusPill({
  status,
  errorMessage,
  onRetry,
}: {
  status: AutosaveStatus
  errorMessage?: string | null
  onRetry?: () => void
}) {
  // Keep showing the last visible state while the pill fades out.
  const [shown, setShown] = useState<AutosaveStatus>(status)
  const [prevStatus, setPrevStatus] = useState(status)
  if (prevStatus !== status) {
    setPrevStatus(status)
    if (status !== "idle") setShown(status)
  }
  const leaving = status === "idle" && shown !== "idle"

  useEffect(() => {
    if (!leaving) return
    const timer = window.setTimeout(() => setShown("idle"), EXIT_MS)
    return () => window.clearTimeout(timer)
  }, [leaving])

  // Debounced "Opgeslagen" for the live region, written directly so a
  // quick saving → saved → saving burst never reads out every step.
  const liveRef = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    const el = liveRef.current
    if (!el) return
    if (status === "saving") {
      el.textContent = ""
      return
    }
    if (status !== "saved") return
    const timer = window.setTimeout(() => {
      el.textContent = "Opgeslagen"
    }, ANNOUNCE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [status])

  return (
    <>
      <p ref={liveRef} role="status" aria-live="polite" className="sr-only" />
      {shown !== "idle" && (
        <ToastLayer>
          <div className={toastSlotClass("autosave")}>
            <div
              className={cn(
                "pointer-events-auto flex min-h-10 max-w-sm items-center gap-2 rounded-full border bg-surface-elevated px-4 py-1 text-sm shadow-elevated",
                shown === "error" ? "border-danger/30" : "border-line",
                leaving ? "animate-fade-out" : "animate-rise-in",
              )}
            >
              {shown === "saving" && (
                <>
                  <Loader2 {...iconProps("sm", "text-ink-soft motion-safe:animate-spin")} aria-hidden />
                  <span className="text-ink-soft">Opslaan…</span>
                </>
              )}
              {shown === "saved" && (
                <>
                  <span
                    aria-hidden
                    className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sage-dark"
                  >
                    <Check {...CHECK_ICON} />
                  </span>
                  <span className="font-medium text-sage-dark">Opgeslagen</span>
                </>
              )}
              {shown === "error" && (
                <>
                  <span role="alert" className="flex-1 text-danger">
                    {errorMessage ?? "Opslaan is niet gelukt."}
                  </span>
                  {onRetry && (
                    <button type="button" onClick={onRetry} className={textActionClass("shrink-0 text-danger")}>
                      Opnieuw
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </ToastLayer>
      )}
    </>
  )
}
