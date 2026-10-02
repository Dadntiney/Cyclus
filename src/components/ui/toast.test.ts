import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { TOAST_ACTION_MIN_MS, TOAST_DEFAULT_MS, TOAST_EXIT_MS, createToastStore } from "./toast"

const timers = {
  set: (fn: () => void, ms: number) => setTimeout(fn, ms),
  clear: (handle: unknown) => clearTimeout(handle as ReturnType<typeof setTimeout>),
  now: () => Date.now(),
}

describe("toast store", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it("shows for 4s, then fades out and is removed", () => {
    const store = createToastStore(timers)
    store.show({ title: "Opgeslagen" })
    expect(store.get()).toMatchObject({ title: "Opgeslagen", leaving: false, duration: TOAST_DEFAULT_MS })
    vi.advanceTimersByTime(TOAST_DEFAULT_MS - 1)
    expect(store.get()?.leaving).toBe(false)
    vi.advanceTimersByTime(1)
    expect(store.get()?.leaving).toBe(true)
    vi.advanceTimersByTime(TOAST_EXIT_MS)
    expect(store.get()).toBeNull()
  })

  it("accepts `message` as an alias of `title`", () => {
    const store = createToastStore(timers)
    store.show({ message: "Bewaard in Favorieten" })
    expect(store.get()?.title).toBe("Bewaard in Favorieten")
  })

  it("keeps a toast with an action for at least 6s (besluit 24)", () => {
    const store = createToastStore(timers)
    store.show({ title: "Verwijderd", duration: 2000, action: { label: "Ongedaan maken", onClick: () => {} } })
    expect(store.get()?.duration).toBe(TOAST_ACTION_MIN_MS)
    vi.advanceTimersByTime(TOAST_ACTION_MIN_MS - 1)
    expect(store.get()?.leaving).toBe(false)
    vi.advanceTimersByTime(1)
    expect(store.get()?.leaving).toBe(true)
  })

  it("pauses on hover/focus and resumes with the time that was left", () => {
    const store = createToastStore(timers)
    store.show({ title: "Bewaard", action: { label: "Bekijk", href: "/favorieten" } })
    vi.advanceTimersByTime(5000)
    store.pause("hover")
    store.pause("focus")
    vi.advanceTimersByTime(60_000)
    expect(store.get()?.leaving).toBe(false)
    store.resume("hover")
    // Still focused: stays paused.
    vi.advanceTimersByTime(60_000)
    expect(store.get()?.leaving).toBe(false)
    store.resume("focus")
    vi.advanceTimersByTime(999)
    expect(store.get()?.leaving).toBe(false)
    vi.advanceTimersByTime(1)
    expect(store.get()?.leaving).toBe(true)
  })

  it("a new toast replaces the current one and gets its own full time", () => {
    const store = createToastStore(timers)
    const first = store.show({ title: "Een" })
    vi.advanceTimersByTime(3000)
    const second = store.show({ title: "Twee" })
    expect(second).not.toBe(first)
    vi.advanceTimersByTime(3000)
    expect(store.get()).toMatchObject({ title: "Twee", leaving: false })
    vi.advanceTimersByTime(1000)
    expect(store.get()?.leaving).toBe(true)
  })

  it("dismiss fades out right away; a stale id does nothing", () => {
    const store = createToastStore(timers)
    const old = store.show({ title: "Een" })
    store.show({ title: "Twee" })
    store.dismiss(old)
    expect(store.get()).toMatchObject({ title: "Twee", leaving: false })
    store.dismiss()
    expect(store.get()?.leaving).toBe(true)
    vi.advanceTimersByTime(TOAST_EXIT_MS)
    expect(store.get()).toBeNull()
  })

  it("a new toast while the old one fades out shows normally", () => {
    const store = createToastStore(timers)
    store.show({ title: "Een" })
    store.dismiss()
    store.show({ title: "Twee" })
    vi.advanceTimersByTime(TOAST_EXIT_MS)
    expect(store.get()).toMatchObject({ title: "Twee", leaving: false })
  })

  it("notifies subscribers", () => {
    const store = createToastStore(timers)
    const listener = vi.fn()
    store.subscribe(listener)
    store.show({ title: "Een" })
    vi.advanceTimersByTime(TOAST_DEFAULT_MS + TOAST_EXIT_MS)
    // show, leaving, removed
    expect(listener).toHaveBeenCalledTimes(3)
  })
})
