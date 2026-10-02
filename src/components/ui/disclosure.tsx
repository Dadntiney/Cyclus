"use client"

import { useId, useState } from "react"
import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { iconProps } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

interface CollapseProps {
  open: boolean
  /** id for the trigger's aria-controls. */
  id?: string
  children: ReactNode
  className?: string
}

/**
 * Height + opacity transition for content that opens in place
 * (grid-template-rows 0fr → 1fr, 240ms standard). Content stays mounted;
 * while closed it is `inert` and hidden from screen readers. Under
 * prefers-reduced-motion it opens and closes instantly (besluit 25).
 *
 * Put padding on an element INSIDE Collapse (it cannot squeeze padding).
 */
export function Collapse({ open, id, children, className }: CollapseProps) {
  // Clip only while moving or closed, so focus outlines of the content are
  // not cut off once it is fully open.
  const [settled, setSettled] = useState(open)
  const [prevOpen, setPrevOpen] = useState(open)
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (!open) setSettled(false)
  }

  return (
    <div
      id={id}
      inert={!open}
      aria-hidden={open ? undefined : true}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && e.propertyName === "grid-template-rows" && open) setSettled(true)
      }}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-base ease-standard motion-reduce:transition-none",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        className,
      )}
    >
      <div
        className={cn(
          "min-h-0",
          open && settled ? "overflow-visible" : "overflow-hidden",
          open && "motion-reduce:overflow-visible",
        )}
      >
        {children}
      </div>
    </div>
  )
}

interface DisclosureProps {
  /** Trigger text while closed, e.g. "Meer weten". */
  label: ReactNode
  /** Trigger text while open (defaults to `label`; the chevron turns). */
  openLabel?: ReactNode
  defaultOpen?: boolean
  /** Controlled mode. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
  className?: string
  triggerClassName?: string
  contentClassName?: string
}

/**
 * The one "show more" pattern: a 15/500 sage-dark text trigger with a
 * turning 16px chevron (44px tall), content opening in place below it.
 * The trigger stays where it is; only the content moves.
 */
export function Disclosure({
  label,
  openLabel,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  children,
  className,
  triggerClassName,
  contentClassName,
}: DisclosureProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const open = openProp ?? uncontrolledOpen
  const contentId = useId()

  function toggle() {
    const next = !open
    if (openProp === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={contentId}
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 rounded-inset text-sm font-medium text-sage-dark touch-manipulation select-none",
          triggerClassName,
        )}
      >
        {open && openLabel ? openLabel : label}
        <ChevronDown
          {...iconProps(
            "sm",
            cn("transition-transform duration-base ease-standard motion-reduce:transition-none", open && "rotate-180"),
          )}
          aria-hidden
        />
      </button>
      <Collapse open={open} id={contentId}>
        <div className={cn("pt-3", contentClassName)}>{children}</div>
      </Collapse>
    </div>
  )
}
