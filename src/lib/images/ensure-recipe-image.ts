import "server-only"
import { createServiceClient } from "@/lib/supabase/service"
import { generateRecipeImage } from "@/lib/images/openai-provider"
import type { Tables } from "@/types/database"

const BUCKET = "recipe-images"

function parseIngredients(ingredients: unknown): string[] {
  return Array.isArray(ingredients)
    ? ingredients.filter((i): i is string => typeof i === "string")
    : []
}

/**
 * Returns the recipe's photo URL, generating and caching it via OpenAI +
 * Supabase Storage exactly once if it doesn't exist yet. Never throws —
 * on any failure it logs server-side and returns null so callers can fall
 * back to the illustrated placeholder instead of breaking the page.
 */
export async function ensureRecipeImage(recipe: Tables<"recipes">): Promise<string | null> {
  if (recipe.image_url) {
    return recipe.image_url
  }

  try {
    const service = createServiceClient()

    const { base64, contentType } = await generateRecipeImage(
      recipe.title,
      recipe.description,
      parseIngredients(recipe.ingredients),
    )

    const path = `${recipe.id}.png`
    const { error: uploadError } = await service.storage
      .from(BUCKET)
      .upload(path, Buffer.from(base64, "base64"), {
        contentType,
        upsert: true,
      })
    if (uploadError) {
      throw uploadError
    }

    const { data: publicUrlData } = service.storage.from(BUCKET).getPublicUrl(path)
    const imageUrl = publicUrlData.publicUrl

    // Only persist if still empty, so a concurrent request that already
    // finished generating doesn't get silently overwritten.
    const { data: updated, error: updateError } = await service
      .from("recipes")
      .update({ image_url: imageUrl })
      .eq("id", recipe.id)
      .is("image_url", null)
      .select("image_url")
      .maybeSingle()
    if (updateError) {
      throw updateError
    }

    return updated?.image_url ?? imageUrl
  } catch (error) {
    console.error(`[recipe-images] Failed to generate image for recipe ${recipe.id}:`, error)
    return null
  }
}
