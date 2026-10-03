"use client"

import type { MouseEvent } from "react"
import { ArrowDown } from "lucide-react"
import { iconProps } from "@/lib/ui/icon"
import { prefersReducedMotion } from "@/lib/ui/focus"

export interface LegalSectionRef {
  id: string
  /** The section's h2, word for word (besluit 35: no summarising bullets). */
  title: string
}

const CONTENTS_LABEL_ID = "op-deze-pagina"

/**
 * "Op deze pagina": the h2 titles of a legal page as jump links (AUTH-6).
 *
 * A jump scrolls and moves focus to the heading without adding a history
 * entry — otherwise "‹ Vorige" at the top would first walk back through
 * every jump instead of leaving the page. Without JavaScript the links are
 * plain #anchors.
 */
export function LegalContents({ sections }: { sections: readonly LegalSectionRef[] }) {
  function jump(e: MouseEvent<HTMLAnchorElement>, id: string) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const target = document.getElementById(id)
    if (!target) return
    e.preventDefault()
    target.focus({ preventScroll: true })
    target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" })
  }

  return (
    <nav aria-labelledby={CONTENTS_LABEL_ID}>
      <h2 id={CONTENTS_LABEL_ID} className="type-group-label mb-2 px-1 text-ink-soft">
        Op deze pagina
      </h2>
      <ul role="list" className="overflow-hidden rounded-card border border-line bg-surface divide-y divide-line">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={(e) => jump(e, s.id)}
              className="flex min-h-12 items-center gap-3 px-4 py-3 text-base text-ink -outline-offset-2 touch-manipulation transition-colors duration-fast ease-standard hover:bg-cream-soft/60 active:bg-cream-soft"
            >
              <span className="flex-1">{s.title}</span>
              <ArrowDown {...iconProps("sm", "text-ink-soft")} aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
