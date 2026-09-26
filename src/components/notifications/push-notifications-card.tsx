"use client"

import { useEffect, useState, useTransition } from "react"
import { Bell, BellOff } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
        if (subscription) {
          await unsubscribeFromPush(subscription.endpoint)
          await subscription.unsubscribe()
        }
        setStatus("not-subscribed")
      } catch {
        setError("Uitschakelen is niet gelukt. Probeer het later opnieuw.")
      }
    })
  }

  if (status === "checking" || status === "unsupported") return null

  return (
    <Card>
      <p className="text-sm font-medium text-ink inline-flex items-center gap-1.5 mb-1">
        <Bell className="h-4 w-4 text-sage-dark" strokeWidth={1.75} />
        Pushmeldingen
      </p>

      {status === "ios-needs-install" && (
        <p className="text-xs text-ink-soft">
          Zet Cyclus eerst toe aan je beginscherm (deel-icoon → &ldquo;Zet op beginscherm&rdquo;) om
          pushmeldingen te kunnen ontvangen — dat is een beperking van iOS, niet van Cyclus.
        </p>
      )}

      {status === "denied" && (
        <p className="text-xs text-ink-soft">
          Je hebt meldingen voor Cyclus geblokkeerd in je browser. Zet dit aan via de
          site-instellingen van je browser om weer meldingen te ontvangen.
        </p>
      )}

      {(status === "subscribed" || status === "not-subscribed") && (
        <>
          <p className="text-xs text-ink-soft mb-3">
            Ontvang je ingestelde herinneringen ook als Cyclus niet open staat — helemaal
            optioneel, en je bepaalt zelf welke herinneringen je hieronder aan hebt staan.
          </p>
          {error && <p className="text-xs text-danger mb-3">{error}</p>}
          {status === "subscribed" ? (
            <Button variant="secondary" size="sm" onClick={handleDisable} disabled={isPending}>
              <BellOff className="h-4 w-4" strokeWidth={1.75} />
              {isPending ? "Bezig..." : "Pushmeldingen uitzetten op dit apparaat"}
            </Button>
          ) : (
            <Button size="sm" onClick={handleEnable} disabled={isPending}>
              <Bell className="h-4 w-4" strokeWidth={1.75} />
              {isPending ? "Bezig..." : "Pushmeldingen aanzetten op dit apparaat"}
            </Button>
          )}
        </>
      )}
    </Card>
  )
}
