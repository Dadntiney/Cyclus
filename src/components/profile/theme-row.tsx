"use client"

import { useState, useTransition } from "react"
import { SunMoon } from "lucide-react"
import { ListRow } from "@/components/ui/list-group"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { OptionList } from "@/components/ui/option-list"
import { FieldError } from "@/components/ui/input"
import { updateThemePreference, type ThemePreference } from "@/lib/actions/profile"
import { applyThemePreference } from "@/lib/theme/apply-theme"
import { runAction } from "@/lib/client/run-action"

const THEME_OPTIONS: { value: ThemePreference; label: string; description: string }[] = [
  { value: "auto", label: "Automatisch", description: "Zoals je telefoon is ingesteld." },
  { value: "light", label: "Dag", description: "Altijd licht." },
  { value: "dark", label: "Nacht", description: "Altijd donker, rustig voor je ogen in de avond." },
]

function labelFor(theme: ThemePreference) {
  return THEME_OPTIONS.find((o) => o.value === theme)?.label ?? "Automatisch"
}

/**
 * Weergave as one row in the Instellingen group: the current choice on the
 * right, a sheet with the three options on tap. A choice applies at once
 * (she sees it behind the sheet) and is saved in the background; if saving
 * fails the previous look comes back and the sheet says why.
 */
export function ThemeRow({ initial }: { initial: ThemePreference }) {
  const [theme, setTheme] = useState<ThemePreference>(initial)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSelect(value: ThemePreference) {
    if (value === theme || isPending) return
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
    <>
      <ListRow
        icon={SunMoon}
        title="Weergave"
        value={labelFor(theme)}
        onClick={() => {
          setError(null)
          setOpen(true)
        }}
      />
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Weergave">
        <OptionList
          aria-label="Weergave"
          framed={false}
          options={THEME_OPTIONS}
          value={theme}
          onChange={handleSelect}
        />
        <FieldError>{error}</FieldError>
      </BottomSheet>
    </>
  )
}
