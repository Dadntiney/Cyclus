import { createClient } from "@/lib/supabase/server"

export async function listKnowledgeArticles() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("knowledge_articles")
    .select("id, slug, title, summary, category, tags, sort_order")
    .order("sort_order", { ascending: true })
  return data ?? []
}

export async function getKnowledgeArticle(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("knowledge_articles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()
  return data
}

export async function getFeaturedKnowledge(limit = 3) {
  const articles = await listKnowledgeArticles()
  return articles.slice(0, limit)
}
