"use server"

import { createClient } from "@/lib/supabase/server"
import { MAX_SYNCED_VALUE_LENGTH, syncedKeyOwner } from "@/lib/client-state/keys"

/**
 * Stores (value) or removes (null) one synced localStorage entry on the
 * account. Only known keys that belong to the signed-in user are accepted.
 */
export async function saveClientState(key: string, value: string | null) {
  if (typeof key !== "string" || (value !== null && typeof value !== "string")) {
    return { error: "Ongeldige gegevens." }
  }
  if (value !== null && value.length > MAX_SYNCED_VALUE_LENGTH) {
    return { error: "Te veel gegevens om op te slaan." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }
  if (syncedKeyOwner(key) !== user.id) return { error: "Ongeldige sleutel." }

  const { error } =
    value === null
      ? await supabase.from("user_client_state").delete().eq("user_id", user.id).eq("key", key)
      : await supabase
          .from("user_client_state")
          .upsert({ user_id: user.id, key, value, updated_at: new Date().toISOString() })

  if (error) return { error: "Opslaan op je account is niet gelukt." }
  return { success: true }
}
