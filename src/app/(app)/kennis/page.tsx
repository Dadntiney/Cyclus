import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { listKnowledgeArticles } from "@/lib/data/knowledge"
import { FEATURES } from "@/lib/navigation/features"
import { Page, PageSections } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionHeader } from "@/components/ui/section-header"
import { buttonVariants } from "@/components/ui/button"
import { categoryLabel, groupArticles } from "./categories"

export const metadata: Metadata = { title: FEATURES.kennis.label }

/**
 * Kennis (ontwerpvisie §7.7): the articles under small category headers,
 * each card a caption with a neutral dot, the title and a two-line summary.
 */
export default async function KennisPage() {
  const articles = await listKnowledgeArticles()
  const groups = groupArticles(articles)

  return (
    <Page>
      <PageHeader
        title={FEATURES.kennis.label}
        subtitle="Heldere uitleg over hormonen, de overgang en leefstijl. Geen medisch advies."
      />

      {groups.length ? (
        <PageSections>
          {groups.map((group) => (
            <section key={group.key} aria-labelledby={`kennis-${group.key}`}>
              <SectionHeader id={`kennis-${group.key}`} title={group.title} />
              <ul className="flex flex-col gap-3">
                {group.articles.map((article) => (
                  <li key={article.id}>
                    <Link href={`/kennis/${article.slug}`} className="block rounded-card touch-manipulation">
                      <Card interactive className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 type-caption text-ink-soft">
                          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink-soft/40" />
                          {categoryLabel(article.category)}
                        </span>
                        <span className="type-card-title text-ink">{article.title}</span>
                        {article.summary && (
                          <span className="line-clamp-2 text-sm text-ink-soft">{article.summary}</span>
                        )}
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </PageSections>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Nog geen artikelen"
          description="Zodra er nieuwe kennisartikelen klaarstaan, verschijnen ze hier."
          action={
            <Link href={FEATURES.ontdek.href} className={buttonVariants({ variant: "tonal", size: "sm" })}>
              Terug naar {FEATURES.ontdek.label}
            </Link>
          }
        />
      )}
    </Page>
  )
}
