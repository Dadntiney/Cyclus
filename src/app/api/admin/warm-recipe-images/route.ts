import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ensureRecipeImage } from "@/lib/images/ensure-recipe-image"

export const maxDuration = 60

/**
 * One-off warm-up: fetches/caches a photo for every recipe that doesn't
 * have one yet, in parallel, so the whole Voeding section shows photos
 * immediately instead of only after each recipe's first visit. Safe to
 * call repeatedly — recipes that already have image_url are skipped.
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 })
  }

  const { data: recipes } = await supabase.from("recipes").select("*")
  const pending = (recipes ?? []).filter((r) => !r.image_url)

  const results = await Promise.all(
    pending.map(async (recipe) => ({
      title: recipe.title,
      imageUrl: await ensureRecipeImage(recipe),
    })),
  )

  return NextResponse.json({
    total: recipes?.length ?? 0,
    alreadyDone: (recipes?.length ?? 0) - pending.length,
    processed: results.length,
    succeeded: results.filter((r) => r.imageUrl).length,
    failed: results.filter((r) => !r.imageUrl).map((r) => r.title),
  })
}
