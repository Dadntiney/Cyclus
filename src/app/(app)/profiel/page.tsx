import {
  UserRound,
  CalendarHeart,
  Layers,
  Bell,
  MessageCircle,
  BarChart3,
  Shield,
  NotebookPen,
  Heart,
} from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfileOverview } from "@/lib/data/profile"
import { ProfileHero } from "@/components/profile/profile-hero"
import { ThemeSection } from "@/components/profile/theme-section"
import { ProfileHubGroup, ProfileHubRow } from "@/components/profile/profile-hub-list"
import type { ThemePreference } from "@/lib/actions/profile"
import { logout } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"

/**
 * Profiel hub — doors only.
 *
 * Job: “waar moet ik zijn?” in <5s. Content lives on subpages.
 */
const OVER_MIJ = [
  {
    href: "/profiel/gegevens",
    icon: UserRound,
    title: "Mijn gegevens",
    description: "Naam, lichaam, doelen en aandachtspunten.",
  },
  {
    href: "/profiel/cyclus",
    icon: CalendarHeart,
    title: "Mijn cyclus",
    description: "Lengte, regelmaat, levensfase en overgang.",
  },
  {
    href: "/profiel/gebruik",
    icon: Layers,
    title: "Wat ik gebruik",
    description: "Beweging, voeding, mentale rust, slaap en medicatie.",
  },
] as const

const APP = [
  {
    href: "/favorieten",
    icon: Heart,
    title: "Favorieten",
    description: "Opgeslagen recepten en oefeningen.",
  },
  {
    href: "/profiel/meldingen",
    icon: Bell,
    title: "Meldingen",
    description: "Goedemorgen, herinneringen en pushberichten.",
  },
  {
    href: "/profiel/buddy",
    icon: MessageCircle,
    title: "Buddy",
    description: "Welke toon en hoe vaak je Buddy zich laat horen.",
  },
  {
    href: "/dagboek",
    icon: NotebookPen,
    title: "Dagboek",
    description: "Schrijf van je af — alleen jij ziet dit.",
  },
] as const

const ACCOUNT = [
  {
    href: "/profiel/voortgang",
    icon: BarChart3,
    title: "Mijn voortgang",
    description: "Check-ins, trainingen en mijlpalen.",
  },
  {
    href: "/profiel/privacy",
    icon: Shield,
    title: "Privacy & gegevens",
    description: "Exporteren of account verwijderen.",
  },
] as const

export default async function ProfielPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const { profile, stats } = await getProfileOverview(user.id)
  if (!profile) return null

  const themePreference: ThemePreference =
    profile.theme_preference === "light" || profile.theme_preference === "dark"
      ? profile.theme_preference
      : "auto"

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-7">
      <ProfileHero
        userId={user.id}
        name={profile.name}
        avatarUrl={profile.avatar_url}
        memberSince={stats.memberSince}
      />

      <ProfileHubGroup title="Over mij" items={OVER_MIJ} />

      <ProfileHubGroup title="In de app" items={APP} />

      <ThemeSection initial={themePreference} />

      <ProfileHubGroup title="Account" items={ACCOUNT} />

      <form action={logout}>
        <Button type="submit" variant="secondary" className="w-full">
          Uitloggen
        </Button>
      </form>
    </div>
  )
}
