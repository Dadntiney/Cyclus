import { Suspense } from "react"
import { subDays } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { SYNC_WINDOW_DAYS } from "@/lib/client-state/keys"
import { AccountStateApply } from "@/components/client-state/account-state-apply"

/**
 * Loads her synced device state (week-plan adjustments, grocery checks,
 * servings, day closed) off the layout critical path and hands it to the
 * client, which copies it into localStorage. Streams in after first paint.
 */
export function AccountStateBoundary({ userId }: { userId: string }) {
  return (
    <Suspense fallback={null}>
      <AccountStateLoader userId={userId} />
    </Suspense>
  )
}

async function AccountStateLoader({ userId }: { userId: string }) {
  const supabase = await createClient()
  const since = subDays(new Date(), SYNC_WINDOW_DAYS).toISOString()
  const { data, error } = await supabase
    .from("user_client_state")
    .select("key, value")
    .eq("user_id", userId)
    // Servings are a lasting setting; dated entries only matter recently.
    .or(`updated_at.gte."${since}",key.like.cyclus:servings:*`)

  // On a failed load, leave the device as it is rather than treating the
  // account as empty (which would drop local entries).
  if (error) return null
  return <AccountStateApply userId={userId} rows={data ?? []} />
}
