import { createClient } from "@/lib/supabase/server"

export async function getActiveConversation(userId: string) {
  const supabase = await createClient()

  const { data: conversation } = await supabase
    .from("buddy_conversations")
    .select("id")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!conversation) {
    return { conversationId: null, messages: [] }
  }

  const { data: messages } = await supabase
    .from("buddy_messages")
    .select("*")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true })

  return { conversationId: conversation.id, messages: messages ?? [] }
}
