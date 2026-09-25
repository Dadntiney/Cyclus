import { getAuthedUser } from "@/lib/supabase/server"
import { getProfileOverview } from "@/lib/data/profile"
import { getReminders } from "@/lib/data/reminders"
import { ProfileHero } from "@/components/profile/profile-hero"
import { ProfileForm } from "@/components/profile/profile-form"
import { RemindersSection } from "@/components/profile/reminders-section"
import { ProgressSection } from "@/components/profile/progress-section"
import { FavoritesSection } from "@/components/profile/favorites-section"
import { PrivacySection } from "@/components/profile/privacy-section"
import { logout } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"

export default async function ProfielPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const [
    { profile, cycleProfile, hasMedications, stats, favoriteRecipes, favoriteExercises, milestones },
    reminders,
  ] = await Promise.all([getProfileOverview(user.id), getReminders(user.id)])

  if (!profile) return null

  return (
    <div className="w-full max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6">
      <ProfileHero
        userId={user.id}
        name={profile.name}
        avatarUrl={profile.avatar_url}
        memberSince={stats.memberSince}
      />

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <ProfileForm profile={profile} cycleProfile={cycleProfile} hasMedications={hasMedications} />
          <RemindersSection initialReminders={reminders} />
        </div>

        <div className="flex flex-col gap-5 mt-6 lg:mt-0">
          <ProgressSection
            totalWorkoutsCompleted={stats.totalWorkoutsCompleted}
            totalCheckins={stats.totalCheckins}
            currentStreak={stats.currentStreak}
            bestStreak={stats.bestStreak}
            milestones={milestones}
          />
          <FavoritesSection favoriteRecipes={favoriteRecipes} favoriteExercises={favoriteExercises} />
          <PrivacySection />
        </div>
      </div>

      <form action={logout} className="md:hidden">
        <Button type="submit" variant="secondary" className="w-full">
          Uitloggen
        </Button>
      </form>
    </div>
  )
}
