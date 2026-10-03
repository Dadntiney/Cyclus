import { describe, expect, it } from "vitest"
import {
  FIRST_REPLY_OPENER,
  GENERIC_REPLY,
  GENERIC_REPLY_BY_STYLE,
  RuleBasedBuddyProvider,
  pickVariant,
} from "./rule-based-provider"
import type { BuddyChatMessage } from "./types"

const provider = new RuleBasedBuddyProvider()

/** A conversation in which Buddy already answered once (so no first reply). */
function afterFirstReply(previousReply = "Dank je voor je bericht."): BuddyChatMessage[] {
  return [
    { role: "user", message: "Hoi" },
    { role: "assistant", message: previousReply },
  ]
}

const GENERIC_MESSAGES = [
  "Ik weet het niet zo goed vandaag",
  "Wat vind jij ervan?",
  "Mijn werk was druk",
  "Ik heb vandaag gewandeld",
  "Mijn dochter is jarig",
  "Ik vroeg me iets af over voeding",
  "Het regent hier al de hele dag",
  "Gisteren was een rare dag",
  "Ik zit op de bank",
  "Vertel eens iets",
  "Ik heb net gegeten",
  "Waarom is dat eigenlijk zo?",
  "Ik probeer wat vaker te sporten",
  "Mijn schoonmoeder komt logeren",
  "Ik heb een nieuwe baan",
  "Zullen we even kletsen?",
  "Ik merk dat ik veel nadenk",
  "Het was een gewone dag",
  "Ik lees een goed boek",
  "Morgen heb ik vrij",
]

describe("pickVariant", () => {
  const variants = ["een", "twee", "drie"] as const

  it("is deterministic for the same message", () => {
    expect(pickVariant(variants, "Mijn werk was druk")).toBe(pickVariant(variants, "Mijn werk was druk"))
  })

  it("ignores case and surrounding whitespace", () => {
    expect(pickVariant(variants, "  Mijn werk   was druk ")).toBe(pickVariant(variants, "mijn werk was druk"))
  })

  it("never returns the previous reply when another variant exists", () => {
    for (const message of GENERIC_MESSAGES) {
      const first = pickVariant(variants, message)
      expect(pickVariant(variants, message, first)).not.toBe(first)
    }
  })

  it("spreads different messages over all variants", () => {
    const picks = GENERIC_MESSAGES.map((m) => pickVariant(variants, m))
    const counts = variants.map((v) => picks.filter((p) => p === v).length)
    expect(Math.min(...counts)).toBeGreaterThan(0)
    // No variant takes the lion's share: two generic messages rarely match.
    expect(Math.max(...counts)).toBeLessThanOrEqual(GENERIC_MESSAGES.length * 0.6)
  })

  it("handles a single variant and an empty list", () => {
    expect(pickVariant(["alleen"], "x", "alleen")).toBe("alleen")
    expect(pickVariant([], "x")).toBe("")
  })
})

describe("RuleBasedBuddyProvider", () => {
  it("opens the first reply without promising a future AI link", async () => {
    const reply = await provider.generateReply([{ role: "user", message: "Hoi" }], "Hoi", [])
    expect(reply.message.startsWith(FIRST_REPLY_OPENER)).toBe(true)
    expect(reply.message).not.toMatch(/volgt later|koppeling/i)
    expect(reply.aiGenerated).toBe(false)
  })

  it("weaves check-in and cycle context into the first reply", async () => {
    const reply = await provider.generateReply([], "Hoi", [
      "Laatste check-in: energie 2/5",
      "Cyclusdag 21 (luteale fase, schatting)",
    ])
    expect(reply.message).toContain("Uit je laatste check-in: energie 2/5.")
    expect(reply.message).toContain("Cyclusdag 21 (luteale fase, schatting).")
  })

  it("refers to a doctor for concerning messages, every time", async () => {
    const reply = await provider.generateReply(afterFirstReply(), "Ik heb hevige pijn en koorts", [])
    expect(reply.message).toMatch(/huisarts/)
    const again = await provider.generateReply(afterFirstReply(reply.message), "Nog steeds koorts", [])
    expect(again.message).toBe(reply.message)
  })

  it("gives different generic messages varied replies", async () => {
    const replies = await Promise.all(
      GENERIC_MESSAGES.map((m) => provider.generateReply(afterFirstReply(), m, [])),
    )
    const distinct = new Set(replies.map((r) => r.message))
    expect(distinct.size).toBe(GENERIC_REPLY.length)
    for (const r of replies) expect(GENERIC_REPLY).toContain(r.message)
  })

  it("does not repeat the previous reply word for word", async () => {
    let previous = "Dank je voor je bericht."
    for (const message of ["Mijn werk was druk", "Mijn werk was druk", "Mijn werk was druk"]) {
      const reply = await provider.generateReply(afterFirstReply(previous), message, [])
      expect(reply.message).not.toBe(previous)
      previous = reply.message
    }
  })

  it("keeps her chosen style, and falls back to neutral wording instead of repeating it", async () => {
    const context = ["Buddy-stijl (toon-voorkeur): direct, humor"]
    const styled = await provider.generateReply(afterFirstReply(), "Ik ben zo moe", context)
    expect(styled.message).toBe("Klinkt alsof je lichaam rust vraagt. Plan vandaag lichter in waar dat kan.")
    const next = await provider.generateReply(afterFirstReply(styled.message), "Nog steeds moe", context)
    expect(next.message).not.toBe(styled.message)
    expect(next.message).toMatch(/moe|vermoei|rust/i)
  })

  it("has three generic variants for every style", () => {
    for (const style of ["liefdevol", "humor", "spiritueel", "motiverend", "informatief", "rustig", "direct", "luchtig"]) {
      const variants = GENERIC_REPLY_BY_STYLE[style]
      expect(variants, style).toHaveLength(3)
      expect(new Set(variants).size, style).toBe(3)
    }
    expect(GENERIC_REPLY).toHaveLength(3)
  })

  it("uses the style's generic wording", async () => {
    const reply = await provider.generateReply(afterFirstReply(), "Mijn werk was druk", [
      "Buddy-stijl (toon-voorkeur): rustig",
    ])
    expect(GENERIC_REPLY_BY_STYLE.rustig).toContain(reply.message)
  })
})
