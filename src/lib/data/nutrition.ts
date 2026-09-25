import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

const RECIPE_CARD_COLUMNS =
  "id, title, description, image_url, preparation_time, servings, is_budget, category, nutrition_information"

export type RecipeCardData = Pick<
  Tables<"recipes">,
  | "id"
  | "title"
  | "description"
  | "image_url"
  | "preparation_time"
  | "servings"
  | "is_budget"
  | "category"
  | "nutrition_information"
>

export async function getRecipeLibrary(): Promise<RecipeCardData[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("recipes").select(RECIPE_CARD_COLUMNS).order("title")
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

export async function getFavoriteRecipes(userId: string): Promise<RecipeCardData[]> {
  const supabase = await createClient()
  const { data: favorites } = await supabase
    .from("favorites")
    .select("recipe_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  const recipeIds = (favorites ?? []).map((f) => f.recipe_id)
  if (!recipeIds.length) return []

  const { data: recipes } = await supabase.from("recipes").select(RECIPE_CARD_COLUMNS).in("id", recipeIds)
  const byId = new Map((recipes ?? []).map((r) => [r.id, r]))
  return recipeIds.map((id) => byId.get(id)).filter((r): r is NonNullable<typeof r> => Boolean(r))
}
