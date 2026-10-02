import { describe, expect, it } from "vitest"
import {
  FEATURES,
  TAB_ROOTS,
  featureForPath,
  isAppPath,
  isTabRoot,
  normalizePath,
  ownerTab,
  parentOf,
  titleForPath,
} from "./features"
import { NAV_ITEMS, isNavActive } from "@/components/nav/nav-items"

describe("ownerTab (ontwerpvisie §4.3)", () => {
  it.each([
    // Vandaag
    ["/vandaag", "/vandaag"],
    ["/deze-week", "/vandaag"],
    ["/deze-week/boodschappen", "/vandaag"],
    // Ontdek
    ["/ontdek", "/ontdek"],
    ["/voeding", "/ontdek"],
    ["/voeding/abc", "/ontdek"],
    ["/voeding/favorieten", "/ontdek"],
    ["/training", "/ontdek"],
    ["/training/3d73", "/ontdek"],
    ["/mentale-rust", "/ontdek"],
    ["/mentale-rust/adem", "/ontdek"],
    ["/kennis", "/ontdek"],
    ["/kennis/de-overgang", "/ontdek"],
    ["/favorieten", "/ontdek"],
    // Cyclus
    ["/cyclus", "/cyclus"],
    ["/cyclus/vandaag", "/cyclus"],
    ["/cyclus/overgang", "/cyclus"],
    ["/cyclus/samenvatting", "/cyclus"],
    ["/cyclus/klachtenlast", "/cyclus"],
    ["/slaap", "/cyclus"],
    // Buddy
    ["/buddy", "/buddy"],
    // Profiel
    ["/profiel", "/profiel"],
    ["/profiel/gegevens", "/profiel"],
    ["/profiel/cyclus", "/profiel"],
    ["/dagboek", "/profiel"],
    ["/medicatie", "/profiel"],
    ["/medicatie/nieuw", "/profiel"],
    ["/medicatie/123", "/profiel"],
  ])("%s → %s", (path, tab) => {
    expect(ownerTab(path)).toBe(tab)
  })

  it("ignores query, hash and a trailing slash", () => {
    expect(ownerTab("/slaap/?x=1#top")).toBe("/cyclus")
    expect(ownerTab("/medicatie/nieuw?stap=2")).toBe("/profiel")
  })

  it("does not match on a shared prefix that is not a segment", () => {
    expect(ownerTab("/cyclusx")).toBe("/vandaag")
    expect(ownerTab("/profielen")).toBe("/vandaag")
  })

  it("sends unknown routes to Vandaag", () => {
    expect(ownerTab("/")).toBe("/vandaag")
    expect(ownerTab("/voor-jou")).toBe("/vandaag")
  })

  it("every feature's own tab matches the ownership table", () => {
    for (const feature of Object.values(FEATURES)) {
      expect(ownerTab(feature.href), feature.href).toBe(feature.tab)
    }
  })
})

describe("tab roots", () => {
  it("are the five tabs in order", () => {
    expect(TAB_ROOTS).toEqual(["/vandaag", "/ontdek", "/cyclus", "/buddy", "/profiel"])
  })

  it("match exactly", () => {
    expect(isTabRoot("/cyclus")).toBe(true)
    expect(isTabRoot("/cyclus/")).toBe(true)
    expect(isTabRoot("/cyclus/vandaag")).toBe(false)
    expect(isTabRoot("/deze-week")).toBe(false)
  })
})

describe("names (§4.4: link = h1 = back label)", () => {
  it.each([
    ["/deze-week", "Deze week"],
    ["/deze-week/boodschappen", "Boodschappen"],
    ["/training", "Beweging"],
    ["/mentale-rust", "Mentale rust"],
    ["/cyclus", "Cyclus"],
    ["/cyclus/vandaag", "Jouw fase"],
    ["/cyclus/overgang", "De overgang"],
    ["/cyclus/samenvatting", "Voor je arts"],
    ["/medicatie", "Medicatie"],
    ["/profiel/cyclus", "Cyclusinstellingen"],
    ["/profiel/buddy", "Buddy-stijl"],
    ["/profiel/privacy", "Privacy"],
    ["/profiel/gegevens", "Persoonlijke gegevens"],
  ])("%s is called %s", (path, name) => {
    expect(titleForPath(path)).toBe(name)
  })

  it("has no fixed name for dynamic pages", () => {
    expect(titleForPath("/voeding/abc")).toBeNull()
    expect(titleForPath("/kennis/de-overgang")).toBeNull()
    expect(titleForPath("/medicatie/nieuw")).toBeNull()
  })

  it("gives every destination a unique href and a unique name", () => {
    const features = Object.values(FEATURES)
    expect(new Set(features.map((f) => f.href)).size).toBe(features.length)
    expect(new Set(features.map((f) => f.label)).size).toBe(features.length)
  })

  it("never uses the old names", () => {
    const labels = Object.values(FEATURES).map((f) => f.label)
    for (const old of ["Mijn cyclus", "Mijn medicatie", "Mijn mentale rust", "Training", "Privacy & gegevens"]) {
      expect(labels).not.toContain(old)
    }
  })

  it("finds a feature by exact path", () => {
    expect(featureForPath("/kennis/")?.label).toBe("Kennis")
    expect(featureForPath("/kennis/x")).toBeNull()
  })
})

describe("parentOf (logical parent without history)", () => {
  it.each([
    ["/voeding/abc", "/voeding", "Voeding"],
    ["/voeding", "/ontdek", "Ontdek"],
    ["/deze-week", "/vandaag", "Vandaag"],
    ["/deze-week/boodschappen", "/deze-week", "Deze week"],
    ["/cyclus/samenvatting", "/cyclus", "Cyclus"],
    ["/slaap", "/cyclus", "Cyclus"],
    ["/dagboek", "/profiel", "Profiel"],
    ["/medicatie/nieuw", "/medicatie", "Medicatie"],
    ["/profiel/gebruik", "/profiel", "Profiel"],
    ["/kennis/de-overgang", "/kennis", "Kennis"],
  ])("%s → %s", (path, href, label) => {
    expect(parentOf(path)).toEqual({ href, label })
  })

  it("tab roots have no parent", () => {
    for (const root of TAB_ROOTS) expect(parentOf(root)).toBeNull()
  })
})

describe("NAV_ITEMS (derived)", () => {
  it("keeps the five tabs, labels and hrefs", () => {
    expect(NAV_ITEMS.map((i) => [i.href, i.label])).toEqual([
      ["/vandaag", "Vandaag"],
      ["/ontdek", "Ontdek"],
      ["/cyclus", "Cyclus"],
      ["/buddy", "Buddy"],
      ["/profiel", "Profiel"],
    ])
    for (const item of NAV_ITEMS) expect(item.icon).toBeTruthy()
  })

  it("isNavActive follows the canonical owner", () => {
    const [vandaag, ontdek, cyclus, , profiel] = NAV_ITEMS
    expect(isNavActive("/deze-week", vandaag)).toBe(true)
    expect(isNavActive("/deze-week", ontdek)).toBe(false)
    expect(isNavActive("/slaap", cyclus)).toBe(true)
    expect(isNavActive("/dagboek", profiel)).toBe(true)
    expect(isNavActive("/voeding/1", ontdek)).toBe(true)
  })
})

describe("normalizePath", () => {
  it("strips query, hash and trailing slashes", () => {
    expect(normalizePath("/a/b/?x#y")).toBe("/a/b")
    expect(normalizePath("/")).toBe("/")
    expect(normalizePath("")).toBe("/")
  })
})

describe("isAppPath (screens inside the app)", () => {
  it.each([
    ["/vandaag", true],
    ["/profiel/meldingen", true],
    ["/voeding/abc?x=1", true],
    ["/medicatie/nieuw", true],
    ["/", false],
    ["/login", false],
    ["/login?next=%2Fvandaag", false],
    ["/registreren", false],
    ["/wachtwoord-vergeten", false],
    ["/onboarding", false],
    ["/auth/callback", false],
    ["/privacy", false],
    ["/voorwaarden", false],
    ["/vandaagx", false],
  ])("%s → %s", (path, expected) => {
    expect(isAppPath(path)).toBe(expected)
  })
})
