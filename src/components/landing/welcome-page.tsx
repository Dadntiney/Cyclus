import Link from "next/link"
import { BookOpen, HeartHandshake, Sparkles } from "lucide-react"
import { Lockup } from "@/components/brand/lockup"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { iconProps } from "@/lib/ui/icon"

const PILLARS = [
  {
    icon: BookOpen,
    title: "Begrijpen",
    text: "Wat er in je lichaam kan gebeuren, per fase en rond de overgang. In gewone taal.",
  },
  {
    icon: Sparkles,
    title: "Herkennen",
    text: "Jouw eigen patronen in energie, slaap en klachten, zodat je ziet wat terugkomt.",
  },
  {
    icon: HeartHandshake,
    title: "Ondersteunen",
    text: "Kleine, haalbare ideeën voor bewegen, eten en rust. Nooit verplicht.",
  },
] as const

/** Quiet footer link with a 44px target. */
const FOOTER_LINK = "inline-flex min-h-11 items-center hover:underline underline-offset-4"

/**
 * What a first-time visitor sees at "/" — before, the root went straight to
 * the login form, so someone who got the link had no idea what GoFiev is.
 */
export function WelcomePage() {
  return (
    <div className="min-h-dvh bg-cream flex flex-col">
      <main className="flex-1 w-full max-w-6xl mx-auto px-5 lg:px-8 py-12 lg:py-20 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          {/* The same lockup as the auth screens (AUTH-2). */}
          <Lockup className="mb-10" />
          <h1 className="type-page-title text-ink">
            Je lichaam verandert. Je hoeft het niet alleen uit te zoeken.
          </h1>
          <p className="text-ink-soft text-base lg:text-lg leading-relaxed mt-5 max-w-md">
            Voor vrouwen van 30 en ouder die merken dat hun cyclus, energie of slaap anders voelt
            dan vroeger. GoFiev helpt je begrijpen wat er speelt en wat jou kan helpen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 max-w-lg [&>a]:whitespace-nowrap">
            <Link href="/registreren" className={buttonVariants({ className: "sm:flex-1" })}>
              Probeer GoFiev
            </Link>
            <Link
              href="/login"
              className={buttonVariants({ variant: "secondary", className: "sm:flex-1" })}
            >
              Ik heb al een account
            </Link>
          </div>
          <p className="text-xs text-ink-soft mt-4 max-w-md">
            Geen diagnoses, wel uitleg en steun. GoFiev vervangt geen arts.
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {PILLARS.map((p) => (
            <Card as="li" key={p.title} className="flex gap-4">
              <span className="h-11 w-11 shrink-0 rounded-full bg-sage-soft flex items-center justify-center">
                <p.icon {...iconProps("md", "text-sage-dark")} aria-hidden />
              </span>
              <span>
                <span className="block font-medium text-ink">{p.title}</span>
                <span className="block text-sm text-ink-soft mt-1 leading-relaxed">{p.text}</span>
              </span>
            </Card>
          ))}
        </ul>
      </main>
      <footer className="w-full max-w-6xl mx-auto px-5 lg:px-8 pb-6 flex gap-5 text-xs text-ink-soft">
        <Link href="/privacy" className={FOOTER_LINK}>
          Privacy
        </Link>
        <Link href="/voorwaarden" className={FOOTER_LINK}>
          Voorwaarden
        </Link>
      </footer>
    </div>
  )
}
