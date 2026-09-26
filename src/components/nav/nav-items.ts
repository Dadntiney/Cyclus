import { Sun, CalendarDays, CalendarHeart, Dumbbell, Salad, MessageCircle } from "lucide-react"

export const NAV_ITEMS = [
  { href: "/vandaag", label: "Vandaag", icon: Sun },
  { href: "/deze-week", label: "Deze week", icon: CalendarDays },
  { href: "/cyclus", label: "Cyclus", icon: CalendarHeart },
  { href: "/training", label: "Beweging", icon: Dumbbell },
  { href: "/voeding", label: "Voeding", icon: Salad },
  { href: "/buddy", label: "Buddy", icon: MessageCircle },
] as const
