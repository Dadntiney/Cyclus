import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, name")
    .eq("id", user.id)
    .single()

  if (profile?.onboarding_completed) {
    redirect("/vandaag")
  }

  return (
    <div className="min-h-screen bg-cream">
      <OnboardingWizard initialName={profile?.name ?? ""} />
    </div>
  )
}
