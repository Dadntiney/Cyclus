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
  MessageCircle,
  Pill,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { Card } from "@/components/ui/card"

interface ModuleTile {
  href: string
  icon: LucideIcon
  title: string
  description: string
  accent?: "sage" | "peach" | "info"
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
    accent: "info",
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

function iconTone(accent?: ModuleTile["accent"]) {
  if (accent === "peach") return "text-peach"
  if (accent === "info") return "text-info"
  return "text-sage-dark"
}

function HubLink({ tile }: { tile: ModuleTile }) {
  return (
    <Link href={tile.href} className="block touch-manipulation">
      <Card interactive className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-base font-medium text-ink inline-flex items-center gap-1.5">
            <tile.icon className={`h-4 w-4 ${iconTone(tile.accent)}`} strokeWidth={1.75} aria-hidden />
            {tile.title}
          </p>
          <p className="text-sm text-ink-soft mt-0.5">{tile.description}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-ink-soft shrink-0" strokeWidth={1.75} />
      </Card>
    </Link>
  )
}

/**
 * Ontdek = library / companion hub — not a second Vandaag.
 * Daily picks stay on /vandaag; this page opens deeper destinations.
 */
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

  const favoriteTiles: ModuleTile[] = []
  if (flags.nutrition_enabled) {
    favoriteTiles.push({
      href: "/voeding/favorieten",
      icon: Heart,
      title: "Favoriete recepten",
      description: "Recepten die je hebt bewaard.",
      accent: "peach",
    })
  }
  if (flags.movement_enabled) {
    favoriteTiles.push({
      href: "/training/favorieten",
      icon: Heart,
      title: "Favoriete oefeningen",
      description: "Oefeningen die je hebt bewaard.",
      accent: "peach",
    })
  }

  const goalLine =
    profile.goals?.length > 0
      ? `Gericht op ${profile.goals.slice(0, 2).join(" en ").toLowerCase()}.`
      : "Bibliotheken, Buddy en meer — wanneer jij eraan toe bent."

  return (
    <div className="w-full max-w-2xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-7">
      <header>
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Ontdek</h1>
        <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">{goalLine}</p>
      </header>

      <section aria-labelledby="buddy-heading">
        <h2 id="buddy-heading" className="sr-only">
          Buddy
        </h2>
        <Link href="/buddy" className="block touch-manipulation">
          <Card interactive className="bg-sage-soft/45 border-transparent">
            <p className="text-xs font-medium text-sage-dark mb-1 inline-flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              Buddy
            </p>
            <p className="font-display text-lg text-ink leading-snug">
              Iemand om mee te praten over hoe je je voelt
            </p>
            <p className="text-sm text-ink-soft mt-1">
              Geen tip-feed — een rustig gesprek wanneer jij dat wilt.
            </p>
          </Card>
        </Link>
      </section>

      {enabledKeys.length > 0 && (
        <section aria-labelledby="modules-heading">
          <h2 id="modules-heading" className="font-display text-lg text-ink mb-2.5">
            Jouw programma’s
          </h2>
          <div className="flex flex-col gap-2.5">
            {enabledKeys.map((key) => (
              <HubLink key={key} tile={ENABLED_MODULES[key]} />
            ))}
            {favoriteTiles.map((tile) => (
              <HubLink key={tile.href} tile={tile} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="meer-heading">
        <h2 id="meer-heading" className="font-display text-lg text-ink mb-2.5">
          Meer
        </h2>
        <div className="flex flex-col gap-2.5">
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
                href: "/medicatie",
                icon: Pill,
                title: "Medicatie",
                description: "Overzicht en herinneringen.",
              },
            ] as const
          ).map((tile) => (
            <HubLink key={tile.href} tile={tile} />
          ))}
        </div>
        <p className="text-sm text-ink-soft mt-3 leading-relaxed">
          Cyclus-tools zoals je arts-samenvatting en klachtenlast vind je onder Cyclus.
        </p>
      </section>

      {disabledKeys.length > 0 && (
        <section aria-labelledby="disabled-heading">
          <h2 id="disabled-heading" className="font-display text-lg text-ink mb-2.5">
            Nog niet aanstaan
          </h2>
          <Card className="p-0 divide-y divide-line">
            {disabledKeys.map((key) => (
              <div key={key} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <p className="text-sm text-ink-soft">{DISABLED_HINTS[key]}</p>
                <Link
                  href={DISABLED_PROFILE_ANCHORS[key]}
                  className="text-sm font-medium text-sage-dark shrink-0 touch-manipulation min-h-11 inline-flex items-center"
                >
                  Zet aan
                </Link>
              </div>
            ))}
          </Card>
        </section>
      )}
    </div>
  )
}
