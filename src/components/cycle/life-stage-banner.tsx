"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { IconButton } from "@/components/ui/icon-button"
import { textActionClass } from "@/components/ui/button"
import { FEATURES } from "@/lib/navigation/features"

const STORAGE_KEY = "gofiev:cyclus-levensfase-verborgen"

const listeners = new Set<() => void>()
/** Dismissed in this tab, also when storage is unavailable. */
let hiddenThisVisit = false

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

function readHidden(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

function hide() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1")
  } catch {
    // Private mode / blocked storage: it just stays hidden for this visit.
  }
  hiddenThisVisit = true
  for (const listener of listeners) listener()
}

/**
 * "Welke levensfase past bij jou?" — a slim, dismissible prompt on Cyclus,
 * shown only while no life stage is set. Dismissing is remembered on this
 * device (a convenience, never data); the choice itself lives in
 * Cyclusinstellingen. Rendered only after hydration, so a dismissed banner
 * never flashes in.
 */
export function LifeStageBanner({
  changingCycle = false,
  focusAfterDismissId,
}: {
  changingCycle?: boolean
  /** Heading that takes focus after "Niet nu" (the banner itself goes away). */
  focusAfterDismissId?: string
}) {
  const hidden = useSyncExternalStore(
    subscribe,
    () => hiddenThisVisit || readHidden(),
    () => true,
  )
  if (hidden) return null

  function dismiss() {
    hide()
    // The button disappears with the banner: hand focus to what follows,
    // instead of letting it fall back to the document.
    const next = focusAfterDismissId ? document.getElementById(focusAfterDismissId) : null
    if (next) {
      if (!next.hasAttribute("tabindex")) next.setAttribute("tabindex", "-1")
      next.setAttribute("data-focus-target", "")
      next.focus()
    }
  }

  return (
    <Card tone="subtle" padding="sm" className="flex items-start gap-2">
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-medium text-ink">Welke levensfase past bij jou?</p>
        <p className="text-sm text-ink-soft mt-0.5">
          {changingCycle
            ? "Wat je noteert, past bij een cyclus die verandert. Kies wat bij je past, dan sluit de uitleg beter aan. Geen diagnose."
            : "Regelmatig, veranderend, overgang of daarna: kies wat past, dan sluit de uitleg beter aan. Geen diagnose."}
        </p>
        <Link href={FEATURES.cyclusinstellingen.href} className={textActionClass("mt-1")}>
          Levensfase kiezen
        </Link>
      </div>
      <IconButton label="Niet nu" icon={X} onClick={dismiss} className="-mr-2 -mt-2" />
    </Card>
  )
}
