"use client"

import { useState } from "react"
import { Lightbulb, Check, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Tables } from "@/types/database"

interface QuizOption {
  label: string
  correct: boolean
}

function parseQuizOptions(value: Tables<"daily_tips">["quiz_options"]): QuizOption[] {
  if (!Array.isArray(value)) return []
  return (value as unknown[]).filter(
    (o): o is QuizOption =>
      typeof o === "object" &&
      o !== null &&
      typeof (o as Record<string, unknown>).label === "string" &&
      typeof (o as Record<string, unknown>).correct === "boolean",
  )
}

export function DailyTipCard({ tip }: { tip: Tables<"daily_tips"> }) {
  const [selected, setSelected] = useState<number | null>(null)
  const options = parseQuizOptions(tip.quiz_options)

  return (
    <Card>
      <div className="flex items-center gap-1.5 mb-1">
        <Lightbulb className="h-4 w-4 text-sage-dark" strokeWidth={1.75} />
        <p className="text-sm font-medium text-sage-dark">Wist je dat?</p>
      </div>
      <h3 className="font-display text-lg text-ink mb-2">{tip.title}</h3>
      <p className="text-sm text-ink-soft mb-3 leading-relaxed">{tip.short_explanation}</p>
      <p className="text-sm text-ink-soft mb-1">
        <span className="font-medium text-ink">Praktisch: </span>
        {tip.practical_example}
      </p>
      {tip.fun_fact && (
        <p className="text-sm text-ink-soft mt-3 bg-cream-soft rounded-2xl p-3">{tip.fun_fact}</p>
      )}

      {tip.quiz_question && options.length > 0 && (
        <div className="mt-5 pt-5 border-t border-line">
          <p className="text-sm font-medium text-ink mb-3">{tip.quiz_question}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {options.map((opt, i) => {
              const isSelected = selected === i
              const showResult = selected !== null
              return (
                <button
                  key={i}
                  type="button"
                  disabled={selected !== null}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 min-h-10 text-sm font-medium transition-colors touch-manipulation",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-default",
                    showResult && opt.correct && "bg-sage-dark text-white border-sage-dark",
                    showResult && isSelected && !opt.correct && "bg-danger/10 text-danger border-danger/40",
                    !showResult && "bg-white text-ink border-line hover:border-sage/60",
                    showResult && !isSelected && !opt.correct && "bg-white text-ink-soft border-line opacity-60",
                  )}
                >
                  {showResult && opt.correct && <Check className="h-3.5 w-3.5" />}
                  {showResult && isSelected && !opt.correct && <X className="h-3.5 w-3.5" />}
                  {opt.label}
                </button>
              )
            })}
          </div>
          {selected !== null && tip.quiz_answer_explanation && (
            <p className="animate-pop-in text-sm text-ink-soft bg-sage-soft rounded-2xl p-3">
              {tip.quiz_answer_explanation}
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
