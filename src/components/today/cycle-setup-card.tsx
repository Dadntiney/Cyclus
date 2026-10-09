"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { MenstruationQuickAction } from "@/components/cycle/menstruation-quick-action"
import { FEATURES } from "@/lib/navigation/features"
import { ICON, iconProps } from "@/lib/ui/icon"

/**
 * When she has a cycle but we can't estimate a phase yet (missing last period
 * or cycle length), still give Vandaag a calm cycle surface — not only a quiet
 * text link under a generic greeting.
 */
export function CycleSetupCard() {
  const Icon = FEATURES.cyclusinstellingen.icon
  return (
    <Card padding="none">
      <Link
        href={FEATURES.cyclusinstellingen.href}
        className="flex min-h-14 items-center gap-3 rounded-t-card px-4 py-3 touch-manipulation -outline-offset-2 transition-colors duration-fast ease-standard hover:bg-cream-soft/60 active:bg-cream-soft"
      >
        <span
          aria-hidden
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-inset bg-sage-soft text-sage-dark"
        >
          <Icon {...ICON.sm} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-medium text-ink">{FEATURES.cyclusinstellingen.label}</span>
          <span className="block text-sm text-ink-soft">
            Vul je laatste menstruatie in voor een fase-inschatting, of noteer hieronder dat je vandaag begint.
          </span>
        </span>
        <ChevronRight {...iconProps("sm", "text-ink-soft")} aria-hidden />
      </Link>
      <div className="border-t border-line px-4">
        <MenstruationQuickAction isActive={false} day={null} variant="quiet" />
      </div>
    </Card>
  )
}
