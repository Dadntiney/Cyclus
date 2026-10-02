import { afterEach, describe, expect, it, vi } from "vitest"

/**
 * The browser binding against a small fake of window.history / location /
 * sessionStorage: checks that wrapping pushState/replaceState and listening
 * to popstate classifies navigations correctly (besluit 7), also when
 * Next.js patches history on top of our wrapper.
 */

type Entry = { url: string; state: unknown }

function fakeWindow(startUrl: string, storage = new Map<string, string>()) {
  const base = "https://gofiev.test"
  const entries: Entry[] = [{ url: new URL(startUrl, base).href, state: null }]
  let index = 0
  const listeners = new Map<string, Array<() => void>>()
  const location = { pathname: "", search: "", hash: "", href: "" }
  const sync = () => {
    const u = new URL(entries[index].url)
    location.pathname = u.pathname
    location.search = u.search
    location.hash = u.hash
    location.href = u.href
  }
  sync()
  const fire = (type: string) => listeners.get(type)?.forEach((l) => l())

  const history = {
    get state() {
      return entries[index].state
    },
    pushState(state: unknown, _unused: string, url?: string | URL | null) {
      entries.splice(index + 1)
      entries.push({ url: new URL(String(url ?? location.href), location.href).href, state })
      index++
      sync()
    },
    replaceState(state: unknown, _unused: string, url?: string | URL | null) {
      entries[index] = { url: new URL(String(url ?? location.href), location.href).href, state }
      sync()
    },
    go(delta: number) {
      const next = index + delta
      if (next < 0 || next >= entries.length || delta === 0) return
      index = next
      sync()
      fire("popstate")
    },
    back() {
      this.go(-1)
    },
    forward() {
      this.go(1)
    },
  }

  const win = {
    history,
    location,
    sessionStorage: {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => void storage.set(k, v),
    },
    addEventListener(type: string, listener: () => void) {
      listeners.set(type, [...(listeners.get(type) ?? []), listener])
    },
    removeEventListener() {},
  }
  return { win, storage }
}

async function load(startUrl: string, storage?: Map<string, string>) {
  const { win } = fakeWindow(startUrl, storage)
  vi.stubGlobal("window", win)
  vi.resetModules()
  const store = await import("./nav-store")
  const depth = await import("@/lib/client/navigation-depth")
  return { win, history: win.history as typeof win.history & History, store, depth }
}

/** Next.js-style patch installed after ours (it captures ours as "original"). */
function patchLikeNext(history: History) {
  const push = history.pushState.bind(history)
  const replace = history.replaceState.bind(history)
  history.pushState = (data, unused, url) => push(data, unused, url)
  history.replaceState = (data, unused, url) => replace(data, unused, url)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("nav-store in the browser", () => {
  it("classifies pushes and pops from real history calls", async () => {
    const { history, store, depth } = await load("/vandaag")
    patchLikeNext(history)
    expect(store.hasHistory()).toBe(false)
    expect(depth.hasNavigatedInApp()).toBe(false)

    history.pushState({ __NA: true }, "", "/voeding/abc")
    expect(store.getActiveTab("/voeding/abc")).toBe("/vandaag")
    expect(store.getBackTarget("/voeding/abc", { href: "/voeding", label: "Voeding" })).toEqual({
      mode: "history",
      href: "/vandaag",
      label: "Vandaag",
    })
    expect(store.getLastNavigation().action).toBe("push")
    expect(depth.hasNavigatedInApp()).toBe(true)

    history.back()
    expect(store.getLastNavigation()).toEqual({ action: "pop", key: "/vandaag" })
    expect(store.hasHistory()).toBe(false)

    history.forward()
    expect(store.getLastNavigation().action).toBe("forward")
    expect(store.getActiveTab("/voeding/abc")).toBe("/vandaag")
  })

  it("ignores Next's same-URL replaceState and records a real replace", async () => {
    const { history, store } = await load("/vandaag")
    history.pushState(null, "", "/training/1")
    history.replaceState({ __NA: true }, "", "/training/1")
    expect(store.getLastNavigation().action).toBe("push")
    history.replaceState(null, "", "/training")
    expect(store.getLastNavigation()).toEqual({ action: "replace", key: "/training" })
    expect(store.getActiveTab("/training")).toBe("/vandaag")
    expect(store.getBackTarget("/training", null)).toMatchObject({ mode: "history", label: "Vandaag" })
  })

  it("keeps the stack over a reload of the same screen", async () => {
    const storage = new Map<string, string>()
    const first = await load("/cyclus", storage)
    first.history.pushState(null, "", "/kennis")
    expect(first.store.getActiveTab("/kennis")).toBe("/cyclus")

    const reloaded = await load("/kennis", storage)
    expect(reloaded.store.getActiveTab("/kennis")).toBe("/cyclus")
    expect(reloaded.store.hasHistory()).toBe(true)
  })

  it("a deep link gets the canonical tab and the fallback back link", async () => {
    const storage = new Map<string, string>()
    const first = await load("/vandaag", storage)
    first.history.pushState(null, "", "/voeding/abc")

    const deep = await load("/voeding/xyz", storage)
    expect(deep.store.getActiveTab("/voeding/xyz")).toBe("/ontdek")
    expect(deep.store.hasHistory()).toBe(false)
    expect(deep.store.getBackTarget("/voeding/xyz", { href: "/voeding", label: "Voeding" })).toEqual({
      mode: "link",
      href: "/voeding",
      label: "Voeding",
    })
  })

  it("registered titles become the next screen's back label", async () => {
    const { history, store } = await load("/voeding/abc")
    store.registerTitle("/voeding/abc", "Shakshuka met feta")
    history.pushState(null, "", "/kennis/eiwit")
    expect(store.getBackTarget("/kennis/eiwit", null)).toMatchObject({ label: "Shakshuka met feta" })
  })

  it("goBackOr / leaveFlow: back with history, replace without", async () => {
    const { history, store, depth } = await load("/training/1")
    const router = { back: vi.fn(), replace: vi.fn() }
    store.goBackOr(router, "/training")
    depth.leaveFlow(router, "/training")
    expect(router.back).not.toHaveBeenCalled()
    expect(router.replace).toHaveBeenCalledTimes(2)
    expect(router.replace).toHaveBeenCalledWith("/training")

    history.pushState(null, "", "/training/2")
    store.goBackOr(router, "/training")
    depth.leaveFlow(router, "/training")
    expect(router.back).toHaveBeenCalledTimes(2)
  })

  it("notifies subscribers after the history write, not during it", async () => {
    const { history, store } = await load("/vandaag")
    const listener = vi.fn()
    store.subscribeNav(listener)
    history.pushState(null, "", "/deze-week")
    expect(listener).not.toHaveBeenCalled()
    await Promise.resolve()
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
