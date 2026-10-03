"use client"

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  type FormEvent,
  type KeyboardEvent,
} from "react"
import { Send } from "lucide-react"
import { sendBuddyMessage } from "@/lib/actions/buddy"
import { cn } from "@/lib/utils"
import { ICON } from "@/lib/ui/icon"
import { prefersReducedMotion } from "@/lib/ui/focus"
import { todayISO } from "@/lib/dates/amsterdam"
import { Textarea } from "@/components/ui/input"
import { Chip } from "@/components/ui/chip"
import { textActionClass } from "@/components/ui/button"
import { BuddyAiConsentCard } from "@/components/buddy/buddy-ai-consent-card"
import { BuddyRow, SpeakerLabel, bubbleClass } from "@/components/buddy/bubble"
import { BUDDY_DISCLAIMER, BUDDY_GREETING, STARTER_QUESTIONS } from "@/components/buddy/copy"
import { buildThread } from "@/components/buddy/thread"
import type { Tables } from "@/types/database"
import { OFFLINE_ACTION_MESSAGE, runAction } from "@/lib/client/run-action"

type Message = Tables<"buddy_messages">

/**
 * A bubble that did not reach Buddy (BUD-3):
 * - "retry": she was offline when she sent it, so it can never have been
 *   saved and "Opnieuw proberen" cannot create a double message (besluit 34);
 * - "kept": another error while a new draft sits in the composer; the
 *   bubble stays so neither text is lost.
 */
type FailedState = "retry" | "kept"

let localIdCounter = 0

/** Composer grows with her message up to this many px, then scrolls. */
const COMPOSER_MAX_HEIGHT = 140
/** Within this distance of the end, the thread counts as "at the bottom". */
const BOTTOM_SLACK = 80

function subscribeNever() {
  return () => {}
}

/** Gap above a bubble: tight within a run, roomier between runs. */
function gapAbove(groupStart: boolean, afterDay: boolean) {
  if (afterDay) return "mt-2"
  return groupStart ? "mt-3" : "mt-1"
}

export function ChatWindow({
  initialConversationId,
  initialMessages,
  today,
  offerAi = false,
}: {
  initialConversationId: string | null
  initialMessages: Message[]
  /** Amsterdam calendar day of the server render (`yyyy-MM-dd`): same day labels on server and client. */
  today: string
  /** Show Buddy's AI question in the conversation (AI configured, no consent yet). */
  offerAi?: boolean
}) {
  const [conversationId, setConversationId] = useState(initialConversationId)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [failed, setFailed] = useState<ReadonlyMap<string, FailedState>>(() => new Map())
  const [input, setInput] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const didMountScroll = useRef(false)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  // Whether she is reading the newest messages — then a shrinking view
  // (soft keyboard opening) keeps the newest message in sight instead of
  // hiding it under the composer. On a first run there is nothing to pin
  // yet: the greeting stays in view from the top (BUD-2) until she sends.
  const atBottom = useRef(initialMessages.length > 0)

  // The server's day while hydrating (identical markup), the device's own
  // day after that — so "Vandaag" stays right when the chat is open past
  // midnight.
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  )
  const currentDay = hydrated ? todayISO() : today

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

  function scrollToBottom(requested: ScrollBehavior = "smooth") {
    // No glide to the newest message when she prefers less motion.
    const behavior: ScrollBehavior = prefersReducedMotion() ? "instant" : requested
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
      // First run (no history): she reads the greeting from the top, so
      // nothing is scrolled away (BUD-2).
      if (messages.length > 0) scrollToBottom("instant")
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

  function markFailed(id: string, state: FailedState | null) {
    setFailed((prev) => {
      const next = new Map(prev)
      if (state) next.set(id, state)
      else next.delete(id)
      return next
    })
  }

  function send(text: string) {
    setError(null)
    const optimisticMessage: Message = {
      id: `local-${localIdCounter++}`,
      conversation_id: conversationId ?? "pending",
      role: "user",
      message: text,
      created_at: new Date().toISOString(),
    }
    atBottom.current = true
    setMessages((prev) => [...prev, optimisticMessage])
    // Offline before sending: the request cannot leave the device, so the
    // message is certainly not saved and may be sent again safely.
    const offlineAtSend = typeof navigator !== "undefined" && navigator.onLine === false

    startTransition(async () => {
      const result = await runAction(() => sendBuddyMessage(conversationId, text))
      if (result.error) {
        if (offlineAtSend && result.error === OFFLINE_ACTION_MESSAGE) {
          markFailed(optimisticMessage.id, "retry")
          return
        }
        setError(result.error)
        if (composerRef.current?.value.trim()) {
          // She is already typing something new: keep that draft and
          // leave this text visible in its bubble.
          markFailed(optimisticMessage.id, "kept")
          return
        }
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id))
        setInput(text)
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

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isPending) return
    setInput("")
    send(trimmed)
  }

  /** Sends a bubble that failed while offline again — as is, the composer stays as it is. */
  function retry(failedMessage: Message) {
    if (isPending) return
    // The button disappears with its bubble: keep keyboard focus in the
    // conversation instead of dropping it to the top of the page. Not the
    // composer — that would open the soft keyboard.
    scrollRef.current?.focus({ preventScroll: true })
    markFailed(failedMessage.id, null)
    setMessages((prev) => prev.filter((m) => m.id !== failedMessage.id))
    send(failedMessage.message)
  }

  // Only when the conversation changes — not on every keystroke in the
  // composer (each message's day goes through Intl).
  const thread = useMemo(
    () => buildThread(messages, currentDay, (m) => failed.has(m.id)),
    [messages, currentDay, failed],
  )
  const firstRun = messages.length === 0

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="Gesprek met je Buddy"
        tabIndex={0}
        // The focus outline sits inside the scroller (besluit 15).
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 lg:px-8 py-4 flex flex-col -outline-offset-2"
      >
        {/* mt-auto: a short conversation sits just above the composer, a
            long one scrolls normally (unlike justify-end, the top stays
            reachable). */}
        <div className="mt-auto flex flex-col">
          {/* The disclaimer opens every conversation and scrolls with it. */}
          <p className="px-4 pb-1 text-center text-xs text-ink-soft">{BUDDY_DISCLAIMER}</p>

          {/* Before the greeting on a first run there is no run break, so
              the avatar goes to the greeting. */}
          {offerAi && <BuddyAiConsentCard avatar={!firstRun} className="mt-3" />}

          {thread.map((item, index) => {
            if (item.kind === "day") {
              return (
                <h2 key={item.key} className="pt-4 pb-1 text-center text-xs text-ink-soft">
                  {item.label}
                </h2>
              )
            }
            const m = item.message
            const afterDay = thread[index - 1]?.kind === "day"
            const state = failed.get(m.id)
            const spacing = gapAbove(item.groupStart, afterDay)

            if (m.role === "user") {
              return (
                <Fragment key={item.key}>
                  <div className={cn("flex justify-end", spacing)}>
                    <div className={bubbleClass({ from: "user", tail: item.groupEnd })}>
                      <SpeakerLabel from="user" />
                      {m.message}
                    </div>
                  </div>
                  {/* Read out through the log's live region. */}
                  {state === "retry" && (
                    <p className="mt-1 flex flex-wrap items-center justify-end gap-x-1 text-xs text-ink-soft">
                      <span>Niet verstuurd ·</span>
                      <button
                        type="button"
                        onClick={() => retry(m)}
                        disabled={isPending}
                        className={textActionClass("text-xs disabled:opacity-50")}
                      >
                        Opnieuw proberen
                      </button>
                    </p>
                  )}
                  {state === "kept" && (
                    <p className="mt-1 text-right text-xs text-ink-soft">Niet verstuurd</p>
                  )}
                </Fragment>
              )
            }

            return (
              <BuddyRow key={item.key} avatar={item.groupEnd} className={spacing}>
                <div className={bubbleClass({ from: "buddy", tail: item.groupEnd })}>
                  <SpeakerLabel from="buddy" />
                  {m.message}
                </div>
              </BuddyRow>
            )
          })}

          {isPending && (
            <BuddyRow avatar className="mt-3">
              <div className={bubbleClass({ from: "buddy", tail: true, className: "flex items-center gap-1.5 py-4" })}>
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
            </BuddyRow>
          )}

          {firstRun && (
            <>
              <BuddyRow avatar className="mt-3">
                <div className={bubbleClass({ from: "buddy", tail: true })}>
                  <SpeakerLabel from="buddy" />
                  {BUDDY_GREETING}
                </div>
              </BuddyRow>
              {/* Starting points — they only fill the input; she decides to send. */}
              <div role="group" aria-label="Voorbeeldvragen" className="mt-3 flex flex-col items-end gap-2">
                {STARTER_QUESTIONS.map((q) => (
                  <Chip
                    key={q}
                    onClick={() => {
                      setInput(q)
                      composerRef.current?.focus()
                    }}
                    className="max-w-full text-left"
                  >
                    {q}
                  </Chip>
                ))}
              </div>
            </>
          )}
        </div>
        <div ref={bottomRef} className="h-px w-full shrink-0" aria-hidden />
      </div>

      {error && (
        <p role="alert" className="shrink-0 px-5 pb-1 text-sm text-danger">
          {error}
        </p>
      )}

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
        {/* Disabled is neutral (cream-soft, ink-soft), never a washed-out
            green (BUD-4). No scale on press (besluit 34). */}
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          aria-label="Verstuur bericht"
          className={cn(
            "h-12 w-12 shrink-0 rounded-full border border-transparent bg-sage-fill text-white flex items-center justify-center",
            "transition-[background-color,border-color,color] duration-fast ease-standard motion-reduce:transition-none touch-manipulation",
            "hover:bg-sage-fill-darker",
            "disabled:bg-cream-soft disabled:border-line disabled:text-ink-soft disabled:pointer-events-none",
          )}
        >
          <Send {...ICON.md} aria-hidden />
        </button>
      </form>
    </div>
  )
}
