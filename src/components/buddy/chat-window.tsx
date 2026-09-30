"use client"

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react"
import { Send } from "lucide-react"
import { sendBuddyMessage } from "@/lib/actions/buddy"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { BuddyMark } from "@/components/buddy/buddy-mark"
import type { Tables } from "@/types/database"

type Message = Tables<"buddy_messages">

let localIdCounter = 0

export function ChatWindow({
  initialConversationId,
  initialMessages,
}: {
  initialConversationId: string | null
  initialMessages: Message[]
}) {
  const [conversationId, setConversationId] = useState(initialConversationId)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const didMountScroll = useRef(false)

  function scrollToBottom(behavior: ScrollBehavior = "smooth") {
    const run = () => {
      const scroller = scrollRef.current
      const anchor = bottomRef.current
      if (anchor) {
        anchor.scrollIntoView({ behavior, block: "end" })
      } else if (scroller) {
        scroller.scrollTo({ top: scroller.scrollHeight, behavior })
      }
    }
    // After React paints the new bubble (esp. long Buddy replies).
    requestAnimationFrame(() => {
      requestAnimationFrame(run)
    })
  }

  // Keep the latest message fully in view whenever the thread changes.
  useEffect(() => {
    if (!didMountScroll.current) {
      didMountScroll.current = true
      scrollToBottom("instant")
      return
    }
    scrollToBottom("smooth")
  }, [messages, isPending])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isPending) return

    setError(null)
    const optimisticMessage: Message = {
      id: `local-${localIdCounter++}`,
      conversation_id: conversationId ?? "pending",
      role: "user",
      message: trimmed,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMessage])
    setInput("")

    startTransition(async () => {
      const result = await sendBuddyMessage(conversationId, trimmed)
      if (result.error) {
        setError(result.error)
        return
      }
      if (result.conversationId) setConversationId(result.conversationId)
      if (result.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `local-${localIdCounter++}`,
            conversation_id: result.conversationId ?? "pending",
            role: "assistant",
            message: result.reply,
            created_at: new Date().toISOString(),
          },
        ])
      }
    })
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 lg:px-8 py-4 flex flex-col gap-3"
      >
        {messages.length === 0 && (
          <EmptyState
            icon={<BuddyMark size="lg" decorative />}
            title="Stel een vraag of vertel hoe je je voelt"
            description="Je Buddy denkt mee op basis van je profiel en check-ins."
          />
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex gap-2",
              m.role === "user" ? "justify-end" : "justify-start items-end",
            )}
          >
            {m.role === "assistant" && <BuddyMark size="sm" className="mb-0.5" decorative />}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
                m.role === "user"
                  ? "bg-sage-fill text-white rounded-br-md"
                  : "bg-sage-soft/60 text-ink rounded-bl-md",
              )}
            >
              {m.message}
            </div>
          </div>
        ))}
        {isPending && (
          <div className="flex justify-start items-end gap-2">
            <BuddyMark size="sm" className="mb-0.5" decorative />
            <div className="bg-sage-soft/60 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-ink-soft">
              Aan het typen...
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-px w-full shrink-0" aria-hidden />
      </div>

      {error && <p className="text-sm text-danger px-5 pb-1">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="shrink-0 flex items-center gap-2 py-3 border-t border-sage/20 bg-cream"
        style={{
          paddingLeft: "max(1.25rem, env(safe-area-inset-left))",
          paddingRight: "max(1.25rem, env(safe-area-inset-right))",
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Typ een bericht..."
          aria-label="Typ een bericht aan je Buddy"
          maxLength={4000}
          enterKeyHint="send"
          autoComplete="off"
          autoCorrect="on"
          className="rounded-full min-h-11"
        />
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          aria-label="Verstuur bericht"
          className={cn(
            "h-11 w-11 shrink-0 rounded-full bg-sage-fill text-white flex items-center justify-center",
            "transition-[background-color,transform] duration-150 touch-manipulation motion-safe:active:scale-[0.94]",
            "hover:bg-sage-fill-darker focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
            "disabled:opacity-50 disabled:pointer-events-none",
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
