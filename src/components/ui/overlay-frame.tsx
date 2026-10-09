"use client"

import { memo } from "react"
import type { ReactNode } from "react"

/**
 * Keeps an overlay's last "open" content on screen while it animates out:
 * when `frozen` is true the parent's new (closing) props are ignored, so a
 * title that the caller derives from its own state (e.g. `selectedDate ?
 * … : undefined`) doesn't vanish mid-animation.
 */
export const FrozenContent = memo(
  function FrozenContent({ children }: { children: ReactNode; frozen: boolean }) {
    return <>{children}</>
  },
  (_prev, next) => next.frozen,
)
