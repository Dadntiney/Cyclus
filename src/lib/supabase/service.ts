import "server-only"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

/**
 * Privileged Supabase client using the service_role key — it bypasses
 * Row Level Security entirely. Only use this for trusted, server-only
 * operations that must write to tables/buckets regular user sessions
 * are intentionally not allowed to touch (e.g. writing recipe images).
 *
 * Never import this from a "use client" component, and never use it for
 * anything that should respect the signed-in user's own permissions —
 * use `@/lib/supabase/server` (the cookie-scoped client) for that.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase service role client is not configured (missing SUPABASE_SERVICE_ROLE_KEY).")
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
