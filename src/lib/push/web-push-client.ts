import "server-only"
import webpush from "web-push"

let configured = false

/**
 * Lazily configures the web-push library with this deployment's VAPID keys.
 * Throws with a clear message if they're missing rather than silently no-
 * op'ing, so a misconfigured environment fails loudly in the cron logs
 * instead of quietly never sending anything.
 */
export function getWebPushClient() {
  if (!configured) {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    const subject = process.env.VAPID_SUBJECT || "mailto:support@cyclus.app"

    if (!publicKey || !privateKey) {
      throw new Error(
        "Push notifications are not configured: NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY missing.",
      )
    }

    webpush.setVapidDetails(subject, publicKey, privateKey)
    configured = true
  }
  return webpush
}
