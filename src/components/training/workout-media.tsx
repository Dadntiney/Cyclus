import { getWorkoutVisual, type WorkoutTone } from "@/lib/training/workout-visual"
import { ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

const TONE_CLASSES: Record<WorkoutTone, { bg: string; icon: string }> = {
  sage: {
    bg: "bg-[linear-gradient(135deg,var(--color-sage-soft)_0%,var(--color-cream)_100%)]",
    icon: "text-sage-dark",
  },
  peach: {
    bg: "bg-[linear-gradient(135deg,var(--color-peach-soft)_0%,var(--color-cream)_100%)]",
    icon: "text-peach",
  },
}

interface WorkoutMediaProps {
  type: string
  className?: string
  iconClassName?: string
}

/**
 * Stand-in for workout photography — same illustration system as
 * RecipeMedia (see its comment), keyed by `workouts.type` instead of title
 * so every workout of the same kind (yoga, hardlopen, ...) reads
 * consistently even before it has a real photo.
 *
 * The icon sits directly on the tinted thumbnail (no white disc), so small
 * square thumbs on Vandaag / week stay clean and photo-like.
 */
export function WorkoutMedia({ type, className, iconClassName }: WorkoutMediaProps) {
  const { icon: Icon, tone } = getWorkoutVisual(type)
  const tones = TONE_CLASSES[tone]

  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", tones.bg, className)}
      aria-hidden="true"
    >
      <div className={cn("absolute inset-0 opacity-[0.06]", tones.icon)}>
        <svg width="100%" height="100%">
          <pattern id={`workout-grain-${tone}`} width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#workout-grain-${tone})`} />
        </svg>
      </div>
      <Icon
        className={cn("relative", tones.icon, iconClassName ?? "h-7 w-7")}
        strokeWidth={ICON.lg.strokeWidth}
      />
    </div>
  )
}
