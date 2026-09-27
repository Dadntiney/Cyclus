/**
 * Curated instructional-video matches for the exercise library. Keyed by a
 * lowercase, leading-word-boundary match against the exercise name (see
 * lookupExerciseVideo) so e.g. both "Squats" and any future "Squat jumps"
 * match the "squat" entry, without also matching an unrelated compound word
 * like "Zijplank" for "plank". Intentionally only covers moves we could
 * match to a clear, reputable, single-exercise tutorial — everything else
 * falls back to the existing text instructions (steps, why_it_helps,
 * common_mistakes) with no video, rather than guessing a link that might
 * not actually show the right movement.
 *
 * Every entry here is currently English-narrated (no verified, correct,
 * professional Dutch-language tutorial was found for these moves — see the
 * exercise/video audit). The player discloses this (see ExerciseVideoPlayer)
 * rather than hiding it; the visual demonstration is still accurate even
 * though the narration isn't Dutch. Replace an entry's language to "nl" as
 * soon as a verified Dutch alternative showing the *same* exercise and
 * correct technique is found — don't add a Dutch video just because one
 * exists; it must actually match.
 *
 * Videos are embedded via youtube-nocookie.com (privacy-enhanced mode, no
 * autoplay) behind a click-to-play thumbnail, so nothing plays — with sound
 * or otherwise — until the user chooses to.
 */

export interface ExerciseVideo {
  youtubeId: string
  title: string
  source: string
  /** Spoken/narration language — shown to the user so an English video is
   * never a surprise. Dutch-language replacements should always be
   * preferred over these once a verified one is found (see the module
   * docblock); until then, the visual demonstration is still correct even
   * though the narration isn't Dutch. */
  language: "nl" | "en"
}

export const EXERCISE_VIDEO_LIBRARY: [matchKey: string, video: ExerciseVideo][] = [
  [
    "squat",
    {
      youtubeId: "oNGpFKY9-lo",
      title: "How to Squat Properly",
      source: "YouTube",
      language: "en",
    },
  ],
  [
    "push-up",
    {
      youtubeId: "WDIpL0pjun0",
      title: "How to do a Push-Up | Proper Form & Technique | NASM",
      source: "NASM",
      language: "en",
    },
  ],
  [
    "plank",
    {
      youtubeId: "mwlp75MS6Rg",
      title: "How to do a Plank | Proper Form & Technique | NASM",
      source: "NASM",
      language: "en",
    },
  ],
  [
    "glute bridge",
    {
      youtubeId: "n6JiF2jp2Ns",
      title: "How to Do the Glute Bridge Properly (Beginner Guide)",
      source: "YouTube",
      language: "en",
    },
  ],
  [
    "row",
    {
      youtubeId: "WkNuYbWZ8g8",
      title: "Beginner Resistance Band Rows — How To",
      source: "YouTube",
      language: "en",
    },
  ],
  [
    "kat-koe",
    {
      youtubeId: "ZQqB_FKXNL8",
      title: "Mobility: Cat/Cow and Child's Pose",
      source: "YouTube",
      language: "en",
    },
  ],
  [
    "kindhouding",
    {
      youtubeId: "ZQqB_FKXNL8",
      title: "Mobility: Cat/Cow and Child's Pose",
      source: "YouTube",
      language: "en",
    },
  ],
]

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Matches on a leading word boundary only (not a trailing one), so "squat"
 * still matches the plural "Squats" — but critically, "plank" does *not*
 * match inside "Zijplank" (side plank), since Dutch compounds it into one
 * word with no boundary before "plank". A plain substring match would wrongly
 * hand every side-plank variant the demonstration video for a *front* plank,
 * a different exercise with different form cues.
 */
export function lookupExerciseVideo(exerciseName: string): ExerciseVideo | null {
  const normalized = exerciseName.toLowerCase()
  for (const [key, video] of EXERCISE_VIDEO_LIBRARY) {
    const pattern = new RegExp(`\\b${escapeRegExp(key)}`)
    if (pattern.test(normalized)) return video
  }
  return null
}
