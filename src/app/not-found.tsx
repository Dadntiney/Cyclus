import type { Metadata } from "next"
import Link from "next/link"
import { Compass } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { FEATURES } from "@/lib/navigation/features"
import { ICON } from "@/lib/ui/icon"

export const metadata: Metadata = { title: "Pagina niet gevonden" }

export default function NotFound() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-cream text-ink px-5">
      <div className="text-center max-w-sm">
        <span
          aria-hidden
          className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-sage-soft text-sage-dark"
        >
          <Compass {...ICON.lg} />
        </span>
        <h1 className="type-page-title text-ink mb-3">Deze pagina bestaat niet</h1>
        <p className="text-sm text-ink-soft mb-6">
          We kunnen hem niet vinden. Misschien is de link verlopen, of heb je een typfout gemaakt.
        </p>
        <Link href={FEATURES.vandaag.href} className={buttonVariants()}>
          Naar {FEATURES.vandaag.label}
        </Link>
      </div>
    </main>
  )
}
