import { Sun, CalendarDays, CalendarHeart, MessageCircle, User } from "lucide-react"

/**
 * Five primary tabs. Libraries open from Vandaag / Deze week; toggles under
 * Profiel → Wat ik gebruik. No separate modules home.
 */
export const NAV_ITEMS = [
  { href: "/vandaag", label: "Vandaag", icon: Sun },
  { href: "/deze-week", label: "Week", icon: CalendarDays },
  { href: "/cyclus", label: "Cyclus", icon: CalendarHeart },
  { href: "/buddy", label: "Buddy", icon: MessageCircle },
  { href: "/profiel", label: "Profiel", icon: User },
] as const
