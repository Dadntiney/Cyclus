"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { buildBuddyContext } from "@/lib/buddy/context"
import { getBuddyProvider } from "@/lib/buddy"
import type { BuddyChatMessage } from "@/lib/buddy/types"

const MAX_MESSAGE_LENGTH = 4000

export async function sendBuddyMessage(conversationId: string | null, message: string) {
  const trimmed = message.trim()
  if (!trimmed) return { error: "Typ eerst een bericht." }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { error: `Je bericht is te lang (max. ${MAX_MESSAGE_LENGTH} tekens). Kort het iets in.` }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Je bent niet ingelogd." }

  let activeConversationId = conversationId

  // Defense in depth: RLS already scopes buddy_conversations/buddy_messages
  // to their owner, but a client-supplied id is still worth verifying
  // explicitly here rather than relying entirely on that policy — a
  // conversation id that isn't hers is treated as absent, not an error.
  if (activeConversationId) {
    const { data: owned } = await supabase
      .from("buddy_conversations")
      .select("id")
      .eq("id", activeConversationId)
      .eq("user_id", user.id)
      .maybeSingle()
    if (!owned) activeConversationId = null
  }

  if (!activeConversationId) {
    const { data: conversation, error: createError } = await supabase
      .from("buddy_conversations")
      .insert({ user_id: user.id })
      .select("id")
      .single()
    if (createError || !conversation) return { error: "Gesprek starten is niet gelukt." }
    activeConversationId = conversation.id
  }

  const { error: insertUserError } = await supabase.from("buddy_messages").insert({
    conversation_id: activeConversationId,
    role: "user",
    message: trimmed,
  })
  if (insertUserError) return { error: "Versturen is niet gelukt." }

  const { data: historyRows } = await supabase
    .from("buddy_messages")
    .select("role, message")
    .eq("conversation_id", activeConversationId)
    .order("created_at", { ascending: true })
    .limit(30)

  const history: BuddyChatMessage[] = (historyRows ?? []).map((row) => ({
    role: row.role as BuddyChatMessage["role"],
    message: row.message,
  }))

  const contextLines = await buildBuddyContext(user.id)
  const provider = getBuddyProvider()

  let reply
  try {
    reply = await provider.generateReply(history, trimmed, contextLines)
  } catch {
    reply = {
      message:
        "Sorry, er ging iets mis bij het ophalen van een antwoord. Probeer het zo nog eens.",
      aiGenerated: false,
    }
  }

  const { error: insertReplyError } = await supabase.from("buddy_messages").insert({
    conversation_id: activeConversationId,
    role: "assistant",
    message: reply.message,
  })
  if (insertReplyError) return { error: "Antwoord opslaan is niet gelukt." }

  await supabase
    .from("buddy_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", activeConversationId)

  revalidatePath("/buddy")

  return { success: true, conversationId: activeConversationId, reply: reply.message }
}
