import { describe, expect, it } from "vitest"
import {
  MAX_STACK,
  activeTabFor,
  applyPop,
  applyPush,
  applyReplace,
  applyTitle,
  backTargetFor,
  compactBackLabel,
  hasHistory,
  initState,
  toKey,
  type NavState,
} from "./nav-stack"

/** Follow a little script of navigations from a starting URL. */
function run(start: string, steps: Array<["push" | "replace" | "pop", string]>, persisted?: unknown): NavState {
  let s = initState(start, persisted)
  for (const [kind, url] of steps) {
    s = kind === "push" ? applyPush(s, url) : kind === "replace" ? applyReplace(s, url) : applyPop(s, url)
  }
  return s
}

const paths = (s: NavState) => s.stack.map((e) => e.key)

describe("tab of origin", () => {
  it("Vandaag → recipe keeps Vandaag, back says Vandaag", () => {
    const s = run("/vandaag", [["push", "/voeding/abc"]])
    expect(activeTabFor(s, "/voeding/abc")).toBe("/vandaag")
    expect(backTargetFor(s, "/voeding/abc", { href: "/voeding", label: "Voeding" })).toEqual({
      mode: "history",
      href: "/vandaag",
      label: "Vandaag",
    })
  })

  it("Cyclus → Kennis keeps Cyclus, also one level deeper", () => {
    const s = run("/cyclus", [
      ["push", "/cyclus/overgang"],
      ["push", "/kennis"],
      ["push", "/kennis/de-overgang"],
    ])
    expect(activeTabFor(s, "/kennis")).toBe("/cyclus")
    expect(activeTabFor(s, "/kennis/de-overgang")).toBe("/cyclus")
  })

  it("Profiel → Dagboek keeps Profiel; Profiel → Wat ik gebruik → library stays Profiel", () => {
    expect(activeTabFor(run("/profiel", [["push", "/dagboek"]]), "/dagboek")).toBe("/profiel")
    const chain = run("/profiel", [
      ["push", "/profiel/gebruik"],
      ["push", "/mentale-rust"],
    ])
    expect(activeTabFor(chain, "/mentale-rust")).toBe("/profiel")
  })

  it("a tab-bar tap (push to a tab root) switches the tab", () => {
    const s = run("/vandaag", [
      ["push", "/voeding/abc"],
      ["push", "/ontdek"],
      ["push", "/voeding/def"],
    ])
    expect(activeTabFor(s, "/ontdek")).toBe("/ontdek")
    expect(activeTabFor(s, "/voeding/def")).toBe("/ontdek")
  })

  it("computes the tab of a screen before its push is recorded (first render)", () => {
    const s = run("/vandaag", [])
    // Rendering /voeding/abc, pushState has not happened yet.
    expect(activeTabFor(s, "/voeding/abc")).toBe("/vandaag")
    expect(activeTabFor(s, "/cyclus")).toBe("/cyclus")
    expect(backTargetFor(s, "/voeding/abc", null)).toMatchObject({ mode: "history", label: "Vandaag" })
  })

  it("without a store (server) it is the canonical owner", () => {
    expect(activeTabFor(null, "/voeding/abc")).toBe("/ontdek")
    expect(activeTabFor(null, "/slaap")).toBe("/cyclus")
  })
})

describe("pop", () => {
  it("back pops one entry and restores the previous tab", () => {
    const s = run("/vandaag", [
      ["push", "/voeding/abc"],
      ["push", "/cyclus"],
      ["pop", "/voeding/abc"],
    ])
    expect(paths(s)).toEqual(["/vandaag", "/voeding/abc"])
    expect(s.last.action).toBe("pop")
    expect(activeTabFor(s, "/voeding/abc")).toBe("/vandaag")
  })

  it("forward after back goes forward again", () => {
    const s = run("/vandaag", [
      ["push", "/deze-week"],
      ["pop", "/vandaag"],
      ["pop", "/deze-week"],
    ])
    expect(paths(s)).toEqual(["/vandaag", "/deze-week"])
    expect(s.last.action).toBe("forward")
  })

  it("history.go(-2) truncates to the matching entry", () => {
    const s = run("/vandaag", [
      ["push", "/deze-week"],
      ["push", "/deze-week/boodschappen"],
      ["pop", "/vandaag"],
    ])
    expect(paths(s)).toEqual(["/vandaag"])
    expect(hasHistory(s)).toBe(false)
  })

  it("a pop to an unknown screen starts over like a deep link", () => {
    const s = run("/vandaag", [["pop", "/kennis/x"]])
    expect(paths(s)).toEqual(["/kennis/x"])
    expect(activeTabFor(s, "/kennis/x")).toBe("/ontdek")
    expect(s.last.action).toBe("reset")
  })

  it("a pop to the same screen (native #anchor) changes nothing", () => {
    const s0 = run("/cyclus", [["push", "/cyclus/overgang"]])
    expect(applyPop(s0, "/cyclus/overgang#signalen")).toBe(s0)
  })
})

describe("replace", () => {
  it("swaps the current entry and keeps its tab", () => {
    const s = run("/vandaag", [
      ["push", "/training/1"],
      ["replace", "/training"],
    ])
    expect(paths(s)).toEqual(["/vandaag", "/training"])
    expect(activeTabFor(s, "/training")).toBe("/vandaag")
    expect(s.last.action).toBe("replace")
  })

  it("is ignored for the same URL (Next re-writes history state on every render)", () => {
    const s0 = run("/vandaag", [["push", "/voeding/1"]])
    expect(applyReplace(s0, "/voeding/1")).toBe(s0)
    expect(applyReplace(s0, "/voeding/1#ingredienten")).toBe(s0)
  })

  it("on a deep link the replaced screen gets its own canonical tab", () => {
    const s = run("/training/1", [["replace", "/training"]])
    expect(activeTabFor(s, "/training")).toBe("/ontdek")
    expect(hasHistory(s)).toBe(false)
  })

  it("a replaced query is a different entry key", () => {
    const s = run("/favorieten", [["replace", "/favorieten?soort=recepten"]])
    expect(paths(s)).toEqual(["/favorieten?soort=recepten"])
  })
})

describe("deep link and reload", () => {
  it("deep link: canonical tab, fallback back label, no history", () => {
    const s = run("/voeding/x", [])
    expect(activeTabFor(s, "/voeding/x")).toBe("/ontdek")
    expect(hasHistory(s)).toBe(false)
    expect(backTargetFor(s, "/voeding/x", { href: "/voeding", label: "Voeding" })).toEqual({
      mode: "link",
      href: "/voeding",
      label: "Voeding",
    })
  })

  it("reload of the same screen restores the stack", () => {
    const before = run("/vandaag", [["push", "/voeding/abc"]])
    const persisted = JSON.parse(JSON.stringify(before))
    const after = initState("/voeding/abc", persisted)
    expect(paths(after)).toEqual(["/vandaag", "/voeding/abc"])
    expect(activeTabFor(after, "/voeding/abc")).toBe("/vandaag")
    expect(hasHistory(after)).toBe(true)
  })

  it("a fresh load of the same URL (not a reload) starts fresh", () => {
    const before = applyTitle(run("/vandaag", [["push", "/voeding/abc"]]), "/voeding/abc", "Shakshuka")
    const after = initState("/voeding/abc", JSON.parse(JSON.stringify(before)), { restoreStack: false })
    expect(paths(after)).toEqual(["/voeding/abc"])
    expect(activeTabFor(after, "/voeding/abc")).toBe("/ontdek")
    expect(hasHistory(after)).toBe(false)
    expect(after.titles["/voeding/abc"]).toBe("Shakshuka")
  })

  it("a different page load starts fresh but keeps the known titles", () => {
    const before = applyTitle(run("/vandaag", [["push", "/voeding/abc"]]), "/voeding/abc", "Shakshuka")
    const after = initState("/cyclus/vandaag", JSON.parse(JSON.stringify(before)))
    expect(paths(after)).toEqual(["/cyclus/vandaag"])
    expect(after.titles["/voeding/abc"]).toBe("Shakshuka")
  })

  it("ignores garbage in storage", () => {
    expect(paths(initState("/vandaag", { stack: "nope" }))).toEqual(["/vandaag"])
    expect(paths(initState("/vandaag", null))).toEqual(["/vandaag"])
  })
})

describe("back labels", () => {
  it("uses the previous screen's registered title", () => {
    let s = run("/voeding/abc", [])
    s = applyTitle(s, "/voeding/abc", "Shakshuka met feta")
    s = applyPush(s, "/kennis/eiwit")
    expect(backTargetFor(s, "/kennis/eiwit", { href: "/kennis", label: "Kennis" })).toMatchObject({
      mode: "history",
      label: "Shakshuka met feta",
      href: "/voeding/abc",
    })
  })

  it("says Terug when the previous screen's name is unknown — never the logical parent", () => {
    const s = run("/voeding/abc", [["push", "/kennis/eiwit"]])
    expect(backTargetFor(s, "/kennis/eiwit", { href: "/kennis", label: "Kennis" })).toMatchObject({
      mode: "history",
      label: "Terug",
    })
  })

  it("prefers the page's own name over its h1 and the fixed name", () => {
    let s = run("/vandaag", [])
    s = applyTitle(s, "/vandaag", "Goedemiddag, Testa", "observed")
    s = applyPush(s, "/voeding/abc")
    expect(backTargetFor(s, "/voeding/abc", null)).toMatchObject({ label: "Vandaag" })
    s = applyTitle(s, "/voeding/abc", "Ovulatie", "observed")
    s = applyPush(s, "/kennis/x")
    expect(backTargetFor(s, "/kennis/x", null)).toMatchObject({ label: "Ovulatie" })
  })

  it("a query-only push goes back to the same page name", () => {
    const s = run("/vandaag", [
      ["push", "/deze-week"],
      ["push", "/deze-week?dag=2026-10-03"],
    ])
    expect(backTargetFor(s, "/deze-week", null)).toMatchObject({ mode: "history", label: "Deze week" })
  })

  it("long names become Terug in the app bar", () => {
    expect(compactBackLabel("Persoonlijke gegevens")).toBe("Terug")
    expect(compactBackLabel("Cyclusinstellingen")).toBe("Cyclusinstellingen")
  })

  it("ignores empty titles", () => {
    const s = run("/vandaag", [])
    expect(applyTitle(s, "/vandaag", "   ")).toBe(s)
  })
})

describe("limits and keys", () => {
  it(`caps the stack at ${MAX_STACK}`, () => {
    let s = initState("/vandaag")
    for (let i = 0; i < MAX_STACK + 10; i++) s = applyPush(s, `/voeding/${i}`)
    expect(s.stack).toHaveLength(MAX_STACK)
    expect(s.stack[s.stack.length - 1].key).toBe(`/voeding/${MAX_STACK + 9}`)
  })

  it("keys keep the query and drop the hash", () => {
    expect(toKey("/deze-week/?dag=1#x")).toEqual({ key: "/deze-week?dag=1", path: "/deze-week" })
    expect(toKey("/cyclus#jouw-verhaal")).toEqual({ key: "/cyclus", path: "/cyclus" })
  })
})

describe("coming into the app from outside it (login, onboarding, legal)", () => {
  it("login → deep page: canonical tab, no way back to the login form", () => {
    const meldingen = { href: "/profiel", label: "Profiel" }
    const before = initState("/login?next=%2Fprofiel%2Fmeldingen")
    // First render of the new screen, before the history write is seen.
    expect(activeTabFor(before, "/profiel/meldingen")).toBe("/profiel")
    expect(backTargetFor(before, "/profiel/meldingen", meldingen)).toEqual({ mode: "link", ...meldingen })

    const s = applyPush(before, "/profiel/meldingen")
    expect(paths(s)).toEqual(["/profiel/meldingen"])
    expect(activeTabFor(s, "/profiel/meldingen")).toBe("/profiel")
    expect(hasHistory(s)).toBe(false)
    expect(backTargetFor(s, "/profiel/meldingen", meldingen)).toEqual({ mode: "link", ...meldingen })
    expect(s.last.action).toBe("push")
  })

  it("onboarding / welcome → Vandaag (push or replace) starts a fresh history", () => {
    expect(paths(run("/onboarding", [["push", "/vandaag"]]))).toEqual(["/vandaag"])
    expect(hasHistory(run("/onboarding", [["replace", "/vandaag"]]))).toBe(false)
    expect(hasHistory(run("/", [["push", "/vandaag"]]))).toBe(false)
    expect(hasHistory(run("/profiel", [["push", "/privacy"], ["push", "/vandaag"]]))).toBe(false)
  })

  it("outside → outside and app → legal page keep their history", () => {
    expect(hasHistory(run("/", [["push", "/login"]]))).toBe(true)
    expect(hasHistory(run("/login", [["push", "/privacy"]]))).toBe(true)
    const s = run("/profiel", [["push", "/privacy"]])
    expect(backTargetFor(s, "/privacy", null)).toMatchObject({ mode: "history", href: "/profiel" })
  })
})
