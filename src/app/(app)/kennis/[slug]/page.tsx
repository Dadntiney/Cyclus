import Link from "next/link"
import { notFound } from "next/navigation"
import { getKnowledgeArticle, listKnowledgeArticles } from "@/lib/data/knowledge"
import { Card } from "@/components/ui/card"

export default async function KennisArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getKnowledgeArticle(slug)
  if (!article) notFound()

  const others = (await listKnowledgeArticles()).filter((a) => a.slug !== slug).slice(0, 3)

  return (
    <div className="w-full max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-6">
      <div>
        <Link href="/kennis" className="text-sm text-sage-dark font-medium">
          ← Alle kennis
        </Link>
        <h1 className="font-display text-2xl lg:text-3xl text-ink mt-3">{article.title}</h1>
        <p className="text-sm text-ink-soft mt-2">{article.summary}</p>
      </div>

      <Card>
        <div className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{article.body}</div>
        <p className="text-xs text-ink-soft mt-5 border-t border-line pt-3">
          Dit is geen medisch advies. Raadpleeg bij klachten altijd een arts of specialist.
        </p>
      </Card>

      {others.length > 0 && (
        <div>
          <h2 className="font-display text-lg text-ink mb-3">Ook interessant</h2>
          <ul className="flex flex-col gap-2">
            {others.map((a) => (
              <li key={a.id}>
                <Link href={`/kennis/${a.slug}`} className="text-sm text-sage-dark font-medium">
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
