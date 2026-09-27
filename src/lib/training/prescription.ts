/**
 * How much of an exercise to do isn't always "sets of reps" — that
 * vocabulary belongs to strength-style training (krachttraining, pilates),
 * where a set is a genuinely discrete, rest-separated block. A wandeling's
 * warm-up minutes or a yoga pose held for a breath count aren't "1 set" or
 * "3 sets" in any sense a user would recognize; showing that label there
 * reads as a leftover from a different sport, not a description of what
 * they're about to do.
 *
 * Rather than hardcoding that per page, this is keyed by `workouts.type` —
 * the same field that already distinguishes every sport in the app — so a
 * future sport only needs one line here (or, if its "sets" genuinely work
 * like reps, no line at all: it falls back to the neutral "N×" form).
 */
const SETS_LABEL_BY_TYPE: Record<string, (count: number) => string> = {
  krachttraining: (count) => (count === 1 ? "1 set" : `${count} sets`),
  pilates: (count) => (count === 1 ? "1 set" : `${count} sets`),
}

function defaultSetsLabel(count: number): string | null {
  // A single block (the overwhelming majority of walk/run/ride/yoga/mobility
  // segments — one warm-up, one held pose, one cooldown) isn't worth naming
  // at all; only a genuinely repeated block ("5 intervals") is.
  if (count <= 1) return null
  return `${count}×`
}

export function formatExercisePrescription(
  workoutType: string,
  sets: number | null,
  reps: string | null,
): string {
  const setsLabel = sets ? (SETS_LABEL_BY_TYPE[workoutType]?.(sets) ?? defaultSetsLabel(sets)) : null

  if (!setsLabel) return reps ?? ""
  if (!reps) return setsLabel
  // "5× 2 minuten" reads as "5 times 2 minutes"; a strength "3 sets" reads
  // better set off with a separator before the rep range.
  return setsLabel.endsWith("×") ? `${setsLabel} ${reps}` : `${setsLabel} · ${reps}`
}
