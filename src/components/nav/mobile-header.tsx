import Link from "next/link"
import { User } from "lucide-react"

export function MobileHeader() {
  return (
    <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-5 py-3 bg-cream/90 backdrop-blur border-b border-line/60">
      <Link
        href="/vandaag"
        className="font-display text-lg text-sage-dark rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        Cyclus
      </Link>
      <Link
        href="/profiel"
        aria-label="Profiel en instellingen"
        className="h-11 w-11 rounded-full bg-white border border-line flex items-center justify-center text-ink-soft transition-[transform,border-color] duration-150 touch-manipulation motion-safe:active:scale-[0.94] active:border-sage/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <User className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </Link>
    </header>
  )
}
