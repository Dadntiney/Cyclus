import { describe, expect, it } from "vitest"
import { greeting } from "@/lib/greeting"

describe("greeting", () => {
  it("uses Amsterdam time, not the server's UTC clock", () => {
    // 10:30 UTC in October (CEST) is 12:30 in Amsterdam.
    expect(greeting(new Date("2026-10-02T10:30:00Z"))).toBe("Goedemiddag")
    // 17:30 UTC is 19:30 in Amsterdam.
    expect(greeting(new Date("2026-10-02T17:30:00Z"))).toBe("Goedenavond")
    expect(greeting(new Date("2026-10-02T06:00:00Z"))).toBe("Goedemorgen")
    expect(greeting(new Date("2026-12-02T23:30:00Z"))).toBe("Goedemorgen")
  })
})
