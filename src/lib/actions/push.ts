"use server"

import { createClient } from "@/lib/supabase/server"

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

  await supabase.from("push_subscriptions").delete().eq("endpoint", input.endpoint).eq("user_id", user.id)

  const { error } = await supabase.from("push_subscriptions").insert({
    user_id: user.id,
    endpoint: input.endpoint,
    p256dh: input.keys.p256dh,
    auth: input.keys.auth,
    user_agent: userAgent ?? null,
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
