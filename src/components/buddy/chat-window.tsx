"use client"

import { useRef, useState, useTransition, type FormEvent } from "react"
import { Send } from "lucide-react"
import { sendBuddyMessage } from "@/lib/actions/buddy"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
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

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    })
  }

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
    scrollToBottom()

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
        scrollToBottom()
      }
    })
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-8.5rem)] md:h-[calc(100dvh-3rem)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 lg:px-8 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center text-sm text-ink-soft py-10">
            Stel een vraag of vertel hoe je je vandaag voelt. Je Buddy denkt mee op basis van
            je profiel en check-ins.
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
                m.role === "user"
                  ? "bg-sage-dark text-white rounded-br-md"
                  : "bg-white border border-line text-ink rounded-bl-md",
              )}
            >
              {m.message}
            </div>
          </div>
        ))}
        {isPending && (
          <div className="flex justify-start">
            <div className="bg-white border border-line rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-ink-soft">
              Aan het typen...
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-danger px-5 pb-1">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-5 lg:px-8 py-3 border-t border-line bg-white"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Typ een bericht..."
          aria-label="Typ een bericht aan je Buddy"
          className="rounded-full min-h-11"
        />
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          aria-label="Verstuur bericht"
          className={cn(
            "h-11 w-11 shrink-0 rounded-full bg-sage-dark text-white flex items-center justify-center",
            "transition-[background-color,transform] duration-150 touch-manipulation motion-safe:active:scale-[0.94]",
            "hover:bg-sage-darker focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
            "disabled:opacity-50 disabled:pointer-events-none",
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
