import type { Metadata } from "next"
import { getAuthedUser } from "@/lib/supabase/server"
import { getActiveConversation } from "@/lib/data/buddy"
import { getProfile } from "@/lib/data/profile"
import { ChatWindow } from "@/components/buddy/chat-window"
import { BuddyHeader } from "@/components/buddy/buddy-header"
import { BuddyShell } from "@/components/buddy/buddy-shell"
import { isBuddyAiConfigured } from "@/lib/buddy"
import { todayISO } from "@/lib/dates/amsterdam"
import { FEATURES } from "@/lib/navigation/features"

export const metadata: Metadata = { title: FEATURES.buddy.label }

/**
 * Buddy: the one screen without a PageHeader (DESIGN_SYSTEM §12.4). The
 * app bar carries the title and ⓘ; the conversation gets the rest of the
 * height (BuddyShell). The disclaimer and the AI question live in the
 * conversation itself.
 */
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
      <BuddyHeader />
      <ChatWindow
        initialConversationId={conversationId}
        initialMessages={messages}
        today={todayISO()}
        offerAi={needsAiConsent}
      />
    </BuddyShell>
  )
}
