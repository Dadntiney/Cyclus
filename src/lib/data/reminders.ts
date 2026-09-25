import { createClient } from "@/lib/supabase/server"

export async function getReminders(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", userId)
    .order("time", { ascending: true })
  return data ?? []
}
