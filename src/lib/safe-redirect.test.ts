import { describe, expect, it } from "vitest"
import { safeNextPath } from "@/lib/safe-redirect"

describe("safeNextPath", () => {
  it("keeps app-internal paths, including query and hash", () => {
    expect(safeNextPath("/vandaag")).toBe("/vandaag")
    expect(safeNextPath("/cyclus/vandaag?tab=1#fase")).toBe("/cyclus/vandaag?tab=1#fase")
  })

  it.each([
    "https://evil.example",
    "//evil.example/x",
    "/\\evil.example",
    "@evil.example",
    "evil.example",
    "javascript:alert(1)",
    "/\t/evil.example",
    "",
  ])("rejects %j", (value) => {
    expect(safeNextPath(value)).toBeNull()
    expect(safeNextPath(value, "/vandaag")).toBe("/vandaag")
  })

  it("rejects non-strings", () => {
    expect(safeNextPath(null)).toBeNull()
    expect(safeNextPath(undefined, "/x")).toBe("/x")
  })
})
