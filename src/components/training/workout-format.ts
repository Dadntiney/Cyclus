/**
 * Display helpers for workouts and exercises. Presentation only: the data
 * (titles, muscle groups) stays exactly as stored.
 */

const DIFFICULTY_LABELS: Record<string, string> = {
  makkelijk: "Makkelijk",
  gemiddeld: "Gemiddeld",
  pittig: "Pittig",
}

/** "makkelijk" → "Makkelijk"; unknown values keep their own text. */
export function difficultyLabel(difficulty: string | null | undefined): string | null {
  if (!difficulty) return null
  return DIFFICULTY_LABELS[difficulty] ?? sentenceCase(difficulty)
}

/**
 * The workout title without a trailing duration ("Core Boost - 7 minuten"
 * → "Core Boost"): the duration is already shown in the meta line next to
 * it. Other dashes stay ("Krachttraining - Full Body").
 */
export function workoutDisplayTitle(title: string): string {
  const stripped = title.replace(/\s*[-–—·]\s*\d+\s*(?:min(?:uten|uut)?\.?)\s*$/i, "").trim()
  return stripped || title
}

/** "billen/hamstrings" → "Billen/hamstrings"; empty → null. */
export function muscleGroupLabel(muscleGroup: string | null | undefined): string | null {
  const value = muscleGroup?.trim()
  return value ? sentenceCase(value) : null
}

function sentenceCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** "7 min · 3 oefeningen" — the count is left out when unknown or zero. */
export function workoutMeta(duration: number | null | undefined, exerciseCount?: number): string {
  const parts: string[] = []
  if (duration) parts.push(`${duration} min`)
  if (exerciseCount) parts.push(exerciseCount === 1 ? "1 oefening" : `${exerciseCount} oefeningen`)
  return parts.join(" · ")
}
