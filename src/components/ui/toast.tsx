"use client"

import { useSyncExternalStore, type ReactNode } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { textActionClass } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * One toast host for the whole app (ontwerpvisie §5.7, besluit 24).
 *
 * ```ts
 * import { toast } from "@/components/ui/toast"
 * toast.show({ title: "Bewaard in Favorieten", action: { label: "Bekijk", href: "/favorieten" } })
 * toast.show({ title: "Notitie verwijderd", action: { label: "Ongedaan maken", onClick: undo } })
 * toast.show({ title: "Opgeslagen" })
 * ```
 *
 * - One at a time: a new toast replaces the current one.
 * - 4s by default; with an action at least 6s, and the timer pauses while
 *   the pointer is on it, it has focus, or the app is in the background.
 * - Announced politely (role=status); sits 12px above the tab bar (and any
 *   StickyActionBar), safe area included; rises in, fades out.
 * - Rendered in the top-level toast layer (#toast-layer), outside
 *   #app-root, so it stays readable and tappable while a sheet is open.
 *
 * `ActionToast` (ui/action-toast) stays for a tiny in-place "Bewaard ✓".
 */

export interface ToastAction {
  label: string
  /** Navigate on tap (e.g. "Bekijk" → /favorieten). */
  href?: string
  /** Or run this (e.g. "Ongedaan maken"). */
  onClick?: () => void
}

export interface ToastOptions {
  /** The message, one short sentence. */
  title?: string
  /** Alias of `title`. */
  message?: string
  action?: ToastAction
  /** Milliseconds on screen. Default 4000; with an action never under 6000. */
  duration?: number
}

export interface ToastItem {
  id: string
  title: string
  action?: ToastAction
  duration: number
  /** Fading out (exit animation) before it is removed. */
  leaving: boolean
}

export const TOAST_DEFAULT_MS = 4000
export const TOAST_ACTION_MIN_MS = 6000
/** Matches --duration-exit. */
export const TOAST_EXIT_MS = 180

type PauseReason = "hover" | "focus" | "hidden"

interface Timers {
  set(fn: () => void, ms: number): unknown
  clear(handle: unknown): void
  now(): number
}

const realTimers: Timers = {
  set: (fn, ms) => setTimeout(fn, ms),
  clear: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
  now: () => Date.now(),
}

/** The toast state machine, separate from React and the DOM (unit-tested). */
export function createToastStore(timers: Timers = realTimers) {
  let current: ToastItem | null = null
  let timer: unknown = null
  let remaining = 0
  let startedAt = 0
  let seq = 0
  const paused = new Set<PauseReason>()
  const listeners = new Set<() => void>()

  const emit = () => listeners.forEach((l) => l())

  function clearTimer() {
    if (timer !== null) timers.clear(timer)
    timer = null
  }

  function run() {
    clearTimer()
    if (!current || current.leaving || paused.size > 0) return
    startedAt = timers.now()
    const id = current.id
    timer = timers.set(() => leave(id), remaining)
  }

  function leave(id: string) {
    if (!current || current.id !== id || current.leaving) return
    clearTimer()
    current = { ...current, leaving: true }
    emit()
    timer = timers.set(() => {
      if (current?.id === id) {
        current = null
        timer = null
        emit()
      }
    }, TOAST_EXIT_MS)
  }

  return {
    show(options: ToastOptions): string {
      const title = (options.title ?? options.message ?? "").trim()
      const requested = options.duration ?? TOAST_DEFAULT_MS
      const duration = options.action ? Math.max(requested, TOAST_ACTION_MIN_MS) : requested
      const id = `toast-${++seq}`
      clearTimer()
      // A new toast is not paused by the pointer/focus on the old one.
      paused.delete("hover")
      paused.delete("focus")
      current = { id, title, action: options.action, duration, leaving: false }
      remaining = duration
      run()
      emit()
      return id
    },
    /** Fade out the toast (or only `id`, if it is still the current one). */
    dismiss(id?: string) {
      if (!current || (id && current.id !== id)) return
      paused.clear()
      leave(current.id)
    },
    pause(reason: PauseReason) {
      if (paused.has(reason)) return
      const wasRunning = paused.size === 0 && timer !== null && !!current && !current.leaving
      paused.add(reason)
      if (wasRunning) {
        remaining = Math.max(0, remaining - (timers.now() - startedAt))
        clearTimer()
      }
    },
    resume(reason: PauseReason) {
      if (!paused.delete(reason)) return
      if (paused.size === 0) run()
    },
    get: (): ToastItem | null => current,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

const store = createToastStore()

/** Show a toast from anywhere on the client: `toast.show({ title, action?, duration? })`. */
export const toast = {
  show: (options: ToastOptions) => store.show(options),
  dismiss: (id?: string) => store.dismiss(id),
}

const TOAST_LAYER_ID = "toast-layer"

function noopSubscribe() {
  return () => {}
}

/** The top-level layer element (rendered by the root layout), client only. */
function useToastLayerElement(): HTMLElement | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => document.getElementById(TOAST_LAYER_ID) ?? document.body,
    () => null,
  )
}

/**
 * Render `children` in the top-level toast layer, outside #app-root — for
 * other floating feedback (autosave pill, reminder toasts) so it is never
 * trapped by a page transition or made inert by an open sheet (besluit 10).
 */
export function ToastLayer({ children }: { children: ReactNode }) {
  const layer = useToastLayerElement()
  return layer ? createPortal(children, layer) : null
}

let visibilityAttached = false
function attachVisibility() {
  if (visibilityAttached || typeof document === "undefined") return
  visibilityAttached = true
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) store.pause("hidden")
    else store.resume("hidden")
  })
}

function subscribeToasts(listener: () => void) {
  attachVisibility()
  return store.subscribe(listener)
}

function getServerToast(): ToastItem | null {
  return null
}

/** Mount once (root layout). The live region exists before any toast does. */
export function ToastHost() {
  const item = useSyncExternalStore(subscribeToasts, store.get, getServerToast)
  const layer = useToastLayerElement()
  if (!layer) return null

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-toast-region=""
      className="pointer-events-none fixed inset-x-0 z-60 flex justify-center px-5"
    >
      {item && (
        <div
          key={item.id}
          onPointerEnter={() => store.pause("hover")}
          onPointerLeave={() => store.resume("hover")}
          onFocus={() => store.pause("focus")}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) store.resume("focus")
          }}
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-card bg-surface-elevated px-4 py-3 text-sm text-ink shadow-elevated",
            item.leaving ? "animate-fade-out" : "animate-rise-in",
          )}
        >
          <p className="min-w-0 flex-1">{item.title}</p>
          {item.action &&
            (item.action.href ? (
              <Link
                href={item.action.href}
                onClick={() => {
                  item.action?.onClick?.()
                  store.dismiss(item.id)
                }}
                className={textActionClass("-my-2 shrink-0 px-1")}
              >
                {item.action.label}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  item.action?.onClick?.()
                  store.dismiss(item.id)
                }}
                className={textActionClass("-my-2 shrink-0 px-1")}
              >
                {item.action.label}
              </button>
            ))}
        </div>
      )}
    </div>,
    layer,
  )
}
