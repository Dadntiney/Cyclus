"use client"

import { useMemo, useState } from "react"
import { Sparkles } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { EmptyState } from "@/components/ui/empty-state"
import { MENTAL_WELLBEING_CATEGORY_OPTIONS, type MentalWellbeingCategory } from "@/lib/constants"
import { MindfulExerciseCard } from "./mindful-exercise-card"
import type { MindfulExercise } from "@/lib/data/mindful-exercises"

const KIND_FILTERS = [
  { value: "alle", label: "Alles" },
  { value: "meditatie", label: "Meditatie" },
  { value: "mindfulness", label: "Mindfulness" },
] as const

export function ExerciseLibrary({
  exercises,
  preferredCategories,
}: {
  exercises: MindfulExercise[]
  preferredCategories: MentalWellbeingCategory[]
}) {
  const [kindFilter, setKindFilter] = useState<(typeof KIND_FILTERS)[number]["value"]>("alle")
  const [categoryFilter, setCategoryFilter] = useState<MentalWellbeingCategory | null>(null)

  const categoryOptions = preferredCategories.length
    ? MENTAL_WELLBEING_CATEGORY_OPTIONS.filter((opt) => preferredCategories.includes(opt.value))
    : MENTAL_WELLBEING_CATEGORY_OPTIONS

  const filtered = useMemo(() => {
    let result = exercises
    if (kindFilter !== "alle") result = result.filter((e) => e.kind === kindFilter)
    if (categoryFilter) result = result.filter((e) => e.categories.includes(categoryFilter))
    return result
  }, [exercises, kindFilter, categoryFilter])

  return (
    <div>
      <div className="flex w-full gap-2 mb-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {KIND_FILTERS.map((opt) => (
          <Chip key={opt.value} className="shrink-0" selected={kindFilter === opt.value} onClick={() => setKindFilter(opt.value)}>
            {opt.label}
          </Chip>
        ))}
      </div>
      <div className="flex w-full gap-2 mb-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip className="shrink-0" selected={categoryFilter === null} onClick={() => setCategoryFilter(null)}>
          Alle onderwerpen
        </Chip>
        {categoryOptions.map((opt) => (
          <Chip
            key={opt.value}
            className="shrink-0"
            selected={categoryFilter === opt.value}
            onClick={() => setCategoryFilter(opt.value)}
          >
            <span className="mr-1" aria-hidden>
              {opt.emoji}
            </span>
            {opt.label}
          </Chip>
        ))}
      </div>

      {filtered.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exercise) => (
            <MindfulExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Sparkles className="h-6 w-6" />}
          title="Geen oefeningen bij deze filters."
          description="Probeer een ander onderwerp of kies 'Alles'."
        />
      )}
    </div>
  )
}
