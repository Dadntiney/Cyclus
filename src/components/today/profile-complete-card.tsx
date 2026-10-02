"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight, X } from "lucide-react"

const DISMISS_KEY = "gofiev:profile-complete-dismissed"

/**
 * Health notes and medication left onboarding to keep it short; this calm
 * card invites her to add them later. Hidden once she filled something in,
 * or after she closed it on this device.
 */
export function ProfileCompleteCard() {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    // localStorage only on client — render nothing on the server, then decide.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1")
    } catch {
      setDismissed(false)
    }
  }, [])

  if (dismissed) return null

  return (
    <div className="rounded-[1.25rem] bg-surface border border-line flex items-start gap-1 pr-1">
      <Link
        href="/profiel/gegevens#aandachtspunten"
        className="flex flex-1 items-center gap-3 px-4 py-3.5 min-w-0 touch-manipulation"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-ink">Maak je profiel compleet</span>
          <span className="block text-xs text-ink-soft mt-0.5 leading-relaxed">
            Klachten of beperkingen, zoals knie of rug? Dan passen beweging en uitleg beter bij jou.
          </span>
        </span>
        <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={2} aria-hidden />
      </Link>
      <button
        type="button"
        aria-label="Niet nu"
        onClick={() => {
          setDismissed(true)
          try {
            window.localStorage.setItem(DISMISS_KEY, "1")
          } catch {}
        }}
        className="h-11 w-11 shrink-0 inline-flex items-center justify-center rounded-full text-ink-soft hover:bg-bg-subtle mt-1"
      >
        <X className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
    </div>
  )
}
