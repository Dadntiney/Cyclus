import type { Metadata } from "next"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfileOverview } from "@/lib/data/profile"
import { FEATURES } from "@/lib/navigation/features"
import { Page, PageSections } from "@/components/layout/page"
import { ListGroup, ListRow } from "@/components/ui/list-group"
import { ProfileHero } from "@/components/profile/profile-hero"
import { ThemeRow } from "@/components/profile/theme-row"
import { LogoutRow } from "@/components/profile/logout-row"
import type { ThemePreference } from "@/lib/actions/profile"

export const metadata: Metadata = { title: FEATURES.profiel.label }

/**
 * Profiel — "ik en mijn instellingen" (ontwerpvisie §4.2, §7.10).
 * Doors only, in three groups: what is hers (Van mij), how the app works
 * for her (Instellingen) and the account itself. Content lives on the
 * sub-pages; names and icons come from features.ts (link = h1 = back label).
 */
const VAN_MIJ = [
  { feature: FEATURES.dagboek, description: "Je notities, alleen voor jou" },
  { feature: FEATURES.medicatie, description: "Je overzicht en herinneringen" },
  { feature: FEATURES.voortgang, description: "Check-ins en mijlpalen" },
] as const

const INSTELLINGEN = [
  { feature: FEATURES.gegevens, description: "Naam, lichaam en doelen" },
  { feature: FEATURES.cyclusinstellingen, description: "Lengte, regelmaat, levensfase" },
  { feature: FEATURES.gebruik, description: "Onderdelen aan of uit" },
  { feature: FEATURES.meldingen, description: "Goedemorgen en herinneringen" },
  { feature: FEATURES.buddyStijl, description: "Toon en hoe vaak" },
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
    <Page>
      <ProfileHero
        userId={user.id}
        name={profile.name}
        avatarUrl={profile.avatar_url}
        memberSince={stats.memberSince}
      />

      <PageSections>
        <ListGroup label="Van mij">
          {VAN_MIJ.map(({ feature, description }) => (
            <ListRow
              key={feature.href}
              href={feature.href}
              icon={feature.icon}
              title={feature.label}
              description={description}
            />
          ))}
        </ListGroup>

        <ListGroup label="Instellingen">
          {INSTELLINGEN.map(({ feature, description }) => (
            <ListRow
              key={feature.href}
              href={feature.href}
              icon={feature.icon}
              title={feature.label}
              description={description}
            />
          ))}
          <ThemeRow initial={themePreference} />
        </ListGroup>

        <ListGroup label="Account">
          <ListRow
            href={FEATURES.privacy.href}
            icon={FEATURES.privacy.icon}
            title={FEATURES.privacy.label}
            description="Toestemming en je gegevens"
          />
          <LogoutRow />
        </ListGroup>
      </PageSections>
    </Page>
  )
}
