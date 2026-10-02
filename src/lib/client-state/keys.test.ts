import { describe, expect, it } from "vitest"
import { syncedKeyOwner } from "./keys"

const id = "8d418dfc-9f15-4e0b-a6e2-e7d6c8ec3dfc"

describe("syncedKeyOwner", () => {
  it("accepts the synced keys and returns their owner", () => {
    expect(syncedKeyOwner(`cyclus:week-overrides:${id}:2026-09-28`)).toBe(id)
    expect(syncedKeyOwner(`cyclus:grocery-checked:${id}:2026-09-28`)).toBe(id)
    expect(syncedKeyOwner(`cyclus:servings:${id}`)).toBe(id)
    expect(syncedKeyOwner(`cyclus:day-closed:${id}:2026-10-02`)).toBe(id)
  })

  it("rejects device-only and malformed keys", () => {
    expect(syncedKeyOwner(`cyclus:day-gratitude:${id}:2026-10-02`)).toBeNull()
    expect(syncedKeyOwner("cyclus:day-closed:2026-10-02")).toBeNull()
    expect(syncedKeyOwner(`cyclus:servings:${id}:extra`)).toBeNull()
    expect(syncedKeyOwner("gofiev:profile-complete-dismissed")).toBeNull()
    expect(syncedKeyOwner(`x-cyclus:servings:${id}`)).toBeNull()
  })
})
