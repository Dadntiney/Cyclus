import Link from "next/link"
import { ChevronRight, UserRound, Sparkles, CalendarHeart, Bell } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfileOverview } from "@/lib/data/profile"
import { ProfileHero } from "@/components/profile/profile-hero"
import { ThemeSection } from "@/components/profile/theme-section"
import type { ThemePreference } from "@/lib/actions/profile"
import { ProgressSection } from "@/components/profile/progress-section"
import { FavoritesSection } from "@/components/profile/favorites-section"
import { PrivacySection } from "@/components/profile/privacy-section"
import { logout } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const HUB_LINKS = [
  {
    href: "/profiel/account",
    icon: UserRound,
    title: "Account & doelen",
    description: "Naam, lichaam, doelen en aandachtspunten.",
  },
  {
    href: "/voor-jou",
    icon: Sparkles,
    title: "Jouw modules",
    description: "Beweging, voeding, mentale rust, slaap, kennis en dagboek.",
  },
  {
    href: "/profiel/cyclus",
    icon: CalendarHeart,
    title: "Cyclus",
    description: "Cycluslengte, levensfase en overgang.",
  },
  {
    href: "/profiel/meldingen",
    icon: Bell,
    title: "Meldingen & Buddy",
    description: "Goedemorgen, herinneringen, push en buddy-toon.",
  },
] as const

export default async function ProfielPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const { profile, stats, favoriteRecipes, favoriteExercises, milestones } =
    await getProfileOverview(user.id)

  if (!profile) return null

  const themePreference: ThemePreference =
    profile.theme_preference === "light" || profile.theme_preference === "dark"
      ? profile.theme_preference
      : "auto"

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6">
      <ProfileHero
        userId={user.id}
        name={profile.name}
        avatarUrl={profile.avatar_url}
        memberSince={stats.memberSince}
      />

      <ThemeSection initial={themePreference} />

      <section aria-label="Instellingen">
        <h2 className="font-display text-lg text-ink mb-2.5">Instellingen</h2>
        <div className="flex flex-col gap-3">
          {HUB_LINKS.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card interactive className="flex items-center justify-between gap-4 touch-manipulation">
                <div className="min-w-0">
                  <p className="text-base font-medium text-ink inline-flex items-center gap-1.5">
                    <item.icon className="h-4 w-4 text-sage-dark" strokeWidth={1.75} aria-hidden />
                    {item.title}
                  </p>
                  <p className="text-sm text-ink-soft mt-0.5">{item.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} />
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <ProgressSection
        totalWorkoutsCompleted={stats.totalWorkoutsCompleted}
        totalCheckins={stats.totalCheckins}
        currentStreak={stats.currentStreak}
        bestStreak={stats.bestStreak}
        milestones={milestones}
      />
      <FavoritesSection favoriteRecipes={favoriteRecipes} favoriteExercises={favoriteExercises} />
      <PrivacySection />

      <form action={logout} className="md:hidden">
        <Button type="submit" variant="secondary" className="w-full">
          Uitloggen
        </Button>
      </form>
    </div>
  )
}
