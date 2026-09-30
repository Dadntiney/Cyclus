import type { PhaseNutritionFocus } from "@/lib/cycle/phase-content"
import { Card } from "@/components/ui/card"

/**
 * Practical per-phase nutrition basics: nutrient themes + concrete foods
 * (magnesium products, protein sources, etc.). Hedged copy lives in
 * phase-content.ts — this component only renders it.
 */
export function PhaseNutritionBasics({
  nutrition,
  compact = false,
}: {
  nutrition: PhaseNutritionFocus
  /** Week strip: focus + example foods only; Cyclusdag: full basics. */
  compact?: boolean
}) {
  if (compact) {
    return (
      <Card className="p-4">
        <p className="text-sm font-medium text-ink mb-1">{nutrition.focusLabel}</p>
        <p className="text-sm text-ink-soft leading-relaxed mb-3">{nutrition.focusText}</p>
        <div className="flex flex-wrap gap-1.5">
          {nutrition.exampleFoods.map((food) => (
            <span
              key={food}
              className="text-[11px] font-medium text-sage-dark bg-sage-soft rounded-full px-2.5 py-1"
            >
              {food}
            </span>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <p className="text-sm font-medium text-ink mb-1">{nutrition.focusLabel}</p>
      <p className="text-sm text-ink-soft leading-relaxed mb-4">{nutrition.focusText}</p>

      <div className="flex flex-col gap-3.5">
        {nutrition.basics.map((basic) => (
          <div key={basic.label}>
            <p className="text-sm font-medium text-ink">{basic.label}</p>
            <p className="text-xs text-ink-soft leading-relaxed mt-0.5 mb-1.5">{basic.text}</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {basic.foods.map((food) => (
                <span
                  key={food}
                  className="text-[11px] font-medium text-sage-dark bg-sage-soft rounded-full px-2.5 py-1"
                >
                  {food}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-ink-soft mt-4 leading-relaxed">
        Suggesties, geen voorschrift — kies wat bij jouw voorkeuren, energie en maag past.
      </p>
    </Card>
  )
}
