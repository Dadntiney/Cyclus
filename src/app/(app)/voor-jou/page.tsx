import Link from "next/link"
import { ChevronRight, Heart } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { Card } from "@/components/ui/card"

interface ModuleTile {
  href: string
  emoji: string
  title: string
  description: string
}

const ENABLED_MODULES: Record<string, ModuleTile> = {
  movement_enabled: {
    href: "/training",
    emoji: "🏋️",
    title: "Beweging",
    description: "Je weekprogramma en trainingsbibliotheek.",
  },
  nutrition_enabled: {
    href: "/voeding",
    emoji: "🥗",
    title: "Voeding",
    description: "Recepten die passen bij jouw voorkeuren.",
  },
  mental_wellbeing_enabled: {
    href: "/mentale-rust",
    emoji: "🧘",
    title: "Mentale rust",
    description: "Korte meditaties, mindfulness en affirmaties.",
  },
  sleep_tracking_enabled: {
    href: "/slaap",
    emoji: "🌙",
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
                    <p className="text-base font-medium text-ink">
                      <span className="mr-1.5" aria-hidden>
                        {tile.emoji}
                      </span>
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
                <p className="text-sm text-ink-soft mt-0.5">Je opgeslagen recepten en oefeningen.</p>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} />
            </Card>
          </Link>
        </div>
      )}

      {disabledKeys.length > 0 && (
        <div>
          <h2 className="font-display text-base text-ink mb-2.5">Nog niet aanstaan voor jou</h2>
          <Card className="p-0 divide-y divide-line">
            {disabledKeys.map((key) => (
              <div key={key} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <p className="text-sm text-ink-soft">{DISABLED_HINTS[key]}</p>
                <Link href="/profiel" className="text-xs font-medium text-sage-dark shrink-0 touch-manipulation">
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
