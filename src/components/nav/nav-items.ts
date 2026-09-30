import { Sun, CalendarDays, CalendarHeart, MessageCircleHeart, User } from "lucide-react"

/**
 * Five primary tabs. Libraries open from Vandaag / Deze week; toggles under
 * Profiel → Wat ik gebruik. No separate modules home.
 *
 * Buddy uses MessageCircleHeart in nav-items as the semantic icon; the
 * bottom/side nav still render BuddyGlyph (same Lucide mark) for one source.
 */
export const NAV_ITEMS = [
  { href: "/vandaag", label: "Vandaag", icon: Sun },
  { href: "/deze-week", label: "Week", icon: CalendarDays },
  { href: "/cyclus", label: "Cyclus", icon: CalendarHeart },
  { href: "/buddy", label: "Buddy", icon: MessageCircleHeart },
  { href: "/profiel", label: "Profiel", icon: User },
] as const
