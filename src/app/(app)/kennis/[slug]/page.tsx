import type { Metadata } from "next"
import { cache } from "react"
import { notFound } from "next/navigation"
import { getKnowledgeArticle, listKnowledgeArticles } from "@/lib/data/knowledge"
import { FEATURES } from "@/lib/navigation/features"
import { Page, PageSections } from "@/components/layout/page"
import { PageHeader } from "@/components/layout/page-header"
import { ListGroup, ListRow } from "@/components/ui/list-group"
import { ArticleContent } from "../article-content"
import { categoryLabel, relatedArticles } from "../categories"

/** The canonical, personal overgang explainer lives in Cyclus (WB-7, NAV-14). */
const OVERGANG_ARTICLE = "wat-verandert-er-rondom-de-overgang"

// One query per request, shared by the title and the page.
const loadArticle = cache((slug: string) => getKnowledgeArticle(slug))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await loadArticle(slug)
  return { title: article?.title ?? FEATURES.kennis.label }
}

export default async function KennisArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await loadArticle(slug)
  if (!article) notFound()

  const others = relatedArticles(await listKnowledgeArticles(), article)

  return (
    <Page as="article">
      <PageHeader
        eyebrow={categoryLabel(article.category)}
        title={article.title}
        subtitle={article.summary}
        back={{ href: FEATURES.kennis.href, label: FEATURES.kennis.label }}
      />

      <PageSections>
        <div className="flex flex-col gap-6">
          <ArticleContent body={article.body} />
          <p className="border-t border-line pt-4 text-sm text-ink-soft">
            Dit is algemene informatie, geen medisch advies. Heb je klachten of twijfel je? Overleg dan gerust met
            je huisarts of een andere zorgverlener.
          </p>
        </div>

        {slug === OVERGANG_ARTICLE && (
          <ListGroup>
            <ListRow
              title={FEATURES.overgang.label}
              description="Lees de uitgebreide uitleg"
              icon={FEATURES.overgang.icon}
              href={FEATURES.overgang.href}
            />
          </ListGroup>
        )}

        {others.length > 0 && (
          <ListGroup label="Ook interessant" labelAs="h2">
            {others.map((other) => (
              <ListRow
                key={other.id}
                title={other.title}
                description={categoryLabel(other.category)}
                href={`/kennis/${other.slug}`}
              />
            ))}
          </ListGroup>
        )}
      </PageSections>
    </Page>
  )
}
