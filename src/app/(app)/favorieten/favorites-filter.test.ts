import { describe, expect, it } from "vitest"
import { favoritesFilterHref, parseFavoritesFilter } from "./favorites-filter"

describe("parseFavoritesFilter", () => {
  it("accepts the values the old pages redirect with", () => {
    expect(parseFavoritesFilter("recepten")).toBe("recepten")
    expect(parseFavoritesFilter("beweging")).toBe("beweging")
    expect(parseFavoritesFilter("momenten")).toBe("momenten")
  })

  it("falls back to alles", () => {
    expect(parseFavoritesFilter(undefined)).toBe("alles")
    expect(parseFavoritesFilter(null)).toBe("alles")
    expect(parseFavoritesFilter("trainingen")).toBe("alles")
    expect(parseFavoritesFilter("")).toBe("alles")
  })

  it("is forgiving about case and repeated params", () => {
    expect(parseFavoritesFilter("Recepten ")).toBe("recepten")
    expect(parseFavoritesFilter(["beweging", "recepten"])).toBe("beweging")
  })
})

describe("favoritesFilterHref", () => {
  it("keeps alles as the bare page", () => {
    expect(favoritesFilterHref("alles")).toBe("/favorieten")
    expect(favoritesFilterHref("momenten")).toBe("/favorieten?soort=momenten")
  })
})
