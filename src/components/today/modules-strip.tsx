import Link from "next/link"
import { ChevronRight, Dumbbell, Salad, Brain, Moon, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"

/**
 * Compact launcher under Vandaag's plan — replaces the sixth nav tab without
 * becoming a second dashboard. Links into modules + the full hub.
 */
export function ModulesStrip({
  movementEnabled,
  nutritionEnabled,
  mentalEnabled,
  sleepEnabled,
}: {
  movementEnabled: boolean
  nutritionEnabled: boolean
  mentalEnabled: boolean
  sleepEnabled: boolean
}) {
  const items: { href: string; label: string; icon: LucideIcon }[] = []
  if (movementEnabled) items.push({ href: "/training", label: "Beweging", icon: Dumbbell })
  if (nutritionEnabled) items.push({ href: "/voeding", label: "Voeding", icon: Salad })
  if (mentalEnabled) items.push({ href: "/mentale-rust", label: "Mentale rust", icon: Brain })
  if (sleepEnabled) items.push({ href: "/slaap", label: "Slaap", icon: Moon })

  return (
    <section aria-label="Jouw modules">
      <div className="flex items-baseline justify-between gap-3 mb-2.5">
        <h2 className="font-display text-lg text-ink">Modules</h2>
        <Link
          href="/voor-jou"
          className="inline-flex items-center gap-0.5 min-h-11 text-xs font-medium text-sage-dark touch-manipulation"
        >
          Alles
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </Link>
      </div>
      {items.length > 0 ? (
        <ul className="flex gap-2 overflow-x-auto safe-x pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                className="inline-flex items-center gap-2 min-h-11 px-3.5 rounded-full border border-line bg-surface text-sm font-medium text-ink touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
              >
                <item.icon className="h-4 w-4 text-sage-dark" strokeWidth={1.75} aria-hidden />
                {item.label}
              </Link>
            </li>
          ))}
          <li className="shrink-0">
            <Link
              href="/voor-jou"
              className="inline-flex items-center gap-2 min-h-11 px-3.5 rounded-full border border-line/70 text-sm font-medium text-ink-soft touch-manipulation"
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Meer
            </Link>
          </li>
        </ul>
      ) : (
        <Link
          href="/voor-jou"
          className="inline-flex items-center gap-2 min-h-11 text-sm font-medium text-sage-dark touch-manipulation"
        >
          Modules aanzetten
          <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
        </Link>
      )}
    </section>
  )
}
