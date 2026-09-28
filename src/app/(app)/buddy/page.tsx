import type { CSSProperties } from "react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getActiveConversation } from "@/lib/data/buddy"
import { ChatWindow } from "@/components/buddy/chat-window"

// Exact fit between MobileHeader and BottomNav on mobile. Rather than a
// hand-calculated pixel constant for their heights (that drifted out of
// sync twice already — a padding tweak or the nav's content simply being
// taller than its own min-height, and the input bar quietly disappears a
// few pixels behind the nav again), MobileHeader and BottomNav each
// publish their own real rendered height as a CSS variable via
// useMeasuredHeightVar, so this always matches what's actually on screen.
// The px fallbacks only cover the instant before that JS measurement runs.
// Set as a CSS variable (not a direct inline `height`) so the md:h-[...]
// Tailwind class below can still override it on desktop — an inline style
// property always wins over a class for that same property, variable
// custom properties don't have that problem.
const mobileChatHeightStyle = {
  "--buddy-chat-h": "calc(100dvh - var(--mobile-header-h, 77px) - var(--bottom-nav-h, 82px))",
} as CSSProperties

export default async function BuddyPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const { conversationId, messages } = await getActiveConversation(user.id)

  return (
    <div
      className="w-full max-w-3xl mx-auto flex flex-col h-[var(--buddy-chat-h)] md:h-[calc(100dvh-40px)]"
      style={mobileChatHeightStyle}
    >
      <div className="px-5 lg:px-8 pt-6 lg:pt-10 pb-2 shrink-0">
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
