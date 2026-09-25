import Link from "next/link"
import Image from "next/image"
import { User } from "lucide-react"

export function MobileHeader({ avatarUrl }: { avatarUrl: string | null }) {
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
        aria-label="Mijn profiel"
        className="h-11 w-11 rounded-full bg-white border border-line overflow-hidden flex items-center justify-center text-ink-soft transition-[transform,border-color] duration-150 touch-manipulation motion-safe:active:scale-[0.94] active:border-sage/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        {avatarUrl ? (
          <Image src={avatarUrl} alt="" width={44} height={44} className="h-full w-full object-cover" />
        ) : (
          <User className="h-[18px] w-[18px]" strokeWidth={1.75} />
        )}
      </Link>
    </header>
  )
}
