import Link from "next/link"
import { BookOpen } from "lucide-react"
import { listKnowledgeArticles } from "@/lib/data/knowledge"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { BackButton } from "@/components/ui/back-button"
import { cn } from "@/lib/utils"

const CATEGORY_LABELS: Record<string, string> = {
  overgang: "Overgang",
  klachten: "Klachten",
  slaap: "Slaap",
  mentaal: "Mentaal",
  beweging: "Beweging",
  voeding: "Voeding",
  zorg: "Zorg",
  prive: "Privé",
}

/** Soft category accents — calm dots, not cover art. */
const CATEGORY_DOT: Record<string, string> = {
  overgang: "bg-phase-luteaal",
  klachten: "bg-phase-menstruatie",
  slaap: "bg-sage-fill",
  mentaal: "bg-peach",
  beweging: "bg-phase-folliculair",
  voeding: "bg-phase-ovulatie",
  zorg: "bg-ink-soft",
  prive: "bg-ink-soft/60",
}

export default async function KennisPage() {
  const articles = await listKnowledgeArticles()

  return (
    <div className="w-full max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6">
      <BackButton href="/cyclus" label="Cyclus" />
      <div>
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Kennis</h1>
        <p className="text-sm text-ink-soft mt-1">
          Heldere uitleg over hormonen, overgang en leefstijl — geen medisch advies.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {articles.map((article) => (
          <Link key={article.id} href={`/kennis/${article.slug}`} className="block">
            <Card interactive>
              <p className="text-xs font-medium text-sage-dark mb-1 inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full shrink-0",
                    CATEGORY_DOT[article.category] ?? "bg-sage-fill",
                  )}
                  aria-hidden
                />
                {CATEGORY_LABELS[article.category] ?? article.category}
              </p>
              <p className="font-display text-lg text-ink">{article.title}</p>
              <p className="text-sm text-ink-soft mt-1">{article.summary}</p>
            </Card>
          </Link>
        ))}
        {articles.length === 0 && (
          <EmptyState
            icon={<BookOpen className="h-6 w-6" strokeWidth={1.5} />}
            title="Nog geen artikelen"
            description="Zodra er nieuwe kennisartikelen klaarstaan, verschijnen ze hier."
          />
        )}
      </div>
    </div>
  )
}
