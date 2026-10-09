import type { Metadata } from "next"
import Link from "next/link"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { FEATURES, type Feature } from "@/lib/navigation/features"
import { ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"
import { Page } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ListGroup, ListRow } from "@/components/ui/list-group"

export const metadata: Metadata = { title: FEATURES.ontdek.label }

type Library = {
  feature: Feature
  description: string
  off?: boolean
}

/**
 * Ontdek answers one question: "wat kan ik doen of lezen?" (ontwerpvisie
 * §7.3). Four libraries in a calm 2×2 (4 in a row on desktop), and one row
 * to everything she saved. Planning, trackers and her own records live in
 * Vandaag, Cyclus and Profiel. A library she switched off stays visible
 * but quiet; the page behind it explains how to switch it on.
 */
export default async function OntdekPage() {
  const user = await getAuthedUser()
  if (!user) return null
  const profile = await getProfile(user.id)

  const libraries: Library[] = [
    {
      feature: FEATURES.voeding,
      description: "Recepten die bij je passen",
      off: profile?.nutrition_enabled === false,
    },
    {
      feature: FEATURES.beweging,
      description: "Trainingen op jouw tempo",
      off: profile?.movement_enabled === false,
    },
    {
      feature: FEATURES.mentaleRust,
      description: "Meditatie en ademhaling",
      off: profile?.mental_wellbeing_enabled !== true,
    },
    {
      feature: FEATURES.kennis,
      description: "Hormonen en de overgang",
    },
  ]

  return (
    <Page>
      <PageHeader
        title={FEATURES.ontdek.label}
        subtitle="Recepten, beweging, rust en uitleg. Kies wat je nu fijn lijkt."
      />
      <div className="flex flex-col gap-6">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {libraries.map(({ feature, description, off }) => {
            const Icon = feature.icon
            return (
              <li key={feature.href}>
                <Link href={feature.href} className="block h-full rounded-card touch-manipulation">
                  <Card padding="sm" interactive className="flex h-full flex-col gap-3">
                    <span
                      aria-hidden
                      className={cn(
                        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        off ? "bg-cream-soft text-ink-soft" : "bg-sage-soft text-sage-dark",
                      )}
                    >
                      <Icon {...ICON.md} />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className={cn("text-base font-medium", off ? "text-ink-soft" : "text-ink")}>
                          {feature.label}
                        </span>
                        {off && <Badge>staat uit</Badge>}
                      </span>
                      <span className="text-sm text-ink-soft line-clamp-2">{description}</span>
                    </span>
                  </Card>
                </Link>
              </li>
            )
          })}
        </ul>

        <ListGroup>
          <ListRow
            href={FEATURES.favorieten.href}
            icon={FEATURES.favorieten.icon}
            title={FEATURES.favorieten.label}
            description="Bewaarde recepten, beweging en momenten"
          />
        </ListGroup>
      </div>
    </Page>
  )
}
