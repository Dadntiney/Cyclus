"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { acceptBuddyAiConsent } from "@/lib/actions/consent"
import { Button } from "@/components/ui/button"

export function BuddyAiConsentCard() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="mx-5 lg:mx-8 mt-3 mb-1 rounded-2xl border border-line/70 bg-sage-soft/40 px-4 py-3.5 shrink-0">
      <p className="text-sm font-medium text-ink mb-1">Buddy en AI</p>
      <p className="text-sm text-ink-soft leading-relaxed mb-3">
        Als je wilt, mag Buddy een AI-dienst gebruiken om mee te denken. Dan kunnen
        relevante contextregels uit je profiel en check-ins meegestuurd worden. Zonder
        toestemming blijft Buddy lokaal meedenken. Zie de{" "}
        <Link href="/privacy" className="text-sage-dark font-medium underline-offset-2 hover:underline">
          privacyverklaring
        </Link>
        .
      </p>
      {error && <p className="text-xs text-danger mb-2">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          onClick={() => {
            setError(null)
            startTransition(async () => {
              const result = await acceptBuddyAiConsent()
              if (result.error) {
                setError(result.error)
                return
              }
              router.refresh()
            })
          }}
        >
          {isPending ? "Bezig…" : "Akkoord met AI"}
        </Button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setDismissed(true)}
          className="text-sm font-medium text-ink-soft min-h-11 px-2 touch-manipulation"
        >
          Liever zonder AI
        </button>
      </div>
    </div>
  )
}
