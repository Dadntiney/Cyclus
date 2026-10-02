import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { cache } from "react"
import type { Database } from "@/types/database"

/** One Supabase server client per request — layouts + pages share it. */
export const createClient = cache(async () => {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component — the middleware will refresh
            // the session, so writes here can be safely ignored.
          }
        },
      },
    },
  )
})

// The layout and the page it wraps both need the signed-in user for the
// same request. getClaims() verifies the session JWT locally against the
// project's asymmetric signing keys (fetched once and cached), so rendering
// a page no longer waits on a round-trip to the Auth server. Pages only need
// the user's id; server actions keep using auth.getUser(). React's cache()
// dedupes it to one call per request.
export const getAuthedUser = cache(async (): Promise<{ id: string } | null> => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const sub = data?.claims.sub
  return sub ? { id: sub } : null
})
