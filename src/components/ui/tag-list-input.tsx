"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TagListInputProps {
  value: string[]
  onChange: (next: string[]) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
}

/**
 * A free-text list the user builds up one item at a time (e.g. "dingen die
 * ik niet lust") — distinct from the fixed-option Chip pickers used
 * elsewhere, since there's no predefined list of ingredients to choose from.
 */
export function TagListInput({ value, onChange, onBlur, placeholder, className }: TagListInputProps) {
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
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full bg-sage-fill text-white pl-3.5 pr-2 py-1.5 text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== tag))}
                aria-label={`${tag} verwijderen`}
                className="rounded-full p-0.5 hover:bg-white/20 touch-manipulation"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
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
          className="flex-1 rounded-xl border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-sage/50"
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!draft.trim()}
          className="text-sm font-medium text-sage-dark disabled:opacity-40 disabled:cursor-not-allowed px-1 touch-manipulation"
        >
          Toevoegen
        </button>
      </div>
    </div>
  )
}
