import { History } from "lucide-react"
import type { CycleRecap } from "@/lib/cycle/cycle-recap"
import { Card } from "@/components/ui/card"

/** Short look back on her last completed cycle — only what she logged. */
export function CycleRecapCard({ recap }: { recap: CycleRecap }) {
  return (
    <Card>
      <div className="flex gap-2.5">
        <History className="h-4 w-4 text-sage-dark shrink-0 mt-1" strokeWidth={1.75} aria-hidden />
        <div className="min-w-0">
          <p className="font-display text-lg text-ink">Terugblik op je vorige cyclus</p>
          <p className="text-xs text-ink-soft mt-0.5 mb-2">{recap.rangeLabel}</p>
          <ul className="flex flex-col gap-1.5">
            {recap.lines.map((line) => (
              <li key={line} className="text-sm text-ink leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
