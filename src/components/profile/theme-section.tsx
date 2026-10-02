"use client"

import { useState, useTransition } from "react"
import { Chip } from "@/components/ui/chip"
import { updateThemePreference, type ThemePreference } from "@/lib/actions/profile"
import { applyThemePreference } from "@/lib/theme/apply-theme"
import { runAction } from "@/lib/client/run-action"

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Dag" },
  { value: "dark", label: "Nacht" },
  { value: "auto", label: "Automatisch" },
]

/** Compact Weergave control for the profile hub — not a marketing card. */
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
      const result = await runAction(() => updateThemePreference(value))
      if (result?.error) {
        setTheme(previous)
        applyThemePreference(previous)
        setError(result.error)
      }
    })
  }

  return (
    <div className="rounded-[1.25rem] bg-surface border border-line px-4 py-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">Weergave</p>
          <p className="text-sm text-ink-soft mt-0.5">Dag, nacht of zoals je telefoon.</p>
        </div>
        <div className="flex flex-wrap gap-1.5 shrink-0">
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
      </div>
      {error && <p className="text-xs text-danger mt-2">{error}</p>}
    </div>
  )
}
