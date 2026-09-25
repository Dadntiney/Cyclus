import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ testMode?: string }>
}) {
  const { testMode } = await searchParams
  const showTestModeBanner = testMode === "1" && process.env.AUTH_TEST_MODE === "true"
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
      {showTestModeBanner && (
        <div className="bg-sage text-white text-sm text-center py-2 px-4">
          Testmodus: account direct geactiveerd zonder e-mailbevestiging.
        </div>
      )}
      <OnboardingWizard initialName={profile?.name ?? ""} />
    </div>
  )
}
