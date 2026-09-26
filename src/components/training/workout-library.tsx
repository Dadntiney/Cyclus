"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Dumbbell } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import type { Tables } from "@/types/database"

type Workout = Pick<Tables<"workouts">, "id" | "title" | "type" | "duration" | "difficulty">

const DIFFICULTY_LABELS: Record<string, string> = {
  makkelijk: "Makkelijk",
  gemiddeld: "Gemiddeld",
  pittig: "Pittig",
}

function typeLabel(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export function WorkoutLibrary({ workouts }: { workouts: Workout[] }) {
  const [activeType, setActiveType] = useState<string | null>(null)

  const types = useMemo(() => [...new Set(workouts.map((w) => w.type))].sort(), [workouts])
  const filtered = activeType ? workouts.filter((w) => w.type === activeType) : workouts

  return (
    <div>
      <div className="flex w-full gap-2 mb-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip className="shrink-0" selected={activeType === null} onClick={() => setActiveType(null)}>
          Alles
        </Chip>
        {types.map((type) => (
          <Chip
            key={type}
            className="shrink-0"
            selected={activeType === type}
            onClick={() => setActiveType(type)}
          >
            {typeLabel(type)}
          </Chip>
        ))}
      </div>
      {filtered.length === 0 && (
        <EmptyState
          icon={<Dumbbell className="h-6 w-6" strokeWidth={1.5} />}
          title="Geen trainingen gevonden"
          description="Probeer een andere categorie te kiezen."
        />
      )}
      <div className="flex flex-col gap-2">
        {filtered.map((workout) => (
          <Link
            key={workout.id}
            href={`/training/${workout.id}`}
            className="block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            <Card interactive className="p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-ink-soft">
                    {DIFFICULTY_LABELS[workout.difficulty] ?? workout.difficulty}
                  </p>
                  <p className="font-medium text-ink text-sm mt-0.5">{workout.title}</p>
                </div>
                <span className="text-xs text-ink-soft shrink-0">{workout.duration} min</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
