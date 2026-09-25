"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function toggleFavorite(recipeId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("recipe_id", recipeId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from("favorites").delete().eq("id", existing.id)
    if (error) return { error: "Verwijderen is niet gelukt." }
    revalidatePath("/voeding")
    revalidatePath(`/voeding/${recipeId}`)
    revalidatePath("/voeding/favorieten")
    return { success: true, favorited: false }
  }

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: user.id, recipe_id: recipeId })
  if (error) return { error: "Opslaan is niet gelukt." }

  revalidatePath("/voeding")
  revalidatePath(`/voeding/${recipeId}`)
  revalidatePath("/voeding/favorieten")
  return { success: true, favorited: true }
}
