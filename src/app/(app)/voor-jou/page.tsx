import Link from "next/link"
import { ChevronRight, Heart, Dumbbell, Salad, Brain, Moon, BookOpen, NotebookPen, Stethoscope } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { Card } from "@/components/ui/card"

interface ModuleTile {
  href: string
  icon: LucideIcon
  title: string
  description: string
}

const ENABLED_MODULES: Record<string, ModuleTile> = {
  movement_enabled: {
    href: "/training",
    icon: Dumbbell,
    title: "Beweging",
    description: "Je weekprogramma en trainingsbibliotheek.",
  },
  nutrition_enabled: {
    href: "/voeding",
    icon: Salad,
    title: "Voeding",
    description: "Recepten die passen bij jouw voorkeuren.",
  },
  mental_wellbeing_enabled: {
    href: "/mentale-rust",
    icon: Brain,
    title: "Mentale rust",
    description: "Korte meditaties, mindfulness en affirmaties.",
  },
  sleep_tracking_enabled: {
    href: "/slaap",
    icon: Moon,
    title: "Slaap",
    description: "Je slaapduur en eenvoudige inzichten.",
  },
}

const DISABLED_HINTS: Record<string, string> = {
  movement_enabled: "Beweging staat nu uit",
  nutrition_enabled: "Voeding staat nu uit",
  mental_wellbeing_enabled: "Mentale rust staat nu uit",
  sleep_tracking_enabled: "Slaap bijhouden staat nu uit",
}

const DISABLED_PROFILE_ANCHORS: Record<string, string> = {
  movement_enabled: "/profiel#beweging",
  nutrition_enabled: "/profiel#voeding",
  mental_wellbeing_enabled: "/profiel#mentale-rust",
  sleep_tracking_enabled: "/profiel#slaap",
}

export default async function VoorJouPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const profile = await getProfile(user.id)
  if (!profile) return null

  const flags: Record<string, boolean> = {
    movement_enabled: profile.movement_enabled,
    nutrition_enabled: profile.nutrition_enabled,
    mental_wellbeing_enabled: profile.mental_wellbeing_enabled === true,
    sleep_tracking_enabled: profile.sleep_tracking_enabled === true,
  }

  const enabledKeys = Object.keys(ENABLED_MODULES).filter((k) => flags[k])
  const disabledKeys = Object.keys(ENABLED_MODULES).filter((k) => !flags[k])

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Voor jou</h1>
        <p className="text-sm text-ink-soft mt-1">
          Al je ondersteuning bij elkaar — helemaal aan te passen aan wat jij nu nodig hebt.
        </p>
      </div>

      {enabledKeys.length > 0 && (
        <div className="flex flex-col gap-3">
          {enabledKeys.map((key) => {
            const tile = ENABLED_MODULES[key]
            return (
              <Link key={key} href={tile.href}>
                <Card interactive className="flex items-center justify-between gap-4 touch-manipulation">
                  <div className="min-w-0">
                    <p className="text-base font-medium text-ink inline-flex items-center gap-1.5">
                      <tile.icon className="h-4 w-4 text-sage-dark" strokeWidth={1.75} aria-hidden />
                      {tile.title}
                    </p>
                    <p className="text-sm text-ink-soft mt-0.5">{tile.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} />
                </Card>
              </Link>
            )
          })}

          <Link href="/voeding/favorieten">
            <Card interactive className="flex items-center justify-between gap-4 touch-manipulation">
              <div className="min-w-0">
                <p className="text-base font-medium text-ink inline-flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-peach" strokeWidth={1.75} />
                  Favorieten
                </p>
                <p className="text-sm text-ink-soft mt-0.5">Je opgeslagen recepten.</p>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} />
            </Card>
          </Link>
        </div>
      )}

      <div>
        <h2 className="font-display text-base text-ink mb-2.5">Meer voor jou</h2>
        <div className="flex flex-col gap-3">
          {(
            [
              {
                href: "/kennis",
                icon: BookOpen,
                title: "Kennis",
                description: "Uitleg over hormonen, overgang en leefstijl.",
              },
              {
                href: "/dagboek",
                icon: NotebookPen,
                title: "Dagboek",
                description: "Schrijf van je af — alleen jij ziet dit.",
              },
              {
                href: "/cyclus/samenvatting",
                icon: Stethoscope,
                title: "Voor je arts",
                description: "Samenvatting van je check-ins om mee te nemen.",
              },
            ] as const
          ).map((tile) => (
            <Link key={tile.href} href={tile.href}>
              <Card interactive className="flex items-center justify-between gap-4 touch-manipulation">
                <div className="min-w-0">
                  <p className="text-base font-medium text-ink inline-flex items-center gap-1.5">
                    <tile.icon className="h-4 w-4 text-sage-dark" strokeWidth={1.75} aria-hidden />
                    {tile.title}
                  </p>
                  <p className="text-sm text-ink-soft mt-0.5">{tile.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} />
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {disabledKeys.length > 0 && (
        <div>
          <h2 className="font-display text-base text-ink mb-2.5">Nog niet aanstaan voor jou</h2>
          <Card className="p-0 divide-y divide-line">
            {disabledKeys.map((key) => (
              <div key={key} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <p className="text-sm text-ink-soft">{DISABLED_HINTS[key]}</p>
                <Link
                  href={DISABLED_PROFILE_ANCHORS[key]}
                  className="text-xs font-medium text-sage-dark shrink-0 touch-manipulation"
                >
                  Zet aan
                </Link>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  )
}
