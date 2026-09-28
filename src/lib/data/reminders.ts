import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

// Both the layout (for ReminderToastHost) and /profiel (for RemindersSection)
// need her reminders in the same request — cache() dedupes that to one query.
export const getReminders = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", userId)
    .order("time", { ascending: true })
  return data ?? []
})
