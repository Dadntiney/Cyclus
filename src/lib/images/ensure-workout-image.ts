import "server-only"
import { createServiceClient } from "@/lib/supabase/service"
import { fetchWorkoutStockPhoto } from "@/lib/images/workout-pexels-provider"
import type { Tables } from "@/types/database"

const BUCKET = "workout-images"

function extensionFor(contentType: string): string {
  if (contentType.includes("png")) return "png"
  if (contentType.includes("webp")) return "webp"
  return "jpg"
}

/**
 * Returns the workout's photo URL, fetching and caching it via Pexels +
 * Supabase Storage exactly once if it doesn't exist yet. Mirrors
 * ensure-recipe-image.ts, but Pexels-only (no paid OpenAI generation):
 * generic exercise/yoga/running stock photography is plentiful and doesn't
 * need an exact-dish match the way food photography does, so there's no
 * good reason to pay per workout here. Never throws — on any failure it
 * logs server-side and returns null so callers fall back to the
 * illustrated placeholder instead of breaking the page.
 */
export async function ensureWorkoutImage(workout: Tables<"workouts">): Promise<string | null> {
  if (workout.image_url) {
    return workout.image_url
  }

  if (!process.env.PEXELS_API_KEY) {
    return null
  }

  try {
    const service = createServiceClient()
    const { base64, contentType } = await fetchWorkoutStockPhoto(workout.title, workout.type)

    const path = `${workout.id}.${extensionFor(contentType)}`
    const { error: uploadError } = await service.storage
      .from(BUCKET)
      .upload(path, Buffer.from(base64, "base64"), {
        contentType,
        upsert: true,
        cacheControl: "31536000",
      })
    if (uploadError) {
      throw uploadError
    }

    const { data: publicUrlData } = service.storage.from(BUCKET).getPublicUrl(path)
    const imageUrl = publicUrlData.publicUrl

    // Only persist if still empty, so a concurrent request that already
    // finished fetching doesn't get silently overwritten.
    const { data: updated, error: updateError } = await service
      .from("workouts")
      .update({ image_url: imageUrl })
      .eq("id", workout.id)
      .is("image_url", null)
      .select("image_url")
      .maybeSingle()
    if (updateError) {
      throw updateError
    }

    return updated?.image_url ?? imageUrl
  } catch (error) {
    console.error(`[workout-images] Failed to fetch image for workout ${workout.id}:`, error)
    return null
  }
}
