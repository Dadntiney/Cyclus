/**
 * Curated instructional-video matches for the exercise library. Keyed by a
 * lowercase substring of the exercise name so e.g. both "Squats" and any
 * future "Squat jumps" match the "squat" entry. Intentionally only covers
 * moves we could match to a clear, reputable, single-exercise tutorial —
 * everything else falls back to the existing text instructions (steps,
 * why_it_helps, common_mistakes) with no video, rather than guessing a link
 * that might not actually show the right movement.
 *
 * Videos are embedded via youtube-nocookie.com (privacy-enhanced mode, no
 * autoplay) behind a click-to-play thumbnail, so nothing plays — with sound
 * or otherwise — until the user chooses to.
 */

export interface ExerciseVideo {
  youtubeId: string
  title: string
  source: string
}

export const EXERCISE_VIDEO_LIBRARY: [matchKey: string, video: ExerciseVideo][] = [
  [
    "squat",
    {
      youtubeId: "oNGpFKY9-lo",
      title: "How to Squat Properly",
      source: "YouTube",
    },
  ],
  [
    "push-up",
    {
      youtubeId: "WDIpL0pjun0",
      title: "How to do a Push-Up | Proper Form & Technique | NASM",
      source: "NASM",
    },
  ],
  [
    "plank",
    {
      youtubeId: "mwlp75MS6Rg",
      title: "How to do a Plank | Proper Form & Technique | NASM",
      source: "NASM",
    },
  ],
  [
    "glute bridge",
    {
      youtubeId: "n6JiF2jp2Ns",
      title: "How to Do the Glute Bridge Properly (Beginner Guide)",
      source: "YouTube",
    },
  ],
  [
    "row",
    {
      youtubeId: "WkNuYbWZ8g8",
      title: "Beginner Resistance Band Rows — How To",
      source: "YouTube",
    },
  ],
  [
    "kat-koe",
    {
      youtubeId: "ZQqB_FKXNL8",
      title: "Mobility: Cat/Cow and Child's Pose",
      source: "YouTube",
    },
  ],
  [
    "kindhouding",
    {
      youtubeId: "ZQqB_FKXNL8",
      title: "Mobility: Cat/Cow and Child's Pose",
      source: "YouTube",
    },
  ],
]

export function lookupExerciseVideo(exerciseName: string): ExerciseVideo | null {
  const normalized = exerciseName.toLowerCase()
  for (const [key, video] of EXERCISE_VIDEO_LIBRARY) {
    if (normalized.includes(key)) return video
  }
  return null
}
