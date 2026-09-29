import { Sun, CalendarDays, CalendarHeart, MessageCircle, User } from "lucide-react"

/**
 * Five primary tabs — "Voor jou" stays as a module hub at /voor-jou but is
 * no longer a peer of Vandaag (that duplication made the bar crowded and the
 * product feel like it had two homes).
 */
export const NAV_ITEMS = [
  { href: "/vandaag", label: "Vandaag", icon: Sun },
  { href: "/deze-week", label: "Week", icon: CalendarDays },
  { href: "/cyclus", label: "Cyclus", icon: CalendarHeart },
  { href: "/buddy", label: "Buddy", icon: MessageCircle },
  { href: "/profiel", label: "Profiel", icon: User },
] as const
