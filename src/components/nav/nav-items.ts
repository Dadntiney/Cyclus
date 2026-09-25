import { Sun, CalendarHeart, Dumbbell, Salad, MessageCircle } from "lucide-react"

export const NAV_ITEMS = [
  { href: "/vandaag", label: "Vandaag", icon: Sun },
  { href: "/cyclus", label: "Cyclus", icon: CalendarHeart },
  { href: "/training", label: "Training", icon: Dumbbell },
  { href: "/voeding", label: "Voeding", icon: Salad },
  { href: "/buddy", label: "Buddy", icon: MessageCircle },
] as const
