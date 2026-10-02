import { describe, expect, it } from "vitest"
import { buildGroceryList, roundForShopping } from "@/lib/nutrition/grocery-list"

function names(ingredients: string[][]) {
  return buildGroceryList(ingredients.map((list) => ({ ingredients: list }))).flatMap((c) =>
    c.items.map((i) => ({ name: i.name, qty: i.totalQuantity })),
  )
}

describe("buildGroceryList", () => {
  it("merges prep notes and plurals into one row", () => {
    const items = names([
      ["1 courgette", "2 teentjes knoflook", "1 ui, gesnipperd"],
      ["2 courgettes", "1 teentje knoflook, fijngehakt", "1 ui"],
    ])
    const labels = items.map((i) => i.name)
    expect(labels.filter((n) => /courgette/i.test(n))).toHaveLength(1)
    expect(labels.filter((n) => /knoflook/i.test(n))).toHaveLength(1)
    expect(labels.filter((n) => /^ui/i.test(n))).toHaveLength(1)
  })

  it("rounds scaled weights to shop amounts", () => {
    const list = buildGroceryList([{ ingredients: ["400g tomatenblokjes"], factor: 2 / 3 }])
    expect(list[0].items[0].totalQuantity).toBe("275g")
  })
})

describe("roundForShopping", () => {
  it("rounds grams and millilitres up", () => {
    expect(roundForShopping("266,7g")).toBe("275g")
    expect(roundForShopping("716,7ml")).toBe("725ml")
    expect(roundForShopping("42g")).toBe("45g")
    expect(roundForShopping("200g")).toBe("200g")
  })

  it("rounds loose pieces up and leaves words alone", () => {
    expect(roundForShopping("2,5")).toBe("3")
    expect(roundForShopping("handvol")).toBe("handvol")
    expect(roundForShopping("1 el")).toBe("1 el")
  })
})
