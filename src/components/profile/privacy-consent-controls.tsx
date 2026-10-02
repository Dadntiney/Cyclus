"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  acceptBuddyAiConsent,
  acceptHealthDataConsent,
  revokeBuddyAiConsent,
} from "@/lib/actions/consent"
import { Button } from "@/components/ui/button"
import { runAction } from "@/lib/client/run-action"

export function PrivacyConsentControls({
  healthConsentAt,
  buddyAiConsentAt,
  buddyAiAvailable,
}: {
  healthConsentAt: string | null
  buddyAiConsentAt: string | null
  buddyAiAvailable: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl bg-cream-soft/80 px-3.5 py-3">
        <p className="text-sm font-medium text-ink">Gezondheidsgegevens</p>
        <p className="text-xs text-ink-soft mt-1 leading-relaxed">
          {healthConsentAt
            ? `Toestemming gegeven op ${new Date(healthConsentAt).toLocaleDateString("nl-NL")}.`
            : "Nog geen toestemming — nodig om cyclus- en check-in-gegevens te gebruiken."}
        </p>
        {!healthConsentAt && (
          <Button
            type="button"
            size="sm"
            className="mt-2.5"
            disabled={isPending}
            onClick={() => {
              setError(null)
              startTransition(async () => {
                const result = await runAction(() => acceptHealthDataConsent())
                if (result.error) setError(result.error)
                else router.refresh()
              })
            }}
          >
            Toestemming geven
          </Button>
        )}
      </div>

      {buddyAiAvailable && (
        <div className="rounded-xl bg-cream-soft/80 px-3.5 py-3">
          <p className="text-sm font-medium text-ink">Buddy AI</p>
          <p className="text-xs text-ink-soft mt-1 leading-relaxed">
            {buddyAiConsentAt
              ? `AI-toestemming actief sinds ${new Date(buddyAiConsentAt).toLocaleDateString("nl-NL")}.`
              : "Zonder toestemming blijft Buddy lokaal (geen externe AI)."}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {!buddyAiConsentAt ? (
              <Button
                type="button"
                size="sm"
                disabled={isPending}
                onClick={() => {
                  setError(null)
                  startTransition(async () => {
                    const result = await runAction(() => acceptBuddyAiConsent())
                    if (result.error) setError(result.error)
                    else router.refresh()
                  })
                }}
              >
                AI toestaan
              </Button>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setError(null)
                  startTransition(async () => {
                    const result = await runAction(() => revokeBuddyAiConsent())
                    if (result.error) setError(result.error)
                    else router.refresh()
                  })
                }}
                className="text-sm font-medium text-ink-soft min-h-11 px-1 touch-manipulation"
              >
                AI-toestemming intrekken
              </button>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
