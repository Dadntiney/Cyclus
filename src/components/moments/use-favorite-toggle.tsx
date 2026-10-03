"use client"

import { useState, useTransition } from "react"
import { usePathname } from "next/navigation"
import { Heart } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { runAction } from "@/lib/client/run-action"
import { triggerHaptic } from "@/lib/platform"
import { ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"

type ToggleResult = { favorited?: boolean; error?: string } | null | undefined

interface FavoriteToggleOptions {
  initialFavorited: boolean
  /** The existing server action, called exactly as before. */
  toggle: () => Promise<ToggleResult>
  /** Where "Bekijk" in the toast leads, e.g. "/favorieten?soort=momenten". */
  viewHref: string
  onFavoritedChange?: (favorited: boolean) => void
}

/**
 * The one "bewaren" gesture (ontwerpvisie §6.2, besluit 31): the heart
 * flips at once (optimistic), a light haptic, and one app-wide toast:
 * "Bewaard in Favorieten · Bekijk" or "Verwijderd uit Favorieten ·
 * Ongedaan maken". If the server says no, the heart flips back and the
 * toast says why.
 */
export function useFavoriteToggle({ initialFavorited, toggle, viewHref, onFavoritedChange }: FavoriteToggleOptions) {
  const [favorited, setFavorited] = useState(initialFavorited)
  // Bumped on every tap so the heart re-mounts and plays its fill animation
  // (and only then: hearts do not animate on page load).
  const [changes, setChanges] = useState(0)
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()

  function apply(next: boolean) {
    setFavorited(next)
    onFavoritedChange?.(next)
  }

  function run(next: boolean) {
    apply(next)
    setChanges((n) => n + 1)
    void triggerHaptic("light")
    toast.show(
      next
        ? {
            title: "Bewaard in Favorieten",
            // No "Bekijk" while she is already looking at Favorieten.
            action: pathname === "/favorieten" ? undefined : { label: "Bekijk", href: viewHref },
          }
        : { title: "Verwijderd uit Favorieten", action: { label: "Ongedaan maken", onClick: () => run(true) } },
    )
    startTransition(async () => {
      const result = await runAction(toggle)
      if (typeof result?.favorited === "boolean") {
        apply(result.favorited)
        return
      }
      apply(!next)
      toast.show({ title: result?.error ?? "Dat lukte even niet. Probeer het zo nog eens." })
    })
  }

  return {
    favorited,
    changes,
    isPending,
    // Ignore taps while the server is answering (two quick taps would send
    // two toggles). Not `disabled`: that would drop keyboard focus.
    toggle: () => {
      if (!isPending) run(!favorited)
    },
  }
}

/**
 * The heart itself: outline when not saved, filled peach when saved.
 * After a tap it fades and scales in (240ms, enter curve; a plain short
 * fade under reduced motion).
 */
export function FavoriteHeartIcon({
  favorited,
  changes,
  size = "md",
}: {
  favorited: boolean
  changes: number
  size?: "sm" | "md"
}) {
  const spec = size === "sm" ? ICON.sm : ICON.md
  return (
    <Heart
      key={changes}
      className={cn(spec.className, favorited && "text-peach", changes > 0 && "animate-dialog-in")}
      strokeWidth={spec.strokeWidth}
      fill={favorited ? "currentColor" : "none"}
      aria-hidden
    />
  )
}
