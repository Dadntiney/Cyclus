import { cn } from "@/lib/utils"

/**
 * The GoFiev droplet as a crisp, theme-aware vector — same silhouette as
 * public/brand/gofiev-droplet.png, in rozenhout with a soft highlight.
 */
export function DropletMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 20" aria-hidden className={cn("shrink-0", className)}>
      <path d="M8 0.5C8 0.5 1 9.2 1 13a7 7 0 0 0 14 0C15 9.2 8 0.5 8 0.5Z" fill="var(--color-peach)" />
      <path
        d="M5.2 11.2c-.7 1.1-.9 2.3-.6 3.3"
        fill="none"
        stroke="var(--color-peach-soft)"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  )
}
