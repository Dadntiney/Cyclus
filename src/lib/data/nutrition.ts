import { createClient } from "@/lib/supabase/server"

export async function getRecipeLibrary() {
  const supabase = await createClient()
  const { data } = await supabase.from("recipes").select("*").order("title")
  return data ?? []
}

export async function getRecipeDetail(recipeId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from("recipes").select("*").eq("id", recipeId).single()
  return data
}

export async function getFavoriteRecipeIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient()
  const { data } = await supabase.from("favorites").select("recipe_id").eq("user_id", userId)
  return new Set((data ?? []).map((f) => f.recipe_id))
}

export async function getFavoriteRecipes(userId: string) {
  const supabase = await createClient()
  const { data: favorites } = await supabase
    .from("favorites")
    .select("recipe_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  const recipeIds = (favorites ?? []).map((f) => f.recipe_id)
  if (!recipeIds.length) return []

  const { data: recipes } = await supabase.from("recipes").select("*").in("id", recipeIds)
  const byId = new Map((recipes ?? []).map((r) => [r.id, r]))
  return recipeIds.map((id) => byId.get(id)).filter((r): r is NonNullable<typeof r> => Boolean(r))
}
