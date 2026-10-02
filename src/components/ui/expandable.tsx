"use client"

import type { ReactNode } from "react"
import { Disclosure } from "@/components/ui/disclosure"

/**
 * @deprecated Use `<Disclosure label openLabel>` from
 * "@/components/ui/disclosure". Kept so existing imports keep working; it
 * now renders the shared Disclosure (animated, content stays mounted).
 */
export function Expandable({
  label = "Meer weten",
  closeLabel = "Minder weergeven",
  children,
}: {
  label?: string
  closeLabel?: string
  children: ReactNode
}) {
  return (
    <Disclosure label={label} openLabel={closeLabel}>
      {children}
    </Disclosure>
  )
}

export { Disclosure }
