import type { PhaseNutritionFocus } from "@/lib/cycle/phase-content"

/** Food names as quiet inline text ("Zalm · Eieren · Kip"): they are examples, not buttons. */
function FoodLine({ foods, className }: { foods: readonly string[]; className?: string }) {
  if (!foods.length) return null
  return <p className={className ?? "text-sm text-ink mt-1"}>{foods.join(" · ")}</p>
}

/**
 * Practical per-phase nutrition basics: nutrient themes + concrete foods
 * (magnesium products, protein sources, etc.). Hedged copy lives in
 * phase-content.ts — this component only renders it, flat on the page
 * (reading content, not a card).
 */
export function PhaseNutritionBasics({
  nutrition,
  compact = false,
}: {
  nutrition: PhaseNutritionFocus
  /** Focus + example foods only; the phase page shows the full basics. */
  compact?: boolean
}) {
  if (compact) {
    return (
      <div>
        <p className="text-base font-semibold text-ink">{nutrition.focusLabel}</p>
        <p className="text-sm text-ink-soft mt-1">{nutrition.focusText}</p>
        <FoodLine foods={nutrition.exampleFoods} className="text-sm text-ink mt-2" />
      </div>
    )
  }

  return (
    <div className="max-w-prose">
      <p className="text-base font-semibold text-ink">{nutrition.focusLabel}</p>
      <p className="text-base text-ink-soft mt-1">{nutrition.focusText}</p>

      <ul className="flex flex-col gap-4 mt-5">
        {nutrition.basics.map((basic) => (
          <li key={basic.label}>
            <p className="text-base font-semibold text-ink">{basic.label}</p>
            <p className="text-sm text-ink-soft mt-0.5">{basic.text}</p>
            <FoodLine foods={basic.foods} />
          </li>
        ))}
      </ul>

      <p className="text-xs text-ink-soft mt-5">
        Suggesties, geen voorschrift — kies wat bij jouw voorkeuren, energie en maag past.
      </p>
    </div>
  )
}
