"use client"

import type { AnchorHTMLAttributes, MouseEvent } from "react"
import { jumpToId } from "@/lib/client/hash-scroll"

/**
 * In-page link ("Naar de kalender", "Check-in nog open") that scrolls to
 * `targetId` and focuses it without adding a history entry. Use it instead
 * of a bare `<a href="#…">` inside the app: native hash entries break "back"
 * in the app router (see `jumpToId`). Without JavaScript it still works as
 * a normal anchor.
 */
export function JumpLink({
  targetId,
  onClick,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { targetId: string }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (event.defaultPrevented) return
    // Keep modified clicks (new tab) native.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    if (jumpToId(targetId)) event.preventDefault()
  }

  return <a href={`#${targetId}`} onClick={handleClick} {...props} />
}
