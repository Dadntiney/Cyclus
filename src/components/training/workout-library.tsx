"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronRight, SlidersHorizontal } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ChipRadioGroup } from "@/components/ui/chip-radio-group"
import { IconButton } from "@/components/ui/icon-button"
import { WorkoutImage } from "@/components/training/workout-image"
import { difficultyLabel, workoutDisplayTitle, workoutMeta } from "@/components/training/workout-format"
import { workoutTypeLabel } from "@/lib/constants"
import { iconProps } from "@/lib/ui/icon"
import type { Tables } from "@/types/database"

type Workout = Pick<Tables<"workouts">, "id" | "title" | "type" | "duration" | "difficulty" | "image_url">

const ALL = "alles"

/**
 * The Beweging library: one row of type chips (one choice; her preferences
 * at the end of the row) and the trainings as tappable cards — difficulty,
 * title, "7 min · Yoga".
 */
export function WorkoutLibrary({ workouts, preferencesHref }: { workouts: Workout[]; preferencesHref: string }) {
  const [activeType, setActiveType] = useState<string>(ALL)

  const typeOptions = useMemo(() => {
    const types = [...new Set(workouts.map((w) => w.type))].sort()
    return [{ value: ALL, label: "Alles" }, ...types.map((type) => ({ value: type, label: workoutTypeLabel(type) }))]
  }, [workouts])

  const filtered = activeType === ALL ? workouts : workouts.filter((w) => w.type === activeType)

  return (
    <div className="flex flex-col gap-4">
      <div className="scroller-bleed flex items-center gap-2">
        <ChipRadioGroup
          aria-label="Soort training"
          options={typeOptions}
          value={activeType}
          onChange={setActiveType}
          className="shrink-0 flex-nowrap"
          chipClassName="shrink-0 whitespace-nowrap"
        />
        <IconButton label="Voorkeuren voor beweging" icon={SlidersHorizontal} href={preferencesHref} />
      </div>

      <ul className="flex flex-col gap-3">
        {filtered.map((workout) => {
          const difficulty = difficultyLabel(workout.difficulty)
          return (
            <li key={workout.id}>
              <Link href={`/training/${workout.id}`} className="block rounded-card touch-manipulation">
                <Card padding="sm" interactive className="flex items-center gap-3.5">
                  <WorkoutImage
                    type={workout.type}
                    title={workout.title}
                    imageUrl={workout.image_url}
                    className="h-12 w-12 shrink-0 rounded-inset"
                    iconClassName="h-6 w-6"
                    sizes="48px"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    {difficulty && <span className="type-eyebrow text-sage-dark">{difficulty}</span>}
                    <span className="text-base font-medium text-ink line-clamp-2">
                      {workoutDisplayTitle(workout.title)}
                    </span>
                    <span className="text-sm text-ink-soft">
                      {[workoutMeta(workout.duration), workoutTypeLabel(workout.type)].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <ChevronRight {...iconProps("sm", "text-ink-soft")} aria-hidden />
                </Card>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
