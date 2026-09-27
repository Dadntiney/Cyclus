"use client"

import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type AutosaveStatus = "idle" | "saving" | "saved" | "error"

/**
 * One shared, quiet status pill for the whole (auto-saving) profile form —
 * fixed so it stays visible regardless of scroll position, since a single
 * combined save can be triggered from any card on a long page. Renders
 * nothing at rest; only appears while saving, briefly after saving, or on
 * error (where it stays until the next successful save).
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
  if (status === "idle") return null

  return (
    <div className="fixed bottom-20 md:bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <div
        className={cn(
          "pointer-events-auto max-w-sm bg-white border rounded-full shadow-lg px-4 py-2 flex items-center gap-2 text-sm animate-pop-in",
          status === "error" ? "border-danger/30" : "border-line",
        )}
      >
        {status === "saving" && (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-soft shrink-0" strokeWidth={2} />
            <span className="text-ink-soft">Opslaan...</span>
          </>
        )}
        {status === "saved" && (
          <>
            <span className="h-4 w-4 rounded-full bg-sage-soft flex items-center justify-center shrink-0">
              <Check className="h-2.5 w-2.5 text-sage-dark" strokeWidth={3} />
            </span>
            <span className="text-sage-dark font-medium">Opgeslagen</span>
          </>
        )}
        {status === "error" && (
          <>
            <span className="flex-1 text-danger">{errorMessage ?? "Opslaan is niet gelukt."}</span>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="font-medium text-danger underline underline-offset-2 shrink-0 touch-manipulation"
              >
                Opnieuw
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
