import { Sun, Compass, CalendarHeart, MessageCircleHeart, User } from "lucide-react"

/**
 * Five primary tabs. Ontdek is the home for everything that used to be
 * reachable only via links on Vandaag or Profiel (weekplan, voeding,
 * beweging, mentale rust, slaap, kennis, dagboek) — the usertest showed she
 * couldn't find those back. Toggles stay under Profiel → Wat ik gebruik.
 *
 * Buddy uses MessageCircleHeart in nav-items as the semantic icon; the
 * bottom/side nav still render BuddyGlyph (same Lucide mark) for one source.
 */
export const NAV_ITEMS = [
  { href: "/vandaag", label: "Vandaag", icon: Sun, matches: [] },
  {
    href: "/ontdek",
    label: "Ontdek",
    icon: Compass,
    matches: [
      "/deze-week",
      "/voeding",
      "/training",
      "/mentale-rust",
      "/slaap",
      "/kennis",
      "/dagboek",
      "/favorieten",
      "/medicatie",
    ],
  },
  { href: "/cyclus", label: "Cyclus", icon: CalendarHeart, matches: [] },
  { href: "/buddy", label: "Buddy", icon: MessageCircleHeart, matches: [] },
  { href: "/profiel", label: "Profiel", icon: User, matches: [] },
] as const

function underPath(path: string, base: string) {
  return path === base || path.startsWith(`${base}/`)
}

export function isNavActive(path: string, item: (typeof NAV_ITEMS)[number]): boolean {
  return underPath(path, item.href) || item.matches.some((m: string) => underPath(path, m))
}
