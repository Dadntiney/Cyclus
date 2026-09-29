import { Sun, CalendarDays, CalendarHeart, MessageCircle, User } from "lucide-react"

/**
 * Five primary tabs. Module browsing lives at /voor-jou (from Profiel), not
 * as a sixth tab or a launcher strip on Vandaag — Vandaag stays one day job.
 */
export const NAV_ITEMS = [
  { href: "/vandaag", label: "Vandaag", icon: Sun },
  { href: "/deze-week", label: "Week", icon: CalendarDays },
  { href: "/cyclus", label: "Cyclus", icon: CalendarHeart },
  { href: "/buddy", label: "Buddy", icon: MessageCircle },
  { href: "/profiel", label: "Profiel", icon: User },
] as const
