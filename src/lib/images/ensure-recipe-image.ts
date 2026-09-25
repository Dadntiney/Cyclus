import "server-only"
import { createServiceClient } from "@/lib/supabase/service"
import { generateRecipeImage } from "@/lib/images/openai-provider"
import { fetchRecipeStockPhoto } from "@/lib/images/pexels-provider"
import type { Tables } from "@/types/database"

const BUCKET = "recipe-images"

function parseStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((i): i is string => typeof i === "string") : []
}

function extensionFor(contentType: string): string {
  if (contentType.includes("png")) return "png"
  if (contentType.includes("webp")) return "webp"
  return "jpg"
}

/**
 * Prefers a real, paid AI-generated photo when configured, but falls back
 * to the free Pexels provider if that fails for any reason (no credits,
 * transient error, etc.) instead of giving up — and vice versa if only
 * Pexels is configured.
 */
async function fetchImage(
  recipe: Tables<"recipes">,
): Promise<{ base64: string; contentType: string }> {
  const errors: unknown[] = []

  if (process.env.OPENAI_API_KEY) {
    try {
      return await generateRecipeImage(
        recipe.title,
        recipe.description,
        parseStringArray(recipe.ingredients),
      )
    } catch (error) {
      errors.push(error)
    }
  }

  if (process.env.PEXELS_API_KEY) {
    try {
      return await fetchRecipeStockPhoto(recipe.title, recipe.category)
    } catch (error) {
      errors.push(error)
    }
  }

  if (errors.length) {
    throw new AggregateError(errors, "All configured image providers failed.")
  }
  throw new Error("No image provider configured (set OPENAI_API_KEY or PEXELS_API_KEY).")
}

/**
 * Returns the recipe's photo URL, fetching and caching it via an image
 * provider + Supabase Storage exactly once if it doesn't exist yet. Never
 * throws — on any failure it logs server-side and returns null so callers
 * can fall back to the illustrated placeholder instead of breaking the page.
 */
export async function ensureRecipeImage(recipe: Tables<"recipes">): Promise<string | null> {
  if (recipe.image_url) {
    return recipe.image_url
  }

  try {
    const service = createServiceClient()
    const { base64, contentType } = await fetchImage(recipe)

    const path = `${recipe.id}.${extensionFor(contentType)}`
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
    console.error(`[recipe-images] Failed to fetch image for recipe ${recipe.id}:`, error)
    return null
  }
}
