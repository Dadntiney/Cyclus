import type { CSSProperties } from "react"
import { getAuthedUser } from "@/lib/supabase/server"
import { getActiveConversation } from "@/lib/data/buddy"
import { ChatWindow } from "@/components/buddy/chat-window"

// Exact fit between MobileHeader and BottomNav on mobile — not a guessed
// pixel constant (that already drifted out of sync once before, when
// MobileHeader's own padding changed and this didn't get updated with it).
// Mirrors their real rendered height: header = its top safe-area padding +
// 44px avatar + 16px bottom padding + 1px border; nav = 52px link
// (min-h-[52px]) + 1px border + its own bottom safe-area. Set as a CSS
// variable (not a direct inline `height`) so the md:h-[...] Tailwind class
// below can still override it on desktop — an inline style property
// always wins over a class for that same property, variable custom
// properties don't have that problem.
const mobileChatHeightStyle = {
  "--buddy-chat-h": "calc(100dvh - max(1rem, env(safe-area-inset-top)) - env(safe-area-inset-bottom) - 114px)",
} as CSSProperties

export default async function BuddyPage() {
  const user = await getAuthedUser()
  if (!user) return null

  const { conversationId, messages } = await getActiveConversation(user.id)

  return (
    <div
      className="w-full max-w-3xl mx-auto flex flex-col -mb-24 md:mb-0 h-[var(--buddy-chat-h)] md:h-[calc(100dvh-40px)]"
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
