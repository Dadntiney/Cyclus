"use client"

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type KeyboardEvent,
} from "react"
import { Send } from "lucide-react"
import { sendBuddyMessage } from "@/lib/actions/buddy"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { BuddyMark } from "@/components/buddy/buddy-mark"
import type { Tables } from "@/types/database"
import { runAction } from "@/lib/client/run-action"

type Message = Tables<"buddy_messages">

let localIdCounter = 0

/** Composer grows with her message up to this many px, then scrolls. */
const COMPOSER_MAX_HEIGHT = 140
/** Within this distance of the end, the thread counts as "at the bottom". */
const BOTTOM_SLACK = 80

const STARTER_QUESTIONS = [
  "Waarom slaap ik slechter rond mijn menstruatie?",
  "Wat kan ik doen als ik me deze week moe voel?",
  "Hoe weet ik of mijn klachten bij de overgang horen?",
] as const

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
  const composerRef = useRef<HTMLTextAreaElement>(null)
  // Whether she is reading the newest messages — then a shrinking view
  // (soft keyboard opening) keeps the newest message in sight instead of
  // hiding it under the composer.
  const atBottom = useRef(true)

  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) return
    const onScroll = () => {
      atBottom.current =
        scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < BOTTOM_SLACK
    }
    const observer = new ResizeObserver(() => {
      if (atBottom.current) scroller.scrollTop = scroller.scrollHeight
    })
    scroller.addEventListener("scroll", onScroll, { passive: true })
    observer.observe(scroller)
    return () => {
      scroller.removeEventListener("scroll", onScroll)
      observer.disconnect()
    }
  }, [])

  // Auto-grow the composer so a longer message stays readable while typing.
  useLayoutEffect(() => {
    const el = composerRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, COMPOSER_MAX_HEIGHT)}px`
    el.style.overflowY = el.scrollHeight > COMPOSER_MAX_HEIGHT ? "auto" : "hidden"
  }, [input])

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

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends (the keyboard shows "verstuur"); Shift+Enter is a new line.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      e.currentTarget.form?.requestSubmit()
    }
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
    atBottom.current = true
    setMessages((prev) => [...prev, optimisticMessage])
    setInput("")

    startTransition(async () => {
      const result = await runAction(() => sendBuddyMessage(conversationId, trimmed))
      if (result.error) {
        setError(result.error)
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id))
        setInput(trimmed)
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
        role="log"
        aria-live="polite"
        aria-label="Gesprek met je Buddy"
        tabIndex={0}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 lg:px-8 py-4 flex flex-col gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sage/40"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center">
            <EmptyState
              icon={<BuddyMark size="lg" decorative />}
              title="Stel een vraag of vertel hoe je je voelt"
              description="Je Buddy denkt mee op basis van je profiel en check-ins."
            />
            {/* Starting points — they only fill the input; she decides to send. */}
            <div className="flex flex-col items-stretch gap-2 w-full max-w-sm -mt-4">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => {
                    setInput(q)
                    composerRef.current?.focus()
                  }}
                  className="text-left text-sm text-ink rounded-2xl bg-surface border border-line px-4 py-3 min-h-11 touch-manipulation transition-colors hover:border-ink/30 active:bg-cream-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
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
                "max-w-[82%] rounded-[1.25rem] px-4 py-3 text-base leading-relaxed whitespace-pre-wrap",
                m.role === "user"
                  ? "bg-sage-fill text-white rounded-br-md"
                  : "bg-surface border border-line text-ink rounded-bl-md",
              )}
            >
              {m.message}
            </div>
          </div>
        ))}
        {isPending && (
          <div className="flex justify-start items-end gap-2">
            <BuddyMark size="sm" className="mb-0.5" decorative />
            <div className="bg-surface border border-line rounded-[1.25rem] rounded-bl-md px-4 py-4 flex items-center gap-1.5">
              <span className="sr-only">Je Buddy schrijft een antwoord</span>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-ink-soft/60 motion-safe:animate-[typing-dot_1.2s_ease-in-out_infinite]"
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-px w-full shrink-0" aria-hidden />
      </div>

      {error && <p className="text-sm text-danger px-5 pb-1">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="shrink-0 flex items-end gap-2 py-3 border-t border-line bg-cream"
        style={{
          paddingLeft: "max(1.25rem, env(safe-area-inset-left))",
          paddingRight: "max(1.25rem, env(safe-area-inset-right))",
        }}
      >
        <Textarea
          ref={composerRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Typ een bericht…"
          aria-label="Typ een bericht aan je Buddy"
          maxLength={4000}
          enterKeyHint="send"
          autoComplete="off"
          autoCorrect="on"
          className="rounded-3xl min-h-12 py-3 leading-6 overscroll-contain"
        />
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          aria-label="Verstuur bericht"
          className={cn(
            "h-12 w-12 shrink-0 rounded-full bg-sage-fill text-white flex items-center justify-center",
            "transition-[background-color,transform] duration-150 touch-manipulation motion-safe:active:scale-[0.94]",
            "hover:bg-sage-fill-darker focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
            "disabled:opacity-50 disabled:pointer-events-none",
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
