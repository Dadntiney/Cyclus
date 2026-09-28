"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function Expandable({
  label = "Meer weten",
  closeLabel = "Minder weergeven",
  children,
}: {
  label?: string
  closeLabel?: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-sage-dark rounded-lg py-1 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
        aria-expanded={open}
      >
        {open ? closeLabel : label}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} strokeWidth={2} />
      </button>
      {open && <div className="mt-3 animate-page-in">{children}</div>}
    </div>
  )
}
