import { cn } from "@/lib/utils"

interface RatingScaleProps {
  label: string
  value: number | null
  onChange: (value: number) => void
  lowLabel?: string
  highLabel?: string
}

export function RatingScale({
  label,
  value,
  onChange,
  lowLabel,
  highLabel,
}: RatingScaleProps) {
  return (
    <div>
      <p className="text-sm font-medium text-ink mb-2">{label}</p>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${label}: ${n} van 5`}
            aria-pressed={value === n}
            className={cn(
              "h-11 w-11 rounded-full border text-sm font-semibold flex items-center justify-center touch-manipulation transition-[background-color,border-color,transform] duration-150 motion-safe:active:scale-[0.92]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
              value === n
                ? "bg-sage-dark text-white border-sage-dark"
                : "bg-white text-ink-soft border-line hover:border-sage/60 active:border-sage/60",
            )}
          >
            {n}
          </button>
        ))}
      </div>
      {(lowLabel || highLabel) && (
        <div className="flex justify-between text-xs text-ink-soft mt-1.5 px-1">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      )}
    </div>
  )
}
