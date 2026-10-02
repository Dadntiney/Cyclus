"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { EmptyState } from "@/components/ui/empty-state"
import { MENTAL_WELLBEING_CATEGORY_OPTIONS, type MentalWellbeingCategory } from "@/lib/constants"
import { MindfulExerciseCard } from "./mindful-exercise-card"
import type { MindfulExercise } from "@/lib/data/mindful-exercises"

const TIME_FILTERS = [
  { value: "alle", label: "Alles", min: 0, max: Infinity },
  { value: "kort", label: "1–3 min", min: 0, max: 3 },
  { value: "middel", label: "5 min", min: 4, max: 7 },
  { value: "lang", label: "10+ min", min: 8, max: Infinity },
] as const

/** One suggestion "voor nu": evening leans to avondrust, otherwise her own topics, shortest first. */
function pickForNow(
  exercises: MindfulExercise[],
  preferred: MentalWellbeingCategory[],
  hour: number,
): MindfulExercise | null {
  const evening = hour >= 20 || hour < 5
  const wanted: MentalWellbeingCategory[] = evening ? ["slaap", ...preferred] : preferred
  const pool = exercises.filter((e) => e.categories.some((c) => wanted.includes(c)))
  const sorted = [...(pool.length ? pool : exercises)].sort(
    (a, b) => a.durationMinutes - b.durationMinutes,
  )
  return sorted[0] ?? null
}

export function ExerciseLibrary({
  exercises,
  preferredCategories,
}: {
  exercises: MindfulExercise[]
  preferredCategories: MentalWellbeingCategory[]
}) {
  const [timeFilter, setTimeFilter] = useState<(typeof TIME_FILTERS)[number]["value"]>("alle")
  const [hour, setHour] = useState<number | null>(null)
  useEffect(() => {
    // Client clock only — keeps the server render stable.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHour(new Date().getHours())
  }, [])
  const forNow = useMemo(
    () => (hour == null ? null : pickForNow(exercises, preferredCategories, hour)),
    [exercises, preferredCategories, hour],
  )
  const [categoryFilter, setCategoryFilter] = useState<MentalWellbeingCategory | null>(null)

  const categoryOptions = preferredCategories.length
    ? MENTAL_WELLBEING_CATEGORY_OPTIONS.filter((opt) => preferredCategories.includes(opt.value))
    : MENTAL_WELLBEING_CATEGORY_OPTIONS

  const filtered = useMemo(() => {
    let result = exercises
    const time = TIME_FILTERS.find((t) => t.value === timeFilter)
    if (time && time.value !== "alle") {
      result = result.filter((e) => e.durationMinutes >= time.min && e.durationMinutes <= time.max)
    }
    if (categoryFilter) result = result.filter((e) => e.categories.includes(categoryFilter))
    return result
  }, [exercises, timeFilter, categoryFilter])

  return (
    <div>
      {forNow && (
        <Link
          href={`/mentale-rust/${forNow.id}`}
          className="mb-5 flex items-center gap-4 rounded-[1.25rem] bg-sage-soft px-4 py-4 touch-manipulation motion-safe:active:scale-[0.99] transition-transform"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium text-sage-dark">Voor nu</span>
            <span className="block font-display text-lg text-ink mt-0.5">{forNow.title}</span>
            <span className="block text-xs text-ink-soft mt-0.5">{forNow.durationMinutes} min</span>
          </span>
          <span className="shrink-0 rounded-full bg-sage-fill text-white text-sm font-semibold px-4 py-2">
            Start
          </span>
        </Link>
      )}
      <p className="text-sm font-medium text-ink mb-2">Hoeveel tijd heb je?</p>
      <div className="flex w-full gap-2 mb-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TIME_FILTERS.map((opt) => (
          <Chip key={opt.value} className="shrink-0" selected={timeFilter === opt.value} onClick={() => setTimeFilter(opt.value)}>
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
            <opt.icon className="h-4 w-4 mr-1 inline" strokeWidth={1.75} aria-hidden />
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
