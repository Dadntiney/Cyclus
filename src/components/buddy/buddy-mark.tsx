import { cn } from "@/lib/utils"

type BuddyMarkSize = "sm" | "md" | "lg" | "xl"

const SIZE: Record<BuddyMarkSize, { box: string; icon: string }> = {
  sm: { box: "h-5 w-5", icon: "h-3.5 w-3.5" },
  md: { box: "h-7 w-7", icon: "h-4.5 w-4.5" },
  lg: { box: "h-11 w-11", icon: "h-6 w-6" },
  xl: { box: "h-16 w-16", icon: "h-9 w-9" },
}

/** Same silhouette as Lucide `Droplet` (menstruatie-status icon). */
const DROPLET =
  "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"

/**
 * Buddy — peach dewdrop companion.
 *
 * Shape matches the menstruatie Droplet icon. Solid mark gets happy
 * white squint-eyes; outline is stroke-only for nav parity with Lucide.
 */
export function BuddyGlyph({
  className,
  strokeWidth = 1.75,
  face = true,
  variant = "solid",
}: {
  className?: string
  strokeWidth?: number
  face?: boolean
  variant?: "solid" | "outline"
}) {
  if (variant === "outline") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className={cn("shrink-0", className)}
      >
        <path
          d={DROPLET}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <path fill="currentColor" d={DROPLET} />
      {face && (
        <>
          {/* White eyes only — soft “knijp” ellipses (happy squint) */}
          <ellipse cx="9.55" cy="14.1" rx="1.65" ry="1.05" fill="#fff" />
          <ellipse cx="14.45" cy="14.1" rx="1.65" ry="1.05" fill="#fff" />
        </>
      )}
    </svg>
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
      <BuddyGlyph className={cn(s.icon, glyphClassName)} strokeWidth={1.75} />
    </span>
  )
}
