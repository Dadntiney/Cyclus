import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  Brain,
  CalendarDays,
  Footprints,
  Heart,
  Moon,
  NotebookPen,
  Pill,
  Salad,
} from "lucide-react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { cn } from "@/lib/utils"

type Tile = {
  href: string
  title: string
  description: string
  icon: LucideIcon
  off?: boolean
  wide?: boolean
}

/**
 * Ontdek: one calm place for every library, so she can find back what she
 * saw yesterday. Modules she switched off stay visible but quiet — the page
 * behind them explains how to switch them on.
 */
export default async function OntdekPage() {
  const user = await getAuthedUser()
  if (!user) return null
  const profile = await getProfile(user.id)

  const tiles: Tile[] = [
    {
      href: "/deze-week",
      title: "Deze week",
      description: "Je weekplan voor eten en bewegen, en de boodschappenlijst.",
      icon: CalendarDays,
      wide: true,
    },
    {
      href: "/voeding",
      title: "Voeding",
      description: "Recepten die bij je passen.",
      icon: Salad,
      off: profile?.nutrition_enabled === false,
    },
    {
      href: "/training",
      title: "Beweging",
      description: "Trainingen op jouw tempo.",
      icon: Footprints,
      off: profile?.movement_enabled === false,
    },
    {
      href: "/mentale-rust",
      title: "Mentale rust",
      description: "Korte meditaties en ademhaling.",
      icon: Brain,
      off: profile?.mental_wellbeing_enabled !== true,
    },
    {
      href: "/slaap",
      title: "Slaap",
      description: "Je slaap en wat helpt.",
      icon: Moon,
      off: profile?.sleep_tracking_enabled !== true,
    },
    {
      href: "/kennis",
      title: "Kennis",
      description: "Uitleg over hormonen en de overgang.",
      icon: BookOpen,
    },
    {
      href: "/dagboek",
      title: "Dagboek",
      description: "Schrijf van je af, alleen voor jou.",
      icon: NotebookPen,
    },
    {
      href: "/favorieten",
      title: "Favorieten",
      description: "Wat je hebt bewaard.",
      icon: Heart,
    },
    {
      href: "/medicatie",
      title: "Medicatie",
      description: "Je eigen schema bijhouden.",
      icon: Pill,
    },
  ]

  return (
    <div className="w-full max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-10">
      <h1 className="font-display text-3xl lg:text-4xl text-ink">Ontdek</h1>
      <p className="text-sm text-ink-soft mt-1 mb-6">
        Alles wat GoFiev voor je heeft, op één plek. Kies wat je nu fijn lijkt.
      </p>
      <ul className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {tiles.map((tile) => (
          <li key={tile.href} className={cn(tile.wide && "col-span-2 lg:col-span-3")}>
            <Link
              href={tile.href}
              className={cn(
                "flex h-full gap-3 rounded-[1.25rem] border p-4 touch-manipulation transition-[border-color,transform] duration-150 motion-safe:active:scale-[0.985] hover:border-ink/20",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50",
                tile.wide ? "items-center bg-sage-soft border-transparent" : "flex-col bg-surface border-line",
              )}
            >
              <span
                className={cn(
                  "h-10 w-10 shrink-0 rounded-full flex items-center justify-center",
                  tile.wide ? "bg-surface" : "bg-sage-soft",
                  tile.off && "bg-cream-soft",
                )}
              >
                <tile.icon
                  className={cn("h-5 w-5", tile.off ? "text-ink-soft" : "text-sage-dark")}
                  strokeWidth={1.75}
                  aria-hidden
                />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className={cn("font-medium", tile.off ? "text-ink-soft" : "text-ink")}>
                    {tile.title}
                  </span>
                  {tile.off && (
                    <span className="text-[11px] text-ink-soft bg-cream-soft rounded-full px-2 py-0.5">
                      staat uit
                    </span>
                  )}
                </span>
                <span className="block text-xs text-ink-soft mt-0.5 leading-relaxed">
                  {tile.description}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
