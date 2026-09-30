import { getAuthedUser } from "@/lib/supabase/server"
import { getActiveConversation } from "@/lib/data/buddy"
import { ChatWindow } from "@/components/buddy/chat-window"
import { BuddyMark } from "@/components/buddy/buddy-mark"
import { BuddyShell } from "@/components/buddy/buddy-shell"

export default async function BuddyPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const { conversationId, messages } = await getActiveConversation(user.id)

  return (
    <BuddyShell>
      <div className="px-5 lg:px-8 pt-4 lg:pt-8 pb-2 shrink-0 border-b border-sage/10 bg-cream">
        <div className="flex items-center gap-2.5 mb-1">
          <BuddyMark size="md" />
          <h1 className="font-display text-2xl lg:text-3xl text-ink">Buddy</h1>
        </div>
        <p className="text-sm text-ink-soft mt-1">
          Geen diagnoses, geen paniek — wel een luisterend oor. Bij ernstige klachten raden we
          altijd aan een zorgprofessional te raadplegen.
        </p>
      </div>
      <ChatWindow initialConversationId={conversationId} initialMessages={messages} />
    </BuddyShell>
  )
}
