"use server"

import { createClient } from "@/lib/supabase/server"

// The cron later POSTs to this URL from our server, so only accept the push
// services browsers actually hand out — never an arbitrary address.
const PUSH_SERVICE_HOSTS = [
  /(^|\.)push\.services\.mozilla\.com$/,
  /(^|\.)fcm\.googleapis\.com$/,
  /(^|\.)android\.googleapis\.com$/,
  /(^|\.)notify\.windows\.com$/,
  /(^|\.)push\.apple\.com$/,
]

function isValidSubscription(input: PushSubscriptionInput): boolean {
  if (!input?.endpoint || input.endpoint.length > 1000) return false
  if (!input.keys?.p256dh || !input.keys?.auth) return false
  if (input.keys.p256dh.length > 200 || input.keys.auth.length > 100) return false
  try {
    const url = new URL(input.endpoint)
    return url.protocol === "https:" && PUSH_SERVICE_HOSTS.some((host) => host.test(url.hostname))
  } catch {
    return false
  }
}

export interface PushSubscriptionInput {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

/**
 * Saves (or refreshes) a browser's push subscription for the current user.
 * Deletes any existing row for this exact endpoint owned by this user first
 * (re-subscribing the same device, or logout/login on the same device, is
 * the common case) and inserts fresh — deliberately scoped to "own rows
 * only" rather than an upsert, so RLS alone (not this action's logic) is
 * what decides whether a subscription can be touched: if the endpoint still
 * belongs to a *different* account (rare: shared device, account switch
 * without clearing the browser subscription), the delete simply can't touch
 * that row and the insert below fails on the unique constraint instead of
 * silently taking over someone else's subscription.
 */
export async function subscribeToPush(input: PushSubscriptionInput, userAgent?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }
  if (!isValidSubscription(input)) {
    return { error: "Deze browser gaf een onbekend meldingsadres terug. Meldingen inschakelen is niet gelukt." }
  }

  await supabase.from("push_subscriptions").delete().eq("endpoint", input.endpoint).eq("user_id", user.id)

  const { error } = await supabase.from("push_subscriptions").insert({
    user_id: user.id,
    endpoint: input.endpoint,
    p256dh: input.keys.p256dh,
    auth: input.keys.auth,
    user_agent: userAgent?.slice(0, 300) ?? null,
  })

  if (error) return { error: "Meldingen inschakelen is niet gelukt. Probeer het later opnieuw." }
  return { success: true }
}

export async function unsubscribeFromPush(endpoint: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
    .eq("user_id", user.id)

  if (error) return { error: "Uitschakelen is niet gelukt." }
  return { success: true }
}
