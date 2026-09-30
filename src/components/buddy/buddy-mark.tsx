import { MessageCircleHeart } from "lucide-react"
import { cn } from "@/lib/utils"

type BuddyMarkSize = "sm" | "md" | "lg" | "xl"

const SIZE: Record<BuddyMarkSize, { box: string; icon: string }> = {
  sm: { box: "h-5 w-5", icon: "h-3.5 w-3.5" },
  md: { box: "h-7 w-7", icon: "h-4.5 w-4.5" },
  lg: { box: "h-11 w-11", icon: "h-6 w-6" },
  xl: { box: "h-16 w-16", icon: "h-9 w-9" },
}

/**
 * Buddy — speech bubble with a heart (Lucide `MessageCircleHeart`).
 *
 * Not a droplet: menstruatie / “starten” already owns Droplet. Bubble = chat,
 * heart = warm companion. Matches the stroke weight of the other tab icons.
 */
export function BuddyGlyph({
  className,
  strokeWidth = 1.75,
  variant = "solid",
}: {
  className?: string
  strokeWidth?: number
  /** @deprecated Face removed — kept so call sites keep compiling. */
  face?: boolean
  /** Outline = nav stroke; solid fills the mark for peach BuddyMark chips. */
  variant?: "solid" | "outline"
}) {
  return (
    <MessageCircleHeart
      aria-hidden
      className={cn("shrink-0", className)}
      strokeWidth={strokeWidth}
      fill={variant === "solid" ? "currentColor" : "none"}
      // On solid fills, keep the heart readable as a slight cut via stroke.
      stroke="currentColor"
    />
  )
}

export function BuddyMark({
  size = "md",
  className,
  glyphClassName,
  label = "Buddy",
  decorative = false,
}: {
  size?: BuddyMarkSize
  className?: string
  glyphClassName?: string
  label?: string
  decorative?: boolean
}) {
  const s = SIZE[size]
  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-peach-soft text-peach shrink-0",
        s.box,
        className,
      )}
    >
      {/* Outline on soft peach chip — filled solid would swallow the heart. */}
      <BuddyGlyph
        variant="outline"
        className={cn(s.icon, glyphClassName)}
        strokeWidth={1.75}
      />
    </span>
  )
}
