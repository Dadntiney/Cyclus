import { Dumbbell, Activity, Footprints, Wind, Flame, Heart, Move, type LucideIcon } from "lucide-react"

export type ExerciseTone = "sage" | "peach"

export interface ExerciseVisual {
  icon: LucideIcon
  tone: ExerciseTone
}

// Curated per known muscle group so the icon actually matches the movement.
// Anything not listed here (future exercises) still gets a consistent,
// deterministic look via the fallback below instead of a generic icon.
const KNOWN_VISUALS: Record<string, ExerciseVisual> = {
  core: { icon: Move, tone: "sage" },
  "billen/hamstrings": { icon: Flame, tone: "peach" },
  "rug": { icon: Dumbbell, tone: "sage" },
  "borst/schouders": { icon: Dumbbell, tone: "peach" },
  schouders: { icon: Dumbbell, tone: "peach" },
  nek: { icon: Wind, tone: "sage" },
  heupen: { icon: Activity, tone: "peach" },
  "rug/heupen": { icon: Activity, tone: "sage" },
  cardio: { icon: Footprints, tone: "peach" },
  ademhaling: { icon: Wind, tone: "sage" },
}

const FALLBACK_ICONS = [Dumbbell, Activity, Footprints, Wind, Flame, Heart, Move]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function getExerciseVisual(muscleGroup: string | null, name: string): ExerciseVisual {
  const known = muscleGroup ? KNOWN_VISUALS[muscleGroup] : undefined
  if (known) return known

  const hash = hashString(muscleGroup ?? name)
  return {
    icon: FALLBACK_ICONS[hash % FALLBACK_ICONS.length],
    tone: hash % 2 === 0 ? "sage" : "peach",
  }
}
