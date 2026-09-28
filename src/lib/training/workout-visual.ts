import {
  Dumbbell,
  Footprints,
  Waves,
  PersonStanding,
  Bike,
  Zap,
  Flower2,
  type LucideIcon,
} from "lucide-react"

export type WorkoutTone = "sage" | "peach"

export interface WorkoutVisual {
  icon: LucideIcon
  tone: WorkoutTone
}

// One icon + tone per `workouts.type`, so the illustrated placeholder is
// consistent for every workout of the same kind (see recipe-visual.ts for
// the same idea applied to recipes).
const VISUAL_BY_TYPE: Record<string, WorkoutVisual> = {
  krachttraining: { icon: Dumbbell, tone: "peach" },
  wandelen: { icon: Footprints, tone: "sage" },
  hardlopen: { icon: Zap, tone: "peach" },
  fietsen: { icon: Bike, tone: "sage" },
  yoga: { icon: Flower2, tone: "sage" },
  pilates: { icon: PersonStanding, tone: "peach" },
  mobiliteit: { icon: Waves, tone: "sage" },
}

const FALLBACK: WorkoutVisual = { icon: Dumbbell, tone: "sage" }

export function getWorkoutVisual(type: string): WorkoutVisual {
  return VISUAL_BY_TYPE[type] ?? FALLBACK
}
