import { Sun, CalendarDays, CalendarHeart, Compass, User } from "lucide-react"

/**
 * Primary destinations only — 5 items max for a calm, scannable tab bar.
 * Buddy, kennis, dagboek and libraries live under Ontdek (/voor-jou).
 */
export const NAV_ITEMS = [
  { href: "/vandaag", label: "Vandaag", icon: Sun },
  { href: "/deze-week", label: "Week", icon: CalendarDays },
  { href: "/cyclus", label: "Cyclus", icon: CalendarHeart },
  { href: "/voor-jou", label: "Ontdek", icon: Compass },
  { href: "/profiel", label: "Profiel", icon: User },
] as const
