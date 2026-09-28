"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Tiny confirmation flash for optimistic actions (favorites, diary save).
 * Local to the trigger — no global toast bus required.
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
      <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
      {message}
    </span>
  )
}
