"use client"

import { useEffect, useState, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { SwitchRow } from "@/components/profile/setting-rows"
import { subscribeToPush, unsubscribeFromPush } from "@/lib/actions/push"

type Status = "checking" | "unsupported" | "ios-needs-install" | "denied" | "subscribed" | "not-subscribed"

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent
  const isIos = /iPad|iPhone|iPod/.test(ua)
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches
  return isIos && !isStandalone
}

/**
 * Real, working web push opt-in: subscribes this browser via the service
 * worker's PushManager and stores the subscription server-side so the cron
 * job (src/app/api/cron/send-reminders) can actually reach it later.
 * Distinct from — and in addition to — the in-app-only toast/Notification
 * fallback in ReminderToastHost, which still works even where this can't
 * (e.g. she hasn't enabled this yet, or the platform lacks support).
 */
export function PushNotificationsCard() {
  const [status, setStatus] = useState<Status>("checking")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function check() {
      if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        if (!cancelled) setStatus(isIosSafari() ? "ios-needs-install" : "unsupported")
        return
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setStatus("denied")
        return
      }
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (!cancelled) setStatus(subscription ? "subscribed" : "not-subscribed")
      } catch {
        if (!cancelled) setStatus("not-subscribed")
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [])

  function handleEnable() {
    setError(null)
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission()
        if (permission !== "granted") {
          setStatus("denied")
          return
        }
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!publicKey) {
          setError("Meldingen zijn momenteel niet beschikbaar.")
          return
        }
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        })
        const json = subscription.toJSON()
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
          setError("Meldingen inschakelen is niet gelukt.")
          return
        }
        const result = await subscribeToPush(
          { endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } },
          navigator.userAgent,
        )
        if (result.error) {
          setError(result.error)
          return
        }
        setStatus("subscribed")
      } catch {
        setError("Meldingen inschakelen is niet gelukt. Probeer het later opnieuw.")
      }
    })
  }

  function handleDisable() {
    setError(null)
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        let cleanupError: string | null = null
        if (subscription) {
          const result = await unsubscribeFromPush(subscription.endpoint)
          if (result?.error) cleanupError = result.error
          await subscription.unsubscribe()
        }
        // The browser-level unsubscribe is what actually stops notifications,
        // so the status always reflects that — even if the server-side
        // cleanup below failed, she won't receive push messages anymore.
        setStatus("not-subscribed")
        if (cleanupError) setError(cleanupError)
      } catch {
        setError("Uitschakelen is niet gelukt. Probeer het later opnieuw.")
      }
    })
  }

  if (status === "checking" || status === "unsupported") return null

  const title = "Meldingen op dit apparaat"

  return (
    <Card id="pushmeldingen" padding="none" className="scroll-mt-4 px-4">
      {status === "subscribed" || status === "not-subscribed" ? (
        <SwitchRow
          title={title}
          description={
            isPending
              ? "Even bezig…"
              : "Je herinneringen, ook als GoFiev niet openstaat. Jij kiest welke er aanstaan."
          }
          checked={status === "subscribed"}
          onChange={(on) => (on ? handleEnable() : handleDisable())}
          disabled={isPending}
        />
      ) : (
        <div className="flex min-h-14 flex-col justify-center gap-0.5 py-3">
          <p className="text-base font-medium text-ink">{title}</p>
          <p className="text-sm text-ink-soft">
            {status === "ios-needs-install" ? (
              <>
                Zet GoFiev eerst op je beginscherm (deel-icoon → &ldquo;Zet op beginscherm&rdquo;) om
                pushmeldingen te kunnen ontvangen. Dat is een beperking van iOS, niet van GoFiev.
              </>
            ) : (
              <>
                Je hebt meldingen voor GoFiev geblokkeerd in je browser. Zet ze aan via de
                site-instellingen van je browser om weer meldingen te ontvangen.
              </>
            )}
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="pb-3 text-sm text-danger">
          {error}
        </p>
      )}
    </Card>
  )
}
