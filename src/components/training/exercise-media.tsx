import { getExerciseVisual, type ExerciseTone } from "@/lib/training/exercise-visual"
import { cn } from "@/lib/utils"

const TONE_CLASSES: Record<ExerciseTone, { bg: string; ring: string; icon: string }> = {
  sage: {
    bg: "bg-[linear-gradient(135deg,var(--color-sage-soft)_0%,var(--color-cream)_100%)]",
    ring: "bg-white/70",
    icon: "text-sage-dark",
  },
  peach: {
    bg: "bg-[linear-gradient(135deg,var(--color-peach-soft)_0%,var(--color-cream)_100%)]",
    ring: "bg-white/70",
    icon: "text-peach",
  },
}

interface ExerciseMediaProps {
  name: string
  muscleGroup: string | null
  className?: string
  iconClassName?: string
}

/**
 * Stand-in for a demo video/photo: one consistent illustration system so
 * every exercise reads as finished even before real media is added for it.
 */
export function ExerciseMedia({ name, muscleGroup, className, iconClassName }: ExerciseMediaProps) {
  const { icon: Icon, tone } = getExerciseVisual(muscleGroup, name)
  const tones = TONE_CLASSES[tone]

  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", tones.bg, className)}
      aria-hidden="true"
    >
      <div className={cn("absolute inset-0 opacity-[0.06]", tones.icon)}>
        <svg width="100%" height="100%">
          <pattern id={`grain-ex-${tone}`} width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#grain-ex-${tone})`} />
        </svg>
      </div>
      <div className={cn("relative flex items-center justify-center rounded-full shadow-sm", tones.ring, iconClassName ?? "h-14 w-14")}>
        <Icon className={cn(tones.icon, iconClassName ? "h-1/2 w-1/2" : "h-6 w-6")} strokeWidth={1.5} />
      </div>
    </div>
  )
}
