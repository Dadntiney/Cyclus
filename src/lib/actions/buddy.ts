"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { buildBuddyContext } from "@/lib/buddy/context"
import { getBuddyProvider } from "@/lib/buddy"
import type { BuddyChatMessage } from "@/lib/buddy/types"

const MAX_MESSAGE_LENGTH = 4000
/** Most recent messages sent along as conversation memory. */
const HISTORY_WINDOW = 20
/** Fair-use cap on her own messages per rolling 24 hours. */
const DAILY_MESSAGE_LIMIT = 60

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

  // Fair-use cap: each AI reply has a real cost, so a runaway client (or a
  // script with her session) can't send unlimited messages.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const { count: sentToday } = await supabase
    .from("buddy_messages")
    .select("id, buddy_conversations!inner(user_id)", { count: "exact", head: true })
    .eq("buddy_conversations.user_id", user.id)
    .eq("role", "user")
    .gte("created_at", since.toISOString())
  if ((sentToday ?? 0) >= DAILY_MESSAGE_LIMIT) {
    return {
      error: "Je hebt het afgelopen etmaal al veel met de Buddy gepraat. Straks kun je weer verder. 💛",
    }
  }

  // History BEFORE inserting the new message: the newest messages (not the
  // oldest), so long conversations keep their recent context, and the new
  // message is passed separately exactly once.
  const { data: historyRows } = await supabase
    .from("buddy_messages")
    .select("role, message")
    .eq("conversation_id", activeConversationId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_WINDOW)

  const history: BuddyChatMessage[] = (historyRows ?? [])
    .reverse()
    .map((row) => ({
      role: row.role as BuddyChatMessage["role"],
      message: row.message,
    }))

  const { error: insertUserError } = await supabase.from("buddy_messages").insert({
    conversation_id: activeConversationId,
    role: "user",
    message: trimmed,
  })
  if (insertUserError) return { error: "Versturen is niet gelukt." }

  const contextLines = await buildBuddyContext(user.id)

  const { data: profile } = await supabase
    .from("profiles")
    .select("buddy_ai_consent_at")
    .eq("id", user.id)
    .maybeSingle()

  const allowAi = Boolean(profile?.buddy_ai_consent_at)
  const provider = getBuddyProvider({ allowAi })

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
