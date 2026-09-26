import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream text-ink px-6">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4">🌿</p>
        <h1 className="font-display text-2xl text-ink mb-2">Deze pagina bestaat niet</h1>
        <p className="text-sm text-ink-soft mb-6">
          We kunnen hem niet vinden. Misschien is de link verlopen, of heb je een typfout gemaakt.
        </p>
        <Link href="/vandaag" className={buttonVariants()}>
          Terug naar Vandaag
        </Link>
      </div>
    </div>
  )
}
