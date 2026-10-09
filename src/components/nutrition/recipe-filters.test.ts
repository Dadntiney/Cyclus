import { describe, expect, it } from "vitest"
import type { RecipeCardData } from "@/lib/data/nutrition"
import {
  NO_FILTERS,
  activeSheetFilters,
  isLowCarb,
  matchesFilters,
  orderRecipes,
  parseRecipeFilters,
  recipeFiltersQuery,
  removeFilter,
  sheetFilterCount,
  type RecipeFilters,
} from "./recipe-filters"
import { formatNutritionValue, formatPrepTime, nutritionStats, recipeMetaLine } from "./recipe-format"

function recipe(overrides: Partial<RecipeCardData> & { title: string }): RecipeCardData {
  return {
    id: overrides.title,
    description: null,
    image_url: null,
    preparation_time: 20,
    servings: 2,
    is_budget: false,
    category: [],
    nutrition_information: null,
    ...overrides,
  }
}

const shakshuka = recipe({ title: "Shakshuka met feta", category: ["Ontbijt", "Vegetarisch"], preparation_time: 25 })
const stoofpot = recipe({ title: "Vlaamse stoofpot", category: ["Diner"], preparation_time: 150, is_budget: true })
const salade = recipe({
  title: "Griekse salade horiatiki",
  category: ["Lunch", "Vegetarisch"],
  preparation_time: 10,
  nutrition_information: { koolhydraten: "12g" },
})
const pho = recipe({ title: "Vietnamese pho", category: ["Diner"], preparation_time: 45 })
const all = [pho, salade, shakshuka, stoofpot]

const filters = (overrides: Partial<RecipeFilters>): RecipeFilters => ({ ...NO_FILTERS, ...overrides })

describe("orderRecipes", () => {
  it("shows every recipe under Alles: everyday first, then world cuisines", () => {
    expect(orderRecipes(all).map((r) => r.title)).toEqual([
      "Shakshuka met feta",
      "Vlaamse stoofpot",
      "Vietnamese pho",
      "Griekse salade horiatiki",
    ])
  })
})

describe("matchesFilters", () => {
  const titles = (f: RecipeFilters) => all.filter((r) => matchesFilters(r, f)).map((r) => r.title)

  it("keeps everything without filters", () => {
    expect(titles(NO_FILTERS)).toHaveLength(4)
  })

  it("filters on one meal moment", () => {
    expect(titles(filters({ meal: "Diner" }))).toEqual(["Vietnamese pho", "Vlaamse stoofpot"])
  })

  it("needs every wish (AND)", () => {
    expect(titles(filters({ wishes: ["Vegetarisch"] }))).toEqual(["Griekse salade horiatiki", "Shakshuka met feta"])
    expect(titles(filters({ wishes: ["Vegetarisch", "Koolhydraatarm"] }))).toEqual(["Griekse salade horiatiki"])
    expect(titles(filters({ wishes: ["Budget"] }))).toEqual(["Vlaamse stoofpot"])
  })

  it("treats time as a maximum (≤), so quick recipes stay in", () => {
    expect(titles(filters({ maxTime: 30 }))).toEqual(["Griekse salade horiatiki", "Shakshuka met feta"])
    expect(titles(filters({ maxTime: 45 }))).toContain("Vietnamese pho")
  })

  it("accepts any of the chosen cuisines (OR)", () => {
    expect(titles(filters({ cuisines: ["Grieks", "Vietnamees"] }))).toEqual([
      "Vietnamese pho",
      "Griekse salade horiatiki",
    ])
  })

  it("combines meal moment, wishes and time", () => {
    expect(titles(filters({ meal: "Diner", maxTime: 15 }))).toEqual([])
    expect(titles(filters({ meal: "Lunch", wishes: ["Vegetarisch"], maxTime: 15 }))).toEqual([
      "Griekse salade horiatiki",
    ])
  })
})

describe("isLowCarb", () => {
  it("reads grams from text or a number", () => {
    expect(isLowCarb({ nutrition_information: { koolhydraten: "18g" } })).toBe(true)
    expect(isLowCarb({ nutrition_information: { koolhydraten: 42 } })).toBe(false)
    expect(isLowCarb({ nutrition_information: null })).toBe(false)
  })
})

describe("active filters", () => {
  const f = filters({ meal: "Diner", wishes: ["Vegetarisch"], maxTime: 30, cuisines: ["Grieks"] })

  it("lists the sheet filters as chips, not the meal moment", () => {
    expect(activeSheetFilters(f).map((a) => a.label)).toEqual(["Vegetarisch", "Max. 30 min", "Grieks"])
    expect(sheetFilterCount(f)).toBe(3)
  })

  it("removes exactly one filter", () => {
    const [, time] = activeSheetFilters(f)
    expect(removeFilter(f, time)).toEqual({ ...f, maxTime: null })
  })
})

describe("URL", () => {
  it("round-trips the filters", () => {
    const f = filters({ meal: "Diner", wishes: ["Budget", "Vegetarisch"], maxTime: 15, cuisines: ["West-Afrikaans"] })
    const query = recipeFiltersQuery(f)
    expect(parseRecipeFilters(new URLSearchParams(query))).toEqual(f)
  })

  it("is empty without filters and ignores unknown values", () => {
    expect(recipeFiltersQuery(NO_FILTERS)).toBe("")
    expect(parseRecipeFilters(new URLSearchParams("moment=brunch&tijd=20&wens=snel,vegetarisch"))).toEqual(
      filters({ wishes: ["Vegetarisch"] }),
    )
  })
})

describe("recipe display", () => {
  it("writes long times in hours", () => {
    expect(formatPrepTime(25)).toBe("25 min")
    expect(formatPrepTime(60)).toBe("1 uur")
    expect(formatPrepTime(150)).toBe("2½ uur")
    expect(formatPrepTime(75)).toBe("1 uur 15 min")
  })

  it("makes one meta line with the meal moment and Budget", () => {
    expect(recipeMetaLine(stoofpot)).toBe("2½ uur · Diner · Budget")
    expect(recipeMetaLine(recipe({ title: "x", category: ["Snel", "Vegetarisch"], preparation_time: null }))).toBe(
      "Vegetarisch",
    )
  })

  it("puts a non-breaking space between value and unit", () => {
    expect(formatNutritionValue("koolhydraten", "42g")).toBe("42 g")
    expect(formatNutritionValue("calorieen", 520)).toBe("520 kcal")
    expect(formatNutritionValue("vet", "ca. 20")).toBe("ca. 20")
  })

  it("orders the four main values first", () => {
    expect(
      nutritionStats({ vet: "20g", vezels: "8g", calorieen: 520, eiwit: "38g" }).map((s) => s.label),
    ).toEqual(["Energie", "Eiwit", "Vet", "Vezels"])
  })
})
