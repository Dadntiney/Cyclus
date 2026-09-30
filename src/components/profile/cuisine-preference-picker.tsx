"use client"

import { useMemo, useState } from "react"
import { Chip } from "@/components/ui/chip"
import { Input } from "@/components/ui/input"
import { WORLD_CUISINE_OPTIONS, type WorldCuisine } from "@/lib/nutrition/cuisine"

export function CuisinePreferencePicker({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (cuisine: WorldCuisine) => void
}) {
  const [query, setQuery] = useState("")
  const normalized = query.trim().toLowerCase()

  const selectedCuisines = useMemo(
    () => WORLD_CUISINE_OPTIONS.filter((c) => selected.includes(c)),
    [selected],
  )

  const visible = useMemo(() => {
    if (!normalized) return WORLD_CUISINE_OPTIONS
    return WORLD_CUISINE_OPTIONS.filter((c) => c.toLowerCase().includes(normalized))
  }, [normalized])

  return (
    <div className="flex flex-col gap-2.5">
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Zoek op land of keuken…"
        aria-label="Zoek wereldkeuken"
        className="min-h-11"
      />
      {selectedCuisines.length > 0 && normalized && (
        <div className="flex flex-wrap gap-2">
          {selectedCuisines.map((opt) => (
            <Chip key={`selected-${opt}`} selected onClick={() => onToggle(opt)}>
              {opt}
            </Chip>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {visible.map((opt) => (
          <Chip key={opt} selected={selected.includes(opt)} onClick={() => onToggle(opt)}>
            {opt}
          </Chip>
        ))}
        {!visible.length && (
          <p className="text-xs text-ink-soft py-1">Geen keuken gevonden voor “{query.trim()}”.</p>
        )}
      </div>
    </div>
  )
}
