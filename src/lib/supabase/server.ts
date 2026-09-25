import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { cache } from "react"
import type { Database } from "@/types/database"

export async function createClient() {
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
}

// The layout and the page it wraps both need the authed user for the same
// request; auth.getUser() re-validates the session against Supabase's Auth
// server over the network, so without this every navigation paid for that
// round-trip twice. React's cache() dedupes it to one call per request.
export const getAuthedUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})
