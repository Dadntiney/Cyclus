import { beforeEach, describe, expect, it, vi } from "vitest"

const saved: [string, string | null][] = []
vi.mock("@/lib/actions/client-state", () => ({
  saveClientState: vi.fn(async (key: string, value: string | null) => {
    saved.push([key, value])
    return { success: true }
  }),
}))

class MemoryStorage {
  private map = new Map<string, string>()
  get length() {
    return this.map.size
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null
  }
  getItem(k: string) {
    return this.map.get(k) ?? null
  }
  setItem(k: string, v: string) {
    this.map.set(k, v)
  }
  removeItem(k: string) {
    this.map.delete(k)
  }
}

const id = "8d418dfc-9f15-4e0b-a6e2-e7d6c8ec3dfc"
const servings = `cyclus:servings:${id}`
const grocery = `cyclus:grocery-checked:${id}:2026-09-28`

async function load() {
  vi.resetModules()
  return import("./account-sync")
}

beforeEach(() => {
  saved.length = 0
  vi.stubGlobal("localStorage", new MemoryStorage())
  vi.stubGlobal("window", { dispatchEvent: vi.fn() })
})

describe("applyAccountState", () => {
  it("copies account values onto the device", async () => {
    const { applyAccountState } = await load()
    applyAccountState(id, [{ key: servings, value: '{"defaultServings":4,"byRecipeId":{}}' }])
    expect(localStorage.getItem(servings)).toContain('"defaultServings":4')
    expect(window.dispatchEvent).toHaveBeenCalled()
  })

  it("uploads device-only entries the first time, then drops stale ones", async () => {
    const { applyAccountState } = await load()
    localStorage.setItem(grocery, '["a"]')
    applyAccountState(id, [])
    await vi.waitFor(() => expect(saved).toEqual([[grocery, '["a"]']]))
    expect(localStorage.getItem(grocery)).toBe('["a"]')

    // Later load: the account no longer has it (removed on another device).
    const fresh = await load()
    fresh.applyAccountState(id, [])
    expect(localStorage.getItem(grocery)).toBeNull()
  })

  it("does not undo a change made on this page before the snapshot arrived", async () => {
    const { applyAccountState, syncToAccount } = await load()
    localStorage.setItem(grocery, '["new"]')
    syncToAccount(grocery, '["new"]')
    applyAccountState(id, [{ key: grocery, value: '["old"]' }])
    expect(localStorage.getItem(grocery)).toBe('["new"]')
  })

  it("ignores keys of another user and unknown keys", async () => {
    const { applyAccountState, syncToAccount } = await load()
    const other = "11111111-2222-3333-4444-555555555555"
    applyAccountState(id, [{ key: `cyclus:servings:${other}`, value: "x" }])
    expect(localStorage.getItem(`cyclus:servings:${other}`)).toBeNull()
    syncToAccount("gofiev:profile-complete-dismissed", "1")
    expect(saved).toEqual([])
  })
})
