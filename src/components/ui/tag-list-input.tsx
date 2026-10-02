"use client"

import { useState } from "react"
import { Chip } from "@/components/ui/chip"
import { Input } from "@/components/ui/input"
import { textActionClass } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TagListInputProps {
  value: string[]
  onChange: (next: string[]) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  /** id of the text field, so a <Label htmlFor> can point at it. */
  inputId?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-describedby"?: string
}

/**
 * A free-text list the user builds up one item at a time (e.g. "dingen die
 * ik niet lust") — distinct from the fixed-option Chip pickers used
 * elsewhere, since there's no predefined list of ingredients to choose from.
 * Each added item is a removable chip ("Spruitjes ×").
 */
export function TagListInput({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  inputId,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
}: TagListInputProps) {
  const [draft, setDraft] = useState("")

  function addTag() {
    const trimmed = draft.trim()
    if (!trimmed) return
    if (!value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...value, trimmed])
    }
    setDraft("")
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {value.length > 0 && (
        <ul role="list" className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <li key={tag}>
              <Chip removable onClick={() => onChange(value.filter((v) => v !== tag))}>
                {tag}
              </Chip>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-2">
        <Input
          id={inputId}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            addTag()
            onBlur?.()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addTag()
            }
          }}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          className="flex-1"
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!draft.trim()}
          className={textActionClass("shrink-0 px-2 disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed")}
        >
          Toevoegen
        </button>
      </div>
    </div>
  )
}
