"use client"

import { useState, useSyncExternalStore, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { acceptBuddyAiConsent } from "@/lib/actions/consent"
import { Button } from "@/components/ui/button"
import { BuddyRow, SpeakerLabel, bubbleClass } from "@/components/buddy/bubble"
import { runAction } from "@/lib/client/run-action"

/**
 * "Liever zonder AI", remembered on this device (BUD-7): the offer does not
 * come back on every visit. The account-wide choice stays in Privacy.
 * Cleared with her other GoFiev data on logout (`gofiev:` prefix).
 */
const DECLINED_KEY = "gofiev:buddy-ai-afgeslagen"

function readDeclined(): boolean {
  try {
    return window.localStorage.getItem(DECLINED_KEY) === "1"
  } catch {
    return false
  }
}

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange)
  return () => window.removeEventListener("storage", onChange)
}

/** On the server and during hydration the offer is hidden, so a declined offer never flashes. */
function declinedOnServer() {
  return true
}

/**
 * Buddy's question whether she may use an AI service, as a message in the
 * conversation (BUD-1, BUD-7) instead of a card above it. Only rendered
 * when AI is configured and she has not consented yet.
 */
export function BuddyAiConsentCard({ avatar = true, className }: { avatar?: boolean; className?: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const declined = useSyncExternalStore(subscribeToStorage, readDeclined, declinedOnServer)
  const [dismissed, setDismissed] = useState(false)

  if (declined || dismissed) return null

  function decline() {
    setDismissed(true)
    try {
      window.localStorage.setItem(DECLINED_KEY, "1")
    } catch {
      /* private mode: it is only hidden for this visit */
    }
  }

  return (
    <BuddyRow avatar={avatar} className={className}>
      <div className={bubbleClass({ from: "buddy", tail: avatar, className: "whitespace-normal" })}>
        <SpeakerLabel from="buddy" />
        <p>
          Als je wilt, mag ik een AI-dienst gebruiken om mee te denken. Dan kunnen relevante
          contextregels uit je profiel en check-ins meegestuurd worden. Zonder toestemming blijf ik
          lokaal meedenken. Zie de{" "}
          <Link href="/privacy" className="font-medium text-sage-dark underline underline-offset-2">
            privacyverklaring
          </Link>
          .
        </p>
        {error && (
          <p role="alert" className="mt-2 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={() => {
              setError(null)
              startTransition(async () => {
                const result = await runAction(() => acceptBuddyAiConsent())
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
          <Button type="button" size="sm" variant="ghost" disabled={isPending} onClick={decline}>
            Liever zonder AI
          </Button>
        </div>
      </div>
    </BuddyRow>
  )
}
