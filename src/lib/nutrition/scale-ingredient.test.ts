import { describe, expect, it } from "vitest"
import { scaleIngredientLine } from "@/lib/nutrition/scale-ingredient"

describe("scaleIngredientLine", () => {
  it("keeps the unit singular for a half (½ blik, not ½ blikken)", () => {
    expect(scaleIngredientLine("1 blik kikkererwten", 0.5)).toBe("½ blik kikkererwten")
  })

  it("uses the plural for more than one", () => {
    expect(scaleIngredientLine("1 blik kikkererwten", 2)).toBe("2 blikken kikkererwten")
  })

  it("keeps exactly one singular", () => {
    expect(scaleIngredientLine("2 blikken kikkererwten", 0.5)).toBe("1 blik kikkererwten")
  })
})
