"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type { MouseEvent, ReactNode } from "react"
import { GENERIC_BACK_LABEL, type BackTarget } from "@/lib/navigation/nav-stack"
import { cn } from "@/lib/utils"

function isPlainClick(e: MouseEvent<HTMLAnchorElement>) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
}

/**
 * The one "‹ Vorige" control (app bar on mobile, BackButton on md+).
 * - history: router.back() — exactly where she came from; the href is
 *   that same screen, for a middle-click or no JavaScript.
 * - link: no in-app history (deep link, notification): *replace* the
 *   current screen with the logical parent, so back never loops.
 */
export function BackLink({
  target,
  label,
  className,
  children,
}: {
  target: BackTarget
  /** Visible label (may be shortened); defaults to target.label. */
  label?: string
  className?: string
  /** Icon and label; defaults to just the label. */
  children?: ReactNode
}) {
  const router = useRouter()
  const shown = label ?? target.label
  const accessibleName = shown === GENERIC_BACK_LABEL ? GENERIC_BACK_LABEL : `Terug naar ${shown}`

  return (
    <Link
      href={target.href}
      replace={target.mode === "link"}
      prefetch={target.mode === "link" ? undefined : false}
      aria-label={accessibleName}
      onClick={(e) => {
        if (target.mode === "history" && isPlainClick(e)) {
          e.preventDefault()
          router.back()
        }
      }}
      className={cn("touch-manipulation", className)}
    >
      {children ?? shown}
    </Link>
  )
}
