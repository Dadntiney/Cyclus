import Link from "next/link"
import {
  ChevronRight,
  Heart,
  Dumbbell,
  Salad,
  Brain,
  Moon,
  BookOpen,
  NotebookPen,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { getVandaagData } from "@/lib/data/vandaag"
import { getPhaseContent } from "@/lib/cycle/phase-content"
import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
    description: "Bibliotheek en weekprogramma.",
  },
  nutrition_enabled: {
    href: "/voeding",
    icon: Salad,
    title: "Voeding",
    description: "Recepten die bij jou passen.",
  },
  mental_wellbeing_enabled: {
    href: "/mentale-rust",
    icon: Brain,
    title: "Mentale rust",
    description: "Korte oefeningen en affirmaties.",
  },
  sleep_tracking_enabled: {
    href: "/slaap",
    icon: Moon,
    title: "Slaap",
    description: "Slaapduur en eenvoudige inzichten.",
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

  const [profile, vandaag] = await Promise.all([getProfile(user.id), getVandaagData(user.id)])
  if (!profile) return null

  const flags: Record<string, boolean> = {
    movement_enabled: profile.movement_enabled,
    nutrition_enabled: profile.nutrition_enabled,
    mental_wellbeing_enabled: profile.mental_wellbeing_enabled === true,
    sleep_tracking_enabled: profile.sleep_tracking_enabled === true,
  }

  const enabledKeys = Object.keys(ENABLED_MODULES).filter((k) => flags[k])
  const disabledKeys = Object.keys(ENABLED_MODULES).filter((k) => !flags[k])

  const favoriteTiles: ModuleTile[] = []
  if (flags.nutrition_enabled) {
    favoriteTiles.push({
      href: "/voeding/favorieten",
      icon: Heart,
      title: "Favoriete recepten",
      description: "Recepten die je hebt bewaard.",
    })
  }
  if (flags.movement_enabled) {
    favoriteTiles.push({
      href: "/training/favorieten",
      icon: Heart,
      title: "Favoriete oefeningen",
      description: "Oefeningen die je hebt bewaard.",
    })
  }

  const phase = vandaag.cycleEstimate?.phase ?? null
  const phaseContent = phase ? getPhaseContent(phase) : null
  const goalLine =
    profile.goals?.length > 0
      ? `Gericht op ${profile.goals.slice(0, 2).join(" en ").toLowerCase()}.`
      : null
  const personalLine = [
    phaseContent ? `Nu: ${phaseContent.label.toLowerCase()}.` : null,
    goalLine,
  ]
    .filter(Boolean)
    .join(" ")

  const workout = vandaag.recommendation?.training.workout ?? null
  const recipe = vandaag.recommendation?.nutrition.recipe ?? null
  const hasTodayPicks = Boolean(workout || recipe)

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl text-ink">
          Voor jou{profile.name ? `, ${profile.name}` : ""}
        </h1>
        <p className="text-sm text-ink-soft mt-1">
          {personalLine || "Jouw modules en favorieten op één plek."}
        </p>
      </div>

      {hasTodayPicks && (
        <section>
          <div className="flex items-baseline justify-between gap-3 mb-2.5">
            <h2 className="font-display text-base text-ink">Voor jou vandaag</h2>
            <Link href="/vandaag" className="text-xs font-medium text-sage-dark touch-manipulation">
              Naar Vandaag
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {workout && (
              <Card className="p-4">
                <p className="text-xs font-medium text-sage-dark mb-1">Beweging</p>
                <p className="text-sm font-medium text-ink">{workout.title}</p>
                <p className="text-xs text-ink-soft mt-0.5">{workout.duration} minuten</p>
                <Link
                  href={`/training/${workout.id}`}
                  className={cn(buttonVariants({ size: "sm" }), "mt-3")}
                >
                  Start training
                </Link>
              </Card>
            )}
            {recipe && (
              <Card className="p-4">
                <p className="text-xs font-medium text-sage-dark mb-1">Voeding</p>
                <p className="text-sm font-medium text-ink">{recipe.title}</p>
                <Link
                  href={`/voeding/${recipe.id}`}
                  className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-3")}
                >
                  Bekijk recept
                </Link>
              </Card>
            )}
          </div>
        </section>
      )}

      {enabledKeys.length > 0 && (
        <div>
          <h2 className="font-display text-base text-ink mb-2.5">Jouw modules</h2>
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

            {favoriteTiles.map((tile) => (
              <Link key={tile.href} href={tile.href}>
                <Card interactive className="flex items-center justify-between gap-4 touch-manipulation">
                  <div className="min-w-0">
                    <p className="text-base font-medium text-ink inline-flex items-center gap-1.5">
                      <tile.icon className="h-4 w-4 text-peach" strokeWidth={1.75} aria-hidden />
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
        <p className="text-xs text-ink-soft mt-3">
          Cyclus-tools zoals je arts-samenvatting en klachtenlast vind je onder Cyclus.
        </p>
      </div>

      {disabledKeys.length > 0 && (
        <div>
          <h2 className="font-display text-base text-ink mb-2.5">Nog niet aanstaan</h2>
          <Card className="p-0 divide-y divide-line">
            {disabledKeys.map((key) => (
              <div key={key} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <p className="text-sm text-ink-soft">{DISABLED_HINTS[key]}</p>
                <Link
                  href={DISABLED_PROFILE_ANCHORS[key]}
                  className="text-xs font-medium text-sage-dark shrink-0 touch-manipulation min-h-11 inline-flex items-center"
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
