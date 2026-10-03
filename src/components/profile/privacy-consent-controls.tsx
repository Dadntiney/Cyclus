"use client"

import { useState, useTransition, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
  acceptBuddyAiConsent,
  acceptHealthDataConsent,
  revokeBuddyAiConsent,
} from "@/lib/actions/consent"
import { Button, textActionClass } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { runAction } from "@/lib/client/run-action"

function ConsentRow({ title, status, children }: { title: string; status: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 p-4">
      <p className="text-base font-medium text-ink">{title}</p>
      <p className="text-sm text-ink-soft">{status}</p>
      {children && <div className="mt-2 flex flex-wrap gap-2">{children}</div>}
    </div>
  )
}

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
      <Card padding="none" className="divide-y divide-line">
        <ConsentRow
          title="Gezondheidsgegevens"
          status={
            healthConsentAt
              ? `Toestemming gegeven op ${new Date(healthConsentAt).toLocaleDateString("nl-NL")}.`
              : "Nog geen toestemming. Die is nodig om cyclus- en check-in-gegevens te gebruiken."
          }
        >
          {!healthConsentAt && (
            <Button
              type="button"
              size="sm"
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
        </ConsentRow>

        {buddyAiAvailable && (
          <ConsentRow
            title="Buddy AI"
            status={
              buddyAiConsentAt
                ? `AI-toestemming actief sinds ${new Date(buddyAiConsentAt).toLocaleDateString("nl-NL")}.`
                : "Zonder toestemming blijft Buddy lokaal (geen externe AI)."
            }
          >
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
                className={textActionClass("text-ink-soft")}
              >
                AI-toestemming intrekken
              </button>
            )}
          </ConsentRow>
        )}
      </Card>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
