"use client"

import { useState, useTransition } from "react"
import { Chip } from "@/components/ui/chip"
import { updateThemePreference, type ThemePreference } from "@/lib/actions/profile"
import { applyThemePreference } from "@/lib/theme/apply-theme"

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Dag" },
  { value: "dark", label: "Nacht" },
  { value: "auto", label: "Automatisch" },
]

export function ThemeSection({ initial }: { initial: ThemePreference }) {
  const [theme, setTheme] = useState<ThemePreference>(initial)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSelect(value: ThemePreference) {
    if (value === theme) return
    setError(null)
    const previous = theme
    setTheme(value)
    applyThemePreference(value)
    startTransition(async () => {
      const result = await updateThemePreference(value)
      if (result?.error) {
        setTheme(previous)
        applyThemePreference(previous)
        setError(result.error)
      }
    })
  }

  return (
    <div className="rounded-2xl border border-line/70 p-4">
      <h2 className="font-display text-lg text-ink mb-1">Weergave</h2>
      <p className="text-xs text-ink-soft mb-3">
        Kies hoe Cyclus eruitziet. Automatisch volgt de instelling van je apparaat.
      </p>
      <div className="flex flex-wrap gap-2">
        {THEME_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            selected={theme === opt.value}
            disabled={isPending}
            onClick={() => handleSelect(opt.value)}
          >
            {opt.label}
          </Chip>
        ))}
      </div>
      {error && <p className="text-xs text-danger mt-2">{error}</p>}
    </div>
  )
}
