import { getAuthedUser } from "@/lib/supabase/server"
import { getActiveConversation } from "@/lib/data/buddy"
import { getProfile } from "@/lib/data/profile"
import { ChatWindow } from "@/components/buddy/chat-window"
import { BuddyMark } from "@/components/buddy/buddy-mark"
import { BuddyShell } from "@/components/buddy/buddy-shell"
import { BuddyAiConsentCard } from "@/components/buddy/buddy-ai-consent-card"
import { isBuddyAiConfigured } from "@/lib/buddy"

export default async function BuddyPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const [{ conversationId, messages }, profile] = await Promise.all([
    getActiveConversation(user.id),
    getProfile(user.id),
  ])

  const needsAiConsent = isBuddyAiConfigured() && !profile?.buddy_ai_consent_at

  return (
    <BuddyShell>
      <div className="px-5 lg:px-8 pt-3 lg:pt-8 pb-2.5 shrink-0 border-b border-line bg-cream">
        <div className="flex items-center gap-2.5">
          <BuddyMark size="md" />
          <h1 className="font-display text-2xl lg:text-4xl text-ink">Buddy</h1>
        </div>
        {/* Hidden while typing so the conversation keeps the room. */}
        <p className="text-xs lg:text-sm text-ink-soft mt-1.5 leading-relaxed group-data-[keyboard=open]/buddy:hidden">
          Geen diagnoses, wel een luisterend oor. Bij ernstige klachten: neem contact op met
          je huisarts.
        </p>
      </div>
      {needsAiConsent && <BuddyAiConsentCard />}
      <ChatWindow initialConversationId={conversationId} initialMessages={messages} />
    </BuddyShell>
  )
}
