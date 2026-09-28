import { cn } from "@/lib/utils"

type BuddyMarkSize = "sm" | "md" | "lg" | "xl"

const SIZE: Record<BuddyMarkSize, { box: string; icon: string }> = {
  sm: { box: "h-5 w-5", icon: "h-3 w-3" },
  md: { box: "h-7 w-7", icon: "h-4 w-4" },
  lg: { box: "h-11 w-11", icon: "h-5 w-5" },
  xl: { box: "h-16 w-16", icon: "h-7 w-7" },
}

/**
 * Buddy’s visual signature — a soft companion presence, not a cartoon face.
 *
 * Soft ring + crescent orb: warm, adult, calm. Used only where Buddy speaks
 * or is named as a presence — never as generic decoration.
 */
export function BuddyGlyph({
  className,
  strokeWidth = 1.75,
}: {
  className?: string
  /** Kept for Lucide-like call sites in nav. */
  strokeWidth?: number
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        opacity="0.32"
      />
      {/* Crescent via evenodd cut — reads in light and dark without hard-coded fills */}
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 6.75a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5Zm2.35 1.2a3.55 3.55 0 1 0 0 7.6 5.25 5.25 0 0 1 0-7.6Z"
      />
    </svg>
  )
}

/** Soft sage badge with Buddy glyph — primary attribution mark. */
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
  /** When true, hide from assistive tech (e.g. next to a labeled message). */
  decorative?: boolean
}) {
  const s = SIZE[size]
  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-sage-soft text-sage-dark shrink-0",
        s.box,
        className,
      )}
    >
      <BuddyGlyph className={cn(s.icon, glyphClassName)} strokeWidth={1.75} />
    </span>
  )
}
