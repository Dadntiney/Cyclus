import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { WelcomePage } from "@/components/landing/welcome-page"
import { APP_DISPLAY_NAME, APP_TAGLINE } from "@/lib/theme/brand"

// The welcome page carries the full brand line, without the "· GoFiev" template.
export const metadata: Metadata = { title: { absolute: `${APP_DISPLAY_NAME} — ${APP_TAGLINE}` } }

export default async function RootPage() {
  const supabase = await createClient()
  const user = await getAuthedUser()

  if (!user) {
    return <WelcomePage />
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single()

  redirect(profile?.onboarding_completed ? "/vandaag" : "/onboarding")
}
