import { createClient } from "@/lib/supabase/server"
import { getActiveConversation } from "@/lib/data/buddy"
import { ChatWindow } from "@/components/buddy/chat-window"

export default async function BuddyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { conversationId, messages } = await getActiveConversation(user.id)

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-full">
      <div className="px-5 lg:px-8 pt-6 lg:pt-10 pb-2">
        <h1 className="font-display text-2xl lg:text-3xl text-ink">Buddy</h1>
        <p className="text-sm text-ink-soft mt-1">
          Geen diagnoses, geen paniek — wel een luisterend oor. Bij ernstige klachten raden we
          altijd aan een zorgprofessional te raadplegen.
        </p>
      </div>
      <ChatWindow initialConversationId={conversationId} initialMessages={messages} />
    </div>
  )
}
