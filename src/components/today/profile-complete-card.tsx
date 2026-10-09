"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { IconButton } from "@/components/ui/icon-button"
import { iconProps } from "@/lib/ui/icon"

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
    <Card padding="none" className="flex items-start gap-1 overflow-hidden pr-1">
      <Link
        href="/profiel/gegevens#aandachtspunten"
        className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-l-card py-3 pl-4 touch-manipulation -outline-offset-2 transition-colors duration-fast ease-standard hover:bg-cream-soft/60 active:bg-cream-soft"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-base font-medium text-ink">Maak je profiel compleet</span>
          <span className="block text-sm text-ink-soft">
            Klachten of beperkingen, zoals knie of rug? Dan passen beweging en uitleg beter bij jou.
          </span>
        </span>
        <ChevronRight {...iconProps("sm", "text-ink-soft")} aria-hidden />
      </Link>
      <IconButton
        label="Niet nu"
        icon={X}
        size="sm"
        className="mt-1.5"
        onClick={() => {
          setDismissed(true)
          try {
            window.localStorage.setItem(DISMISS_KEY, "1")
          } catch {}
        }}
      />
    </Card>
  )
}
