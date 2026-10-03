"use client"

import { useRef, useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { toggleFavorite } from "@/lib/actions/nutrition"
import { IconButton } from "@/components/ui/icon-button"
import { toast } from "@/components/ui/toast"
import { runAction } from "@/lib/client/run-action"
import { triggerHaptic } from "@/lib/platform"
import { ICON } from "@/lib/ui/icon"
import { cn } from "@/lib/utils"
import { RECIPE_FAVORITES_HREF } from "./recipe-format"

/**
 * Save a recipe: the app-wide "bewaren" gesture (ontwerpvisie §6.2). The
 * heart itself is the feedback (it fills and settles in, a light haptic),
 * and the confirmation is the toast above the tab bar, "Bewaard in
 * Favorieten · Bekijk". Nothing is inserted next to the title any more, so
 * the h1 never reflows (NUT-6).
 *
 * The server action is called exactly as before (it toggles). Requests run
 * one after another, so a quick "Ongedaan maken" never races the save it
 * undoes, and only the latest answer sets the heart.
 */
export function FavoriteButton({
  recipeId,
  initialFavorited,
}: {
  recipeId: string
  initialFavorited: boolean
}) {
  const [favorited, setFavorited] = useState(initialFavorited)
  // Bumped on every tap so the heart re-mounts and plays its fill (never on load).
  const [changes, setChanges] = useState(0)
  const [isPending, startTransition] = useTransition()
  const queueRef = useRef<Promise<unknown>>(Promise.resolve())
  const latestRef = useRef(0)

  function run(next: boolean) {
    setFavorited(next)
    setChanges((n) => n + 1)
    void triggerHaptic("light")
    toast.show(
      next
        ? { title: "Bewaard in Favorieten", action: { label: "Bekijk", href: RECIPE_FAVORITES_HREF } }
        : { title: "Verwijderd uit Favorieten", action: { label: "Ongedaan maken", onClick: () => run(true) } },
    )
    const id = ++latestRef.current
    const request = queueRef.current.then(() => runAction(() => toggleFavorite(recipeId)))
    queueRef.current = request.catch(() => undefined)
    startTransition(async () => {
      const result = await request
      if (id !== latestRef.current) return
      if (typeof result?.favorited === "boolean") {
        setFavorited(result.favorited)
        return
      }
      setFavorited(!next)
      toast.show({ title: result?.error ?? "Dat lukte even niet. Probeer het zo nog eens." })
    })
  }

  return (
    <IconButton
      label="Bewaar recept in favorieten"
      pressed={favorited}
      aria-busy={isPending || undefined}
      // Ignore taps while the server answers (two quick taps would send two
      // toggles). Not `disabled`: that would drop the keyboard focus.
      onClick={() => {
        if (!isPending) run(!favorited)
      }}
      icon={
        <Heart
          key={changes}
          className={cn(ICON.md.className, favorited && "text-peach", changes > 0 && "animate-dialog-in")}
          strokeWidth={ICON.md.strokeWidth}
          fill={favorited ? "currentColor" : "none"}
          aria-hidden
        />
      }
    />
  )
}
