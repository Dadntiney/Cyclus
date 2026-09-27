import { createClient } from "@/lib/supabase/server"

export async function listDiaryEntries(userId: string, limit = 40) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit)
  return data ?? []
}
