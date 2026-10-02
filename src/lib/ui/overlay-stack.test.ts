import { describe, expect, it, vi } from "vitest"
import { createOverlayStack, type OverlayEntry, type OverlayStackEnv } from "./overlay-stack"

/** In-memory environment that records what the stack does to the "DOM". */
function fakeEnv() {
  const state = {
    scrollLocked: 0,
    backgroundInert: 0,
    listeners: 0,
    inert: new Map<unknown, boolean>(),
    lastIsOverlayRoot: null as ((el: Element) => boolean) | null,
    keyHandler: null as ((e: KeyboardEvent) => void) | null,
  }
  const env: OverlayStackEnv = {
    lockScroll: vi.fn(() => {
      state.scrollLocked++
      return () => {
        state.scrollLocked--
      }
    }),
    inertBackground: vi.fn((isOverlayRoot) => {
      state.backgroundInert++
      state.lastIsOverlayRoot = isOverlayRoot
      return () => {
        state.backgroundInert--
      }
    }),
    listenKeys: vi.fn((handler) => {
      state.listeners++
      state.keyHandler = handler
      return () => {
        state.listeners--
        state.keyHandler = null
      }
    }),
    setInert: vi.fn((el, inert) => {
      state.inert.set(el, inert)
    }),
  }
  return { env, state }
}

function entry(name: string): OverlayEntry & { escapes: number; tabs: number } {
  const e = {
    root: { name } as unknown as HTMLElement,
    escapes: 0,
    tabs: 0,
    onEscape: () => {
      e.escapes++
    },
    onTab: () => {
      e.tabs++
    },
  }
  return e
}

function key(k: string, defaultPrevented = false) {
  return { key: k, defaultPrevented, preventDefault: vi.fn() }
}

describe("overlay stack", () => {
  it("applies scroll lock, inert and key listening once for the first overlay", () => {
    const { env, state } = fakeEnv()
    const stack = createOverlayStack(env)
    const a = entry("a")
    const release = stack.push(a)

    expect(stack.size()).toBe(1)
    expect(state.scrollLocked).toBe(1)
    expect(state.backgroundInert).toBe(1)
    expect(state.listeners).toBe(1)

    release()
    expect(stack.size()).toBe(0)
    expect(state.scrollLocked).toBe(0)
    expect(state.backgroundInert).toBe(0)
    expect(state.listeners).toBe(0)
  })

  it("ref-counts: a second overlay does not lock or inert the app twice", () => {
    const { env, state } = fakeEnv()
    const stack = createOverlayStack(env)
    const a = entry("a")
    const b = entry("b")
    const releaseA = stack.push(a)
    const releaseB = stack.push(b)

    expect(env.lockScroll).toHaveBeenCalledTimes(1)
    expect(env.inertBackground).toHaveBeenCalledTimes(1)
    expect(env.listenKeys).toHaveBeenCalledTimes(1)
    // the overlay underneath becomes inert while b is on top
    expect(state.inert.get(a.root)).toBe(true)

    releaseB()
    expect(state.scrollLocked).toBe(1)
    expect(state.backgroundInert).toBe(1)
    expect(state.inert.get(a.root)).toBe(false)

    releaseA()
    expect(state.scrollLocked).toBe(0)
    expect(state.backgroundInert).toBe(0)
    expect(state.listeners).toBe(0)
  })

  it("only releases the shared effects when the last overlay goes, in any order", () => {
    const { env, state } = fakeEnv()
    const stack = createOverlayStack(env)
    const a = entry("a")
    const b = entry("b")
    const releaseA = stack.push(a)
    const releaseB = stack.push(b)

    // the lower overlay unmounts first (e.g. its page navigated away)
    releaseA()
    expect(stack.size()).toBe(1)
    expect(stack.isTop(b)).toBe(true)
    expect(state.scrollLocked).toBe(1)
    expect(state.backgroundInert).toBe(1)
    // b stayed on top and was never made inert
    expect(state.inert.get(b.root)).toBeUndefined()

    releaseB()
    expect(state.scrollLocked).toBe(0)
    expect(state.backgroundInert).toBe(0)
  })

  it("release is idempotent and pushing the same entry twice is a no-op", () => {
    const { env, state } = fakeEnv()
    const stack = createOverlayStack(env)
    const a = entry("a")
    const release = stack.push(a)
    stack.push(a)
    expect(stack.size()).toBe(1)

    release()
    release()
    stack.remove(a)
    expect(stack.size()).toBe(0)
    expect(state.scrollLocked).toBe(0)
    expect(env.lockScroll).toHaveBeenCalledTimes(1)
  })

  it("routes Escape and Tab to the top overlay only", () => {
    const { env } = fakeEnv()
    const stack = createOverlayStack(env)
    const a = entry("a")
    const b = entry("b")
    stack.push(a)
    const releaseB = stack.push(b)

    const esc = key("Escape")
    stack.handleKey(esc)
    stack.handleKey(key("Tab"))
    expect(b.escapes).toBe(1)
    expect(b.tabs).toBe(1)
    expect(a.escapes).toBe(0)
    expect(a.tabs).toBe(0)
    expect(esc.preventDefault).toHaveBeenCalled()

    releaseB()
    stack.handleKey(key("Escape"))
    expect(a.escapes).toBe(1)
  })

  it("leaves an Escape that a control inside already handled alone", () => {
    const { env } = fakeEnv()
    const stack = createOverlayStack(env)
    const a = entry("a")
    stack.push(a)
    stack.handleKey(key("Escape", true))
    stack.handleKey({ ...key("Escape"), isComposing: true })
    expect(a.escapes).toBe(0)
  })

  it("ignores other keys and does nothing when empty", () => {
    const { env } = fakeEnv()
    const stack = createOverlayStack(env)
    stack.handleKey(key("Escape"))
    const a = entry("a")
    stack.push(a)
    stack.handleKey(key("Enter"))
    stack.handleKey(key("ArrowDown"))
    expect(a.escapes).toBe(0)
    expect(a.tabs).toBe(0)
  })

  it("tells the inert fallback which elements are overlay roots", () => {
    const { env, state } = fakeEnv()
    const stack = createOverlayStack(env)
    const a = entry("a")
    stack.push(a)
    const isOverlayRoot = state.lastIsOverlayRoot!
    expect(isOverlayRoot(a.root as unknown as Element)).toBe(true)
    expect(isOverlayRoot({} as Element)).toBe(false)
  })

  it("starts fresh after the stack was emptied", () => {
    const { env, state } = fakeEnv()
    const stack = createOverlayStack(env)
    stack.push(entry("a"))()
    const releaseB = stack.push(entry("b"))
    expect(env.lockScroll).toHaveBeenCalledTimes(2)
    expect(state.scrollLocked).toBe(1)
    releaseB()
    expect(state.scrollLocked).toBe(0)
  })
})
