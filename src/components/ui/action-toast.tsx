"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { CHECK_ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

/**
 * Tiny confirmation flash for optimistic actions (favorites, diary save).
 * Local to the trigger — no global toast bus required. Only for an
 * in-place acknowledgement; app-wide feedback goes through the toast host.
 */
export function useActionToast(durationMs = 1600) {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), durationMs)
    return () => clearTimeout(t)
  }, [message, durationMs])

  return {
    message,
    show: (next: string) => setMessage(next),
    clear: () => setMessage(null),
  }
}

export function ActionToast({
  message,
  className,
}: {
  message: string | null
  className?: string
}) {
  if (!message) return null
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium text-sage-dark animate-pop-in",
        className,
      )}
    >
      <Check {...CHECK_ICON} aria-hidden />
      {message}
    </span>
  )
}
