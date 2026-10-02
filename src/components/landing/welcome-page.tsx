import Link from "next/link"
import { BookOpen, HeartHandshake, Sparkles } from "lucide-react"
import { DropletMark } from "@/components/brand/droplet-mark"
import { buttonVariants } from "@/components/ui/button"
import { APP_DISPLAY_NAME } from "@/lib/theme/brand"

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

/**
 * What a first-time visitor sees at "/" — before, the root went straight to
 * the login form, so someone who got the link had no idea what GoFiev is.
 */
export function WelcomePage() {
  return (
    <div className="min-h-dvh bg-cream flex flex-col">
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 lg:py-20 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="flex items-center gap-2.5 mb-10">
            <DropletMark className="h-8 w-6" />
            <span className="font-display text-2xl text-ink">{APP_DISPLAY_NAME}</span>
          </div>
          <h1 className="font-display text-4xl lg:text-5xl leading-tight text-ink">
            Je lichaam verandert. Je hoeft het niet alleen uit te zoeken.
          </h1>
          <p className="text-ink-soft text-base lg:text-lg leading-relaxed mt-5 max-w-md">
            Voor vrouwen van 30 en ouder die merken dat hun cyclus, energie of slaap anders voelt
            dan vroeger. GoFiev helpt je begrijpen wat er speelt en wat jou kan helpen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 max-w-md">
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
            <li
              key={p.title}
              className="flex gap-4 rounded-[1.25rem] bg-surface border border-line p-5"
            >
              <span className="h-11 w-11 shrink-0 rounded-full bg-sage-soft flex items-center justify-center">
                <p.icon className="h-5 w-5 text-sage-dark" strokeWidth={1.75} aria-hidden />
              </span>
              <span>
                <span className="block font-medium text-ink">{p.title}</span>
                <span className="block text-sm text-ink-soft mt-1 leading-relaxed">{p.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </main>
      <footer className="w-full max-w-5xl mx-auto px-6 pb-8 flex gap-5 text-xs text-ink-soft">
        <Link href="/privacy" className="hover:underline underline-offset-4">Privacy</Link>
        <Link href="/voorwaarden" className="hover:underline underline-offset-4">Voorwaarden</Link>
      </footer>
    </div>
  )
}
