import type { CycleRecap } from "@/lib/cycle/cycle-recap"

/**
 * Short look back on her last completed cycle — only what she logged. A
 * block inside the one "Jouw patronen" card on Cyclus.
 */
export function CycleRecapBlock({ recap }: { recap: CycleRecap }) {
  return (
    <div>
      <h3 className="type-card-title text-ink">Terugblik op je vorige cyclus</h3>
      <p className="text-xs text-ink-soft mt-1">{recap.rangeLabel}</p>
      <ul className="flex flex-col gap-1.5 mt-3">
        {recap.lines.map((line) => (
          <li key={line} className="text-sm text-ink">
            {line}
          </li>
        ))}
      </ul>
    </div>
  )
}
