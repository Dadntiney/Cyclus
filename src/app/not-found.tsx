import Link from "next/link"
import { Compass } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream text-ink px-6">
      <div className="text-center max-w-sm">
        <Compass className="h-9 w-9 mx-auto mb-4 text-sage-dark" strokeWidth={1.5} />
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
