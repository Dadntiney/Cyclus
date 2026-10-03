import { describe, expect, it } from "vitest"
import {
  formatCookAmount,
  scaleIngredientLine,
  scaleIngredientLineForCooking,
  scaleIngredientListForCooking,
  scaleQuantityForGrocery,
} from "@/lib/nutrition/scale-ingredient"

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

describe("scaleQuantityForGrocery (unchanged by the cook-friendly rounding)", () => {
  it("still rounds countable units up so you buy a whole one", () => {
    expect(scaleQuantityForGrocery("1", 2 / 3)).toBe("1")
    expect(scaleQuantityForGrocery("2", 2 / 3)).toBe("2")
  })

  it("still keeps grams as computed", () => {
    expect(scaleQuantityForGrocery("400g", 2 / 3)).toBe("266,7g")
  })
})

describe("formatCookAmount", () => {
  it("rounds grams and millilitres from 50 up to the nearest 5", () => {
    expect(formatCookAmount(266.7, "g")).toBe("265")
    expect(formatCookAmount(52.4, "ml")).toBe("50")
    expect(formatCookAmount(147.6, "gram")).toBe("150")
  })

  it("rounds small grams to the nearest 1, never to 0", () => {
    expect(formatCookAmount(26.7, "g")).toBe("27")
    expect(formatCookAmount(0.4, "g")).toBe("1")
  })

  it("rounds pieces, eggs and spoons to the nearest half", () => {
    expect(formatCookAmount(2 / 3, "")).toBe("½")
    expect(formatCookAmount(4 / 3, "el")).toBe("1½")
    expect(formatCookAmount(1.2, "teentje")).toBe("1")
    expect(formatCookAmount(0.2, "")).toBe("½")
  })

  it("rounds kilo and liter to the nearest quarter", () => {
    expect(formatCookAmount(0.8, "l")).toBe("¾")
    expect(formatCookAmount(1.3, "kg")).toBe("1¼")
  })
})

describe("scaleIngredientLineForCooking", () => {
  // Courgette-noedels: written for 3, cooked for 2 (NUT-5).
  const twoOfThree = 2 / 3

  it("gives humane amounts instead of ⅔ and comma decimals", () => {
    // Dutch keeps a noun singular with a half: "anderhalve courgette".
    expect(scaleIngredientLineForCooking("2 courgettes", twoOfThree)).toBe("1½ courgette")
    expect(scaleIngredientLineForCooking("1 ei", twoOfThree)).toBe("½ ei")
    expect(scaleIngredientLineForCooking("400g gezeefde tomaten", twoOfThree)).toBe("265g gezeefde tomaten")
    expect(scaleIngredientLineForCooking("2 el paneermeel", twoOfThree)).toBe("1½ el paneermeel")
  })

  it("keeps the original unit word, prep notes and casing", () => {
    expect(scaleIngredientLineForCooking("1 teentje knoflook, fijngehakt", twoOfThree)).toBe(
      "½ teentje knoflook, fijngehakt",
    )
    expect(scaleIngredientLineForCooking("2 eetlepels olijfolie", 2)).toBe("4 eetlepels olijfolie")
    expect(scaleIngredientLineForCooking("400 g Griekse yoghurt", 0.5)).toBe("200 g Griekse yoghurt")
    expect(scaleIngredientLineForCooking("1 ui, gesnipperd", 0.5)).toBe("½ ui, gesnipperd")
  })

  it("matches singular and plural to the new amount", () => {
    expect(scaleIngredientLineForCooking("2 eieren", 0.5)).toBe("1 ei")
    expect(scaleIngredientLineForCooking("1 ei", 2)).toBe("2 eieren")
    expect(scaleIngredientLineForCooking("1 eetlepel honing", 2)).toBe("2 eetlepels honing")
    expect(scaleIngredientLineForCooking("2 grote uien", 0.5)).toBe("1 grote ui")
    expect(scaleIngredientLineForCooking("1 Tomaat", 3)).toBe("3 Tomaten")
    expect(scaleIngredientLineForCooking("3 eetlepels water", 0.5)).toBe("1½ eetlepel water")
  })

  it("scales fractions, mixed numbers and ranges", () => {
    expect(scaleIngredientLineForCooking("1/2 limoen", 2)).toBe("1 limoen")
    expect(scaleIngredientLineForCooking("½ avocado", 3)).toBe("1½ avocado")
    expect(scaleIngredientLineForCooking("1 1/2 el honing", 2)).toBe("3 el honing")
    expect(scaleIngredientLineForCooking("2-3 el water", 2)).toBe("4-6 el water")
    expect(scaleIngredientLineForCooking("1-2 tl kaneel", 0.5)).toBe("½-1 tl kaneel")
  })

  it("scales word amounts it can read and keeps the words around them", () => {
    expect(scaleIngredientLineForCooking("halve avocado", 2)).toBe("1 avocado")
    expect(scaleIngredientLineForCooking("een blik tomaten", 2)).toBe("2 blikken tomaten")
    expect(scaleIngredientLineForCooking("eetlepel citroensap", 2)).toBe("2 eetlepels citroensap")
    expect(scaleIngredientLineForCooking("Sap van 1 citroen", 2)).toBe("Sap van 2 citroenen")
  })

  it("leaves lines without a clear amount alone", () => {
    expect(scaleIngredientLineForCooking("Zout en peper naar smaak", 2)).toBe("Zout en peper naar smaak")
    expect(scaleIngredientLineForCooking("snufje zout", 2)).toBe("snufje zout")
    expect(scaleIngredientLineForCooking("handvol spinazie", 0.5)).toBe("handvol spinazie")
    expect(scaleIngredientLineForCooking("paarse ui", 2)).toBe("paarse ui")
    expect(scaleIngredientLineForCooking("een beetje olie", 2)).toBe("een beetje olie")
  })

  it("leaves per-person amounts alone: they are right for any number of porties", () => {
    expect(scaleIngredientLineForCooking("1 ei per persoon", 2)).toBe("1 ei per persoon")
    expect(scaleIngredientLineForCooking("Half ei per persoon", 0.5)).toBe("Half ei per persoon")
    expect(scaleIngredientLineForCooking("2 sneetjes brood p.p.", 1.5)).toBe("2 sneetjes brood p.p.")
  })

  it("knows the other plurals and adjectives the recipes use", () => {
    expect(scaleIngredientLineForCooking("2 aardappelen", 0.5)).toBe("1 aardappel")
    expect(scaleIngredientLineForCooking("4 kipdijfilets", 0.25)).toBe("1 kipdijfilet")
    expect(scaleIngredientLineForCooking("1 bevroren banaan", 2)).toBe("2 bevroren bananen")
    expect(scaleIngredientLineForCooking("2 rijpe avocados", 0.5)).toBe("1 rijpe avocado")
    expect(scaleIngredientLineForCooking("2 stengels bleekselderij", 2 / 3)).toBe("1½ stengel bleekselderij")
  })

  it("returns the line exactly as written at the recipe's own porties", () => {
    expect(scaleIngredientLineForCooking("1,5 el olie", 1)).toBe("1,5 el olie")
    expect(scaleIngredientLineForCooking("⅔ ei", 1)).toBe("⅔ ei")
  })

  it("scales a list and skips anything that is not text", () => {
    expect(scaleIngredientListForCooking(["2 eieren", 3, "zout"], 0.5)).toEqual(["1 ei", "zout"])
  })
})
