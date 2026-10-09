import { describe, expect, it, vi } from "vitest"
import { createImmersiveStore } from "./use-immersive"

describe("immersive store", () => {
  it("is off until something asks for it", () => {
    const store = createImmersiveStore()
    expect(store.getSnapshot()).toEqual({ immersive: false, appBarHidden: false })
  })

  it("ref-counts requests: off only after the last one lets go", () => {
    const apply = vi.fn()
    const store = createImmersiveStore(apply)
    const a = store.request()
    const b = store.request()
    expect(store.getSnapshot().immersive).toBe(true)
    a()
    expect(store.getSnapshot().immersive).toBe(true)
    b()
    expect(store.getSnapshot().immersive).toBe(false)
    // Applied once on, once off — no flicker in between.
    expect(apply).toHaveBeenCalledTimes(2)
  })

  it("releasing twice is harmless (strict-mode double cleanup)", () => {
    const store = createImmersiveStore()
    const a = store.request()
    const b = store.request()
    a()
    a()
    expect(store.getSnapshot().immersive).toBe(true)
    b()
    expect(store.getSnapshot().immersive).toBe(false)
  })

  it("hides the app bar only while a request asks for it", () => {
    const store = createImmersiveStore()
    const keep = store.request("keep")
    expect(store.getSnapshot().appBarHidden).toBe(false)
    const hide = store.request("hide")
    expect(store.getSnapshot()).toEqual({ immersive: true, appBarHidden: true })
    hide()
    expect(store.getSnapshot()).toEqual({ immersive: true, appBarHidden: false })
    keep()
    expect(store.getSnapshot()).toEqual({ immersive: false, appBarHidden: false })
  })

  it("notifies subscribers only on real changes and keeps snapshots stable", () => {
    const store = createImmersiveStore()
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    const first = store.getSnapshot()
    expect(store.getSnapshot()).toBe(first)
    const a = store.request()
    const b = store.request()
    expect(listener).toHaveBeenCalledTimes(1)
    a()
    b()
    expect(listener).toHaveBeenCalledTimes(2)
    unsubscribe()
    store.request()
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
