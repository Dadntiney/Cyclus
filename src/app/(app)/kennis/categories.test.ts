import { describe, expect, it } from "vitest"
import { categoryLabel, groupArticles, relatedArticles } from "./categories"

const articles = [
  { slug: "a", category: "overgang" },
  { slug: "b", category: "slaap" },
  { slug: "c", category: "klachten" },
  { slug: "d", category: "zorg" },
  { slug: "e", category: "iets-nieuws" },
  { slug: "f", category: "mentaal" },
]

describe("groupArticles", () => {
  it("groups in a fixed order and keeps the order inside a group", () => {
    const groups = groupArticles(articles)
    expect(groups.map((g) => g.title)).toEqual([
      "Overgang & klachten",
      "Slaap & stemming",
      "Zorg & privé",
      "Overig",
    ])
    expect(groups[0].articles.map((a) => a.slug)).toEqual(["a", "c"])
    expect(groups[1].articles.map((a) => a.slug)).toEqual(["b", "f"])
    expect(groups[3].articles.map((a) => a.slug)).toEqual(["e"])
  })

  it("never loses an article", () => {
    expect(groupArticles(articles).flatMap((g) => g.articles)).toHaveLength(articles.length)
  })
})

describe("relatedArticles", () => {
  it("prefers the same group, never the article itself", () => {
    expect(relatedArticles(articles, { slug: "b", category: "slaap" }).map((a) => a.slug)).toEqual(["f", "a", "c"])
  })
})

describe("categoryLabel", () => {
  it("reads nicely for known and unknown categories", () => {
    expect(categoryLabel("prive")).toBe("Privé")
    expect(categoryLabel("werk")).toBe("Werk")
  })
})
