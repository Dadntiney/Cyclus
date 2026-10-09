import { DropletMark } from "@/components/brand/droplet-mark"
import { APP_DISPLAY_NAME } from "@/lib/theme/brand"
import { cn } from "@/lib/utils"

type LockupSize = "sm" | "md"

const SIZES: Record<LockupSize, { root: string; mark: string; word: string }> = {
  /** Legal pages and other quiet spots: 24px droplet, 20px wordmark. */
  sm: { root: "gap-2", mark: "h-6 w-5", word: "type-card-title" },
  /** Logged-out entry screens (inloggen, registreren): 32px droplet, 24px wordmark. */
  md: { root: "gap-2.5", mark: "h-8 w-6", word: "type-section-title" },
}

/**
 * The one GoFiev lockup (AUTH-2): droplet + wordmark, horizontal and left
 * aligned, in two sizes. The wordmark is real text, so screen readers read
 * "GoFiev"; the droplet is decorative.
 *
 * ```tsx
 * <Lockup />            // md — auth screens, welcome
 * <Lockup size="sm" />  // sm — legal pages
 * ```
 */
export function Lockup({ size = "md", className }: { size?: LockupSize; className?: string }) {
  const s = SIZES[size]
  return (
    <div className={cn("flex items-center text-ink", s.root, className)}>
      <DropletMark className={s.mark} />
      <span className={s.word}>{APP_DISPLAY_NAME}</span>
    </div>
  )
}
