import Link from "next/link"
import { User } from "lucide-react"

export function MobileHeader() {
  return (
    <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 bg-cream/90 backdrop-blur border-b border-line/60">
      <Link href="/vandaag" className="font-display text-lg text-sage-dark">
        Cyclus
      </Link>
      <Link
        href="/profiel"
        aria-label="Profiel en instellingen"
        className="h-9 w-9 rounded-full bg-white border border-line flex items-center justify-center text-ink-soft"
      >
        <User className="h-4.5 w-4.5" strokeWidth={1.75} />
      </Link>
    </header>
  )
}
