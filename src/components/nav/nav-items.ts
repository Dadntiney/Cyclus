import { Sun, CalendarDays, CalendarHeart, Sparkles, MessageCircle, User } from "lucide-react"

export const NAV_ITEMS = [
  { href: "/vandaag", label: "Vandaag", icon: Sun },
  { href: "/deze-week", label: "Deze week", icon: CalendarDays },
  { href: "/cyclus", label: "Cyclus", icon: CalendarHeart },
  { href: "/voor-jou", label: "Voor jou", icon: Sparkles },
  { href: "/buddy", label: "Buddy", icon: MessageCircle },
  { href: "/profiel", label: "Profiel", icon: User },
] as const
