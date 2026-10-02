import Link from "next/link"
import { notFound } from "next/navigation"
import { getKnowledgeArticle, listKnowledgeArticles } from "@/lib/data/knowledge"
import { BackButton } from "@/components/ui/back-button"

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
    <div className="w-full max-w-3xl mx-auto px-5 lg:px-8 py-6 lg:py-10 flex flex-col gap-8">
      <div>
        <BackButton href="/kennis" label="Alle kennis" />
        <h1 className="font-display text-3xl lg:text-4xl text-ink mt-3">{article.title}</h1>
        <p className="text-lg text-ink-soft mt-3 leading-relaxed max-w-[60ch]">{article.summary}</p>
      </div>

      <article className="max-w-[65ch]">
        <div className="text-base text-ink whitespace-pre-wrap leading-[1.7]">{article.body}</div>
        <p className="text-sm text-ink-soft mt-8 border-t border-line pt-4">
          Dit is geen medisch advies. Raadpleeg bij klachten altijd een arts of specialist.
        </p>
      </article>

      {others.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-ink mb-3">Ook interessant</h2>
          <ul className="flex flex-col gap-2">
            {others.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/kennis/${a.slug}`}
                  className="inline-flex items-center min-h-11 text-base text-sage-dark font-medium underline-offset-4 hover:underline"
                >
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
