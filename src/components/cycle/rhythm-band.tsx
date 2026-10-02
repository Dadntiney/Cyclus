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
 */
export function RhythmBand({
  cycleLength,
  periodLength,
  cycleDay,
  phase,
  className,
}: {
  cycleLength: number
  periodLength?: number | null
  cycleDay: number | null
  phase: CyclePhase
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
