import { cache } from "react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfileOverview } from "@/lib/data/profile"
import { getReminders } from "@/lib/data/reminders"
import type { ThemePreference } from "@/lib/actions/profile"

/** Shared loader for /profiel/* settings sub-routes. */
export const loadProfileSettings = cache(async () => {
  const user = await getAuthedUser()
  if (!user) return null

  const [overview, reminders] = await Promise.all([
    getProfileOverview(user.id),
    getReminders(user.id),
  ])
  if (!overview.profile) return null

  const themePreference: ThemePreference =
    overview.profile.theme_preference === "light" || overview.profile.theme_preference === "dark"
      ? overview.profile.theme_preference
      : "auto"

  return { user, ...overview, reminders, themePreference }
})
