import { classifyPhase, phaseLabel, type CyclePhase } from "@/lib/cycle/estimate"
import { cn } from "@/lib/utils"

const PHASE_FILL: Record<CyclePhase, string> = {
  menstruatie: "var(--color-phase-menstruatie)",
  folliculair: "var(--color-phase-folliculair)",
  ovulatie: "var(--color-phase-ovulatie)",
  luteaal: "var(--color-phase-luteaal)",
}

const DAY = 10
const GAP = 3
const BAR_Y = 9
const BAR_H = 10

/**
 * Ritmeband — the cycle as four soft phase segments with a marker on today.
 *
 * Uses the same `classifyPhase` boundaries as the estimate itself, so the
 * band never shows a firmer picture than the rest of the app. Pass
 * `cycleDay = null` to draw the band without a marker (soft / predicted
 * states where a day number would claim too much).
 *
 * `size="sm"` is the compact band inside the phase status (6px segments,
 * 14px marker, a fixed height whatever the width, no day captions — the
 * accessible name already says "cyclusdag 11 van ongeveer 26").
 */
export function RhythmBand({
  cycleLength,
  periodLength,
  cycleDay,
  phase,
  size = "md",
  className,
}: {
  cycleLength: number
  periodLength?: number | null
  cycleDay: number | null
  phase: CyclePhase
  size?: "md" | "sm"
  className?: string
}) {
  const length = Math.max(14, Math.min(60, Math.round(cycleLength)))
  const segments: { phase: CyclePhase; from: number; to: number }[] = []
  for (let d = 1; d <= length; d++) {
    const p = classifyPhase(d, length, periodLength)
    const last = segments[segments.length - 1]
    if (last && last.phase === p) last.to = d
    else segments.push({ phase: p, from: d, to: d })
  }

  const width = length * DAY
  const day = cycleDay == null ? null : Math.max(1, Math.min(length, cycleDay))
  const markerX = day == null ? null : (day - 0.5) * DAY
  const label =
    day == null
      ? `Je cyclus van ongeveer ${length} dagen`
      : `Cyclusdag ${day} van ongeveer ${length}, ${phaseLabel(phase).toLowerCase()}`

  if (size === "sm") {
    // Percentages of one shared width, so the marker always sits on its own
    // day's segment (a flex gap would shift the segments against it).
    const pct = (days: number) => `${(days / length) * 100}%`
    return (
      <div role="img" aria-label={label} className={cn("relative h-3.5 w-full", className)}>
        {segments.map((s, i) => (
          <span
            key={`${s.phase}-${s.from}`}
            aria-hidden
            className="absolute top-1/2 h-1.5 -translate-y-1/2 px-px"
            style={{ left: pct(s.from - 1), width: pct(s.to - s.from + 1) }}
          >
            <span
              className="rhythm-seg block h-full rounded-full"
              style={{
                backgroundColor: PHASE_FILL[s.phase],
                opacity: day != null && s.phase !== phase ? 0.55 : 1,
                animationDelay: `${i * 70}ms`,
              }}
            />
          </span>
        ))}
        {day != null && (
          <span
            aria-hidden
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: pct(day - 0.5) }}
          >
            <span className="rhythm-now flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-ink bg-surface">
              <span className="h-1 w-1 rounded-full bg-ink" />
            </span>
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} 28`}
        className="block w-full h-auto overflow-visible"
        role="img"
        aria-label={label}
      >
        {segments.map((s, i) => {
          const x = (s.from - 1) * DAY + GAP / 2
          const w = (s.to - s.from + 1) * DAY - GAP
          return (
            <rect
              key={`${s.phase}-${s.from}`}
              x={x}
              y={BAR_Y}
              width={Math.max(2, w)}
              height={BAR_H}
              rx={BAR_H / 2}
              fill={PHASE_FILL[s.phase]}
              opacity={day != null && s.phase !== phase ? 0.55 : 1}
              className="rhythm-seg"
              style={{ animationDelay: `${i * 70}ms` }}
            />
          )
        })}
        {markerX != null && (
          <g className="rhythm-now">
            <circle cx={markerX} cy={BAR_Y + BAR_H / 2} r={9} fill="var(--color-surface)" stroke="var(--color-ink)" strokeWidth={2} />
            <circle cx={markerX} cy={BAR_Y + BAR_H / 2} r={3.5} fill="var(--color-ink)" />
          </g>
        )}
      </svg>
      <div className="flex justify-between text-xs text-ink-soft mt-1.5 tabular-nums" aria-hidden>
        <span>dag 1</span>
        <span>± {length} dagen</span>
      </div>
    </div>
  )
}
