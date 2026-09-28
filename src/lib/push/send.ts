import "server-only"
import { createServiceClient } from "@/lib/supabase/service"
import { getWebPushClient } from "@/lib/push/web-push-client"

export interface PushPayload {
  title: string
  body: string
  /** App path to open on click, e.g. "/vandaag". */
  url: string
  /** De-duplicates simultaneous notifications of the same kind in the OS tray. */
  tag?: string
}

/**
 * Sends one push payload to every device the user has subscribed on.
 * Never throws — a single bad subscription (expired, revoked, uninstalled
 * PWA) must never stop the rest of the cron run. Expired/invalid
 * subscriptions (404/410 from the push service) are deleted so they stop
 * being retried forever.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<{ sent: number }> {
  const service = createServiceClient()
  const { data: subscriptions } = await service
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId)

  if (!subscriptions?.length) return { sent: 0 }

  const webpush = getWebPushClient()
  let sent = 0

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
        )
        sent++
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          await service.from("push_subscriptions").delete().eq("endpoint", sub.endpoint)
        } else {
          console.error(`[push] Failed to send to ${sub.endpoint.slice(0, 60)}...:`, error)
        }
      }
    }),
  )

  return { sent }
}
