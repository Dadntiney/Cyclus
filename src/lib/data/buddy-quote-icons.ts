import { Heart, Smile, Sun, Zap, Sparkles, Moon, Lightbulb, BookOpen, Info } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { BuddyQuoteCategory } from "@/lib/data/buddy-quotes"

/**
 * One consistent icon per quote category, instead of a unique hand-picked
 * emoji per quote (90+ of them, no two alike). A quote card should read as
 * "part of the same app" every time it appears, not roll a different
 * illustration each day — the category is what's stable, so that's what
 * picks the icon.
 */
export const BUDDY_QUOTE_CATEGORY_ICON: Record<BuddyQuoteCategory, LucideIcon> = {
  positief: Sparkles,
  motivatie: Zap,
  weetje: Info,
  herkenbaar: Smile,
  tip: Lightbulb,
  bemoedigend: Heart,
  luchtig: Sun,
  uitleg: BookOpen,
  reflectie: Moon,
}
