import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-white border border-line/70 shadow-[0_2px_16px_rgba(44,42,38,0.05)] p-5",
        className,
      )}
      {...props}
    />
  )
}
