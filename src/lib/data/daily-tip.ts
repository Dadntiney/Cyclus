import { createClient } from "@/lib/supabase/server"

function seededIndex(seed: string, length: number): number {
  if (length <= 0) return 0
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % length
}

/** Same tip for everyone on a given day, rotating deterministically. */
export async function getDailyTip(today: string) {
  const supabase = await createClient()
  const { data: tips } = await supabase.from("daily_tips").select("*").order("created_at")
  if (!tips || !tips.length) return null
  return tips[seededIndex(today, tips.length)]
}
