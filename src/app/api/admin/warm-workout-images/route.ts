import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ensureWorkoutImage } from "@/lib/images/ensure-workout-image"

export const maxDuration = 60

/**
 * One-off warm-up: fetches/caches a photo for every workout that doesn't
 * have one yet, in parallel. Mirrors /api/admin/warm-recipe-images — see
 * that route's comment for why this is gated by ADMIN_TASK_SECRET rather
 * than open to any signed-in user.
 */
export async function GET(request: NextRequest) {
  const adminSecret = process.env.ADMIN_TASK_SECRET
  if (!adminSecret || request.headers.get("x-admin-secret") !== adminSecret) {
    return NextResponse.json({ error: "Niet toegestaan." }, { status: 403 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 })
  }

  const { data: workouts } = await supabase.from("workouts").select("*")
  const pending = (workouts ?? []).filter((w) => !w.image_url)

  const results = await Promise.all(
    pending.map(async (workout) => ({
      title: workout.title,
      imageUrl: await ensureWorkoutImage(workout),
    })),
  )

  return NextResponse.json({
    total: workouts?.length ?? 0,
    alreadyDone: (workouts?.length ?? 0) - pending.length,
    processed: results.length,
    succeeded: results.filter((r) => r.imageUrl).length,
    failed: results.filter((r) => !r.imageUrl).map((r) => r.title),
  })
}
