"use client"

import { useMemo, useState } from "react"
import { Info } from "lucide-react"
import { AppBarConfig } from "@/components/nav/app-bar-context"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { IconButton } from "@/components/ui/icon-button"
import { ListGroup, ListRow } from "@/components/ui/list-group"
import { BuddyMark } from "@/components/buddy/buddy-mark"
import { BUDDY_DISCLAIMER } from "@/components/buddy/copy"
import { FEATURES } from "@/lib/navigation/features"

/**
 * Buddy's one bar (BUD-1, BUD-5, NAV-12). On a phone the app bar does both
 * jobs — the Buddy mark, "Buddy" and ⓘ — so the conversation gets the
 * height; the h1 is there for screen readers only (besluit 26). From md
 * on (no app bar) the same h1 is visible in a row with the mark and ⓘ.
 *
 * ⓘ opens "Over Buddy": what Buddy is, the disclaimer, and her own
 * settings (Buddy-stijl, Privacy) without leaving the Buddy tab.
 */
export function BuddyHeader() {
  const [aboutOpen, setAboutOpen] = useState(false)

  // Stable elements: the app bar re-registers whenever these change.
  const leading = useMemo(
    () => (
      // Lines the mark up with the 20px page gutter.
      <span className="inline-flex pl-3">
        <BuddyMark size="md" decorative />
      </span>
    ),
    [],
  )
  const aboutButton = useMemo(
    () => <IconButton label="Over Buddy" icon={Info} onClick={() => setAboutOpen(true)} />,
    [],
  )

  return (
    <>
      <AppBarConfig
        title={FEATURES.buddy.label}
        alwaysShowTitle
        divider
        leading={leading}
        action={aboutButton}
      />

      {/* Mobile: 0px tall (only the sr-only h1). md+: the page's own header row. */}
      <div className="shrink-0 md:flex md:items-center md:gap-3 md:border-b md:border-line md:px-5 md:pt-4 md:pb-3 lg:px-8 lg:pt-10">
        <BuddyMark size="md" decorative className="hidden md:inline-flex" />
        <h1
          tabIndex={-1}
          data-focus-target=""
          className="sr-only md:not-sr-only md:min-w-0 md:flex-1 type-page-title text-ink"
        >
          {FEATURES.buddy.label}
        </h1>
        <div className="hidden md:flex">{aboutButton}</div>
      </div>

      <BottomSheet open={aboutOpen} onClose={() => setAboutOpen(false)} title="Over Buddy">
        <div className="flex flex-col gap-4 pb-2">
          <p className="text-base text-ink">
            Buddy denkt met je mee op basis van wat je in GoFiev deelt, zoals je check-ins en waar je
            in je cyclus zit.
          </p>
          <p className="text-sm text-ink-soft">{BUDDY_DISCLAIMER}</p>
          <ListGroup>
            <ListRow
              href={FEATURES.buddyStijl.href}
              icon={FEATURES.buddyStijl.icon}
              title={FEATURES.buddyStijl.label}
              description={FEATURES.buddyStijl.description}
            />
            <ListRow
              href={FEATURES.privacy.href}
              icon={FEATURES.privacy.icon}
              title={FEATURES.privacy.label}
              description={FEATURES.privacy.description}
            />
          </ListGroup>
        </div>
      </BottomSheet>
    </>
  )
}
