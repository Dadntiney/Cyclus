import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/profile/profile-form"
import { logout } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"

export default async function ProfielPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: profile }, { data: cycleProfile }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("cycle_profiles").select("*").eq("user_id", user.id).maybeSingle(),
  ])

  if (!profile) return null

  return (
    <div className="max-w-2xl mx-auto px-5 py-6 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Profiel</h1>
        <p className="text-sm text-ink-soft mt-1">{user.email}</p>
      </div>

      <ProfileForm profile={profile} cycleProfile={cycleProfile} />

      <form action={logout} className="md:hidden">
        <Button type="submit" variant="secondary" className="w-full">
          Uitloggen
        </Button>
      </form>
    </div>
  )
}
