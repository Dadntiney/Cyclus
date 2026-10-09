import { describe, expect, it } from "vitest"
import { buildThread, dayLabel, messageDay } from "./thread"

type Msg = { id: string; role: "user" | "assistant"; created_at: string }

function msg(id: string, role: Msg["role"], created_at: string): Msg {
  return { id, role, created_at }
}

describe("messageDay", () => {
  it("uses the Amsterdam calendar day, not UTC", () => {
    // 22:30 UTC on 2 Oct is 00:30 on 3 Oct in Amsterdam (CEST).
    expect(messageDay("2026-10-02T22:30:00.000Z")).toBe("2026-10-03")
    expect(messageDay("2026-10-02T21:59:00.000Z")).toBe("2026-10-02")
    // Winter time (CET, +1).
    expect(messageDay("2026-01-15T23:30:00Z")).toBe("2026-01-16")
  })

  it("returns null for an unreadable timestamp", () => {
    expect(messageDay("niet-een-datum")).toBeNull()
  })
})

describe("dayLabel", () => {
  it("names today and yesterday", () => {
    expect(dayLabel("2026-10-03", "2026-10-03")).toBe("Vandaag")
    expect(dayLabel("2026-10-02", "2026-10-03")).toBe("Gisteren")
  })

  it("finds yesterday across a month and year boundary", () => {
    expect(dayLabel("2026-02-28", "2026-03-01")).toBe("Gisteren")
    expect(dayLabel("2025-12-31", "2026-01-01")).toBe("Gisteren")
  })

  it("shows a short Dutch date for older days", () => {
    expect(dayLabel("2026-09-28", "2026-10-03")).toBe("ma 28 sep")
    expect(dayLabel("2026-03-29", "2026-10-03")).toBe("zo 29 mrt")
  })

  it("adds the year for another year", () => {
    expect(dayLabel("2025-12-12", "2026-10-03")).toBe("vr 12 dec 2025")
  })
})

describe("buildThread", () => {
  const today = "2026-10-03"

  it("puts a separator before the first message of every day", () => {
    const items = buildThread(
      [
        msg("a", "user", "2026-10-02T08:00:00Z"),
        msg("b", "assistant", "2026-10-02T08:00:05Z"),
        msg("c", "user", "2026-10-03T09:00:00Z"),
      ],
      today,
    )
    expect(items.map((i) => (i.kind === "day" ? `[${i.label}]` : i.key))).toEqual([
      "[Gisteren]",
      "a",
      "b",
      "[Vandaag]",
      "c",
    ])
  })

  it("marks runs from one sender: avatar and tail only on the last bubble", () => {
    const items = buildThread(
      [
        msg("u1", "user", "2026-10-03T09:00:00Z"),
        msg("b1", "assistant", "2026-10-03T09:00:01Z"),
        msg("b2", "assistant", "2026-10-03T09:00:02Z"),
        msg("b3", "assistant", "2026-10-03T09:00:03Z"),
        msg("u2", "user", "2026-10-03T09:01:00Z"),
      ],
      today,
    ).filter((i) => i.kind === "message")
    const flags = Object.fromEntries(
      items.map((i) => [i.key, i.kind === "message" ? [i.groupStart, i.groupEnd] : null]),
    )
    expect(flags).toEqual({
      u1: [true, true],
      b1: [true, false],
      b2: [false, false],
      b3: [false, true],
      u2: [true, true],
    })
  })

  it("starts a new run on a new day, even from the same sender", () => {
    const items = buildThread(
      [msg("b1", "assistant", "2026-10-02T20:00:00Z"), msg("b2", "assistant", "2026-10-03T09:00:00Z")],
      today,
    ).filter((i) => i.kind === "message")
    expect(items.map((i) => i.kind === "message" && [i.groupStart, i.groupEnd])).toEqual([
      [true, true],
      [true, true],
    ])
  })

  it("ends a run after a message that breaks it (a failed send)", () => {
    const items = buildThread(
      [msg("u1", "user", "2026-10-03T09:00:00Z"), msg("u2", "user", "2026-10-03T09:00:10Z")],
      today,
      (m) => m.id === "u1",
    ).filter((i) => i.kind === "message")
    expect(items.map((i) => i.kind === "message" && [i.groupStart, i.groupEnd])).toEqual([
      [true, true],
      [true, true],
    ])
  })

  it("keeps an unreadable timestamp on the current day", () => {
    const items = buildThread(
      [msg("a", "user", "2026-10-03T09:00:00Z"), msg("b", "user", "kapot")],
      today,
    )
    expect(items.filter((i) => i.kind === "day")).toHaveLength(1)
  })

  it("returns nothing for an empty conversation", () => {
    expect(buildThread([], today)).toEqual([])
  })
})
