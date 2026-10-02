import { redirect } from "next/navigation"
import { createClient, getAuthedUser } from "@/lib/supabase/server"
import { WelcomePage } from "@/components/landing/welcome-page"

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
