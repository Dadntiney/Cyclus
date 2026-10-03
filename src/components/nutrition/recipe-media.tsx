import { getRecipeVisual, type RecipeTone } from "@/lib/nutrition/recipe-visual"
import { ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

const TONE_CLASSES: Record<RecipeTone, { bg: string; ring: string; icon: string }> = {
  sage: {
    bg: "bg-[linear-gradient(135deg,var(--color-sage-soft)_0%,var(--color-cream)_100%)]",
    ring: "bg-surface/70",
    icon: "text-sage-dark",
  },
  peach: {
    bg: "bg-[linear-gradient(135deg,var(--color-peach-soft)_0%,var(--color-cream)_100%)]",
    ring: "bg-surface/70",
    icon: "text-peach",
  },
}

interface RecipeMediaProps {
  title: string
  className?: string
  iconClassName?: string
}

/**
 * Stand-in for recipe photography: one consistent illustration system
 * (same gradient angle, same icon treatment, tone alternates per dish)
 * so every recipe reads as part of a single, deliberate series rather
 * than a grab-bag of stock photos.
 */
export function RecipeMedia({ title, className, iconClassName }: RecipeMediaProps) {
  const { icon: Icon, tone } = getRecipeVisual(title)
  const tones = TONE_CLASSES[tone]

  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", tones.bg, className)}
      aria-hidden="true"
    >
      <div className={cn("absolute inset-0 opacity-6", tones.icon)}>
        <svg width="100%" height="100%">
          <pattern id={`grain-${tone}`} width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#grain-${tone})`} />
        </svg>
      </div>
      <div className={cn("relative flex items-center justify-center rounded-full", tones.ring, iconClassName ?? "h-14 w-14")}>
        <Icon
          className={cn(tones.icon, iconClassName ? "h-1/2 w-1/2" : ICON.lg.className)}
          strokeWidth={ICON.lg.strokeWidth}
        />
      </div>
    </div>
  )
}
