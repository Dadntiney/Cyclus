"use client"

import { useId, useMemo, useState } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { Disclosure } from "@/components/ui/disclosure"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionHeader } from "@/components/ui/section-header"
import { MindfulExerciseCard } from "@/components/mental-wellbeing/mindful-exercise-card"
import {
  FIRST_EXERCISES,
  TIME_LIMITS,
  filterExercises,
  type TimeLimit,
} from "@/components/mental-wellbeing/library-filter"
import { MENTAL_WELLBEING_CATEGORY_OPTIONS, type MentalWellbeingCategory } from "@/lib/constants"
import type { MindfulExercise } from "@/lib/data/mindful-exercises"

function ExerciseGrid({ exercises }: { exercises: MindfulExercise[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {exercises.map((exercise) => (
        <li key={exercise.id}>
          <MindfulExerciseCard exercise={exercise} />
        </li>
      ))}
    </ul>
  )
}

/**
 * The library (ontwerpvisie §7.6): one chip row (time, then her topics),
 * the first six exercises and the rest behind "Alle n oefeningen".
 * Time and topic combine (AND); several topics widen the choice (OR).
 */
export function ExerciseLibrary({
  exercises,
  preferredCategories,
}: {
  exercises: MindfulExercise[]
  preferredCategories: MentalWellbeingCategory[]
}) {
  const titleId = useId()
  const [maxMinutes, setMaxMinutes] = useState<TimeLimit | null>(null)
  const [topics, setTopics] = useState<MentalWellbeingCategory[]>([])

  const topicOptions = preferredCategories.length
    ? MENTAL_WELLBEING_CATEGORY_OPTIONS.filter((opt) => preferredCategories.includes(opt.value))
    : MENTAL_WELLBEING_CATEGORY_OPTIONS

  const filtered = useMemo(
    () => filterExercises(exercises, { maxMinutes, topics }),
    [exercises, maxMinutes, topics],
  )
  const first = filtered.slice(0, FIRST_EXERCISES)
  const rest = filtered.slice(FIRST_EXERCISES)
  const filtering = maxMinutes != null || topics.length > 0

  function toggleTopic(topic: MentalWellbeingCategory) {
    setTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]))
  }

  function clearFilters() {
    setMaxMinutes(null)
    setTopics([])
  }

  return (
    <section aria-labelledby={titleId}>
      <SectionHeader id={titleId} title="Meditaties & mindfulness" />

      <div role="group" aria-label="Filter op tijd en onderwerp" className="scroller-bleed mb-4 flex items-center gap-2">
        {TIME_LIMITS.map((limit) => (
          <Chip
            key={limit.value}
            className="shrink-0 whitespace-nowrap"
            selected={maxMinutes === limit.value}
            onClick={() => setMaxMinutes((current) => (current === limit.value ? null : limit.value))}
          >
            {limit.label}
          </Chip>
        ))}
        <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-line" />
        {topicOptions.map((opt) => (
          <Chip
            key={opt.value}
            className="shrink-0 whitespace-nowrap"
            selected={topics.includes(opt.value)}
            onClick={() => toggleTopic(opt.value)}
          >
            {opt.label}
          </Chip>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {filtering ? `${filtered.length} ${filtered.length === 1 ? "oefening" : "oefeningen"}` : ""}
      </p>

      {filtered.length ? (
        <div className="flex flex-col gap-3">
          <ExerciseGrid exercises={first} />
          {rest.length > 0 && (
            <Disclosure label={`Alle ${filtered.length} oefeningen`} openLabel="Minder tonen" contentClassName="pt-1">
              <ExerciseGrid exercises={rest} />
            </Disclosure>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          titleAs="h3"
          title="Geen oefening bij deze keuze"
          description="Probeer een ander onderwerp of wat meer tijd."
          action={
            <Button variant="tonal" size="sm" onClick={clearFilters}>
              Wis filters
            </Button>
          }
        />
      )}
    </section>
  )
}
