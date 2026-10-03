import { describe, expect, it } from "vitest"
import { inlineSegments, parseArticleBody, splitInlineList } from "./article-body"

const OVERGANG = `De overgang is geen plotselinge knop, maar een traject dat jaren kan duren. In de perimenopauze (de jaren ervoor) kan je cyclus onregelmatiger worden, terwijl klachten al kunnen spelen.

Veelvoorkomende signalen: veranderende menstruatie, opvliegers, nachtelijk zweten, slechter slapen, stemmingswisselingen, brain fog of een ander gevoel in je lijf.

Belangrijk: elke vrouw ervaart dit anders. Wat jij bijhoudt in GoFiev helpt je patronen te herkennen — zonder dat het een diagnose is.

Wat je zelf kunt doen: regelmatig slapen, bewegen op jouw tempo, eiwitrijke voeding en stressmomenten serieus nemen. Bij aanhoudende of hevige klachten: praat met je huisarts of gynaecoloog.`

const SLAAP = `Tijdens de slaap reguleert je lichaam herstel- en stresshormonen.

**Praktische slaaphygiëne (kies wat past, niet alles tegelijk):**
• Probeer vaste bed- en opstaatijden — ook in het weekend zo veel mogelijk.
• Dim licht en schermen in het uur voor slapen; helder blauw licht houdt je alert.

In GoFiev kun je slaap meenemen in je check-in.`

const VOEDING = `Magnesium
Vaak genoemd rondom de luteale fase en bij spierspanning. Goede bronnen: pompoenpitten, amandelen, cashewnoten, spinazie, quinoa, zwarte bonen en een stukje pure chocolade (70%+).

Per fase (globaal)
• Menstruatie: ijzer, eiwit, warmte, vocht
• Luteaal: magnesium, eiwit, vezels`

describe("parseArticleBody", () => {
  it("turns the inline signals sentence of the overgang article into a list", () => {
    const blocks = parseArticleBody(OVERGANG)
    expect(blocks[0]).toEqual({ type: "paragraph", text: expect.stringContaining("geen plotselinge knop") })
    expect(blocks[1]).toEqual({
      type: "list",
      label: "Veelvoorkomende signalen",
      items: [
        "veranderende menstruatie",
        "opvliegers",
        "nachtelijk zweten",
        "slechter slapen",
        "stemmingswisselingen",
        "brain fog",
        "een ander gevoel in je lijf",
      ],
    })
  })

  it("keeps ordinary sentences with a colon as text", () => {
    const blocks = parseArticleBody(OVERGANG)
    expect(blocks).toContainEqual({ type: "paragraph", text: expect.stringMatching(/^Belangrijk: elke vrouw/) })
    expect(blocks).toContainEqual({
      type: "paragraph",
      text: "Bij aanhoudende of hevige klachten: praat met je huisarts of gynaecoloog.",
    })
    expect(blocks).toContainEqual({
      type: "list",
      label: "Wat je zelf kunt doen",
      items: ["regelmatig slapen", "bewegen op jouw tempo", "eiwitrijke voeding", "stressmomenten serieus nemen"],
    })
  })

  it("reads bold lines as subheadings and bullets as one list", () => {
    expect(parseArticleBody(SLAAP)).toEqual([
      { type: "paragraph", text: "Tijdens de slaap reguleert je lichaam herstel- en stresshormonen." },
      { type: "heading", text: "Praktische slaaphygiëne (kies wat past, niet alles tegelijk)" },
      {
        type: "list",
        items: [
          "Probeer vaste bed- en opstaatijden — ook in het weekend zo veel mogelijk.",
          "Dim licht en schermen in het uur voor slapen; helder blauw licht houdt je alert.",
        ],
      },
      { type: "paragraph", text: "In GoFiev kun je slaap meenemen in je check-in." },
    ])
  })

  it("reads a short line above text as a subheading", () => {
    const blocks = parseArticleBody(VOEDING)
    expect(blocks[0]).toEqual({ type: "heading", text: "Magnesium" })
    expect(blocks[1]).toEqual({
      type: "paragraph",
      text: "Vaak genoemd rondom de luteale fase en bij spierspanning.",
    })
    expect(blocks[2]).toMatchObject({ type: "list", label: "Goede bronnen" })
    expect(blocks[3]).toEqual({ type: "heading", text: "Per fase (globaal)" })
    expect(blocks[4]).toEqual({
      type: "list",
      items: ["Menstruatie: ijzer, eiwit, warmte, vocht", "Luteaal: magnesium, eiwit, vezels"],
    })
  })

  it("never drops text", () => {
    const words = (s: string): string[] => s.replace(/\*\*|•/g, "").match(/[\p{L}\d]+/gu) ?? []
    for (const body of [OVERGANG, SLAAP, VOEDING]) {
      const rendered = parseArticleBody(body)
        .map((b) => (b.type === "list" ? [b.label ?? "", ...b.items].join(" ") : b.text))
        .join(" ")
      const lost = words(body).filter((w) => !["en", "of"].includes(w) && !words(rendered).includes(w))
      expect(lost).toEqual([])
    }
  })
})

describe("splitInlineList", () => {
  it("needs at least three short items", () => {
    expect(splitInlineList("Belangrijk: elke vrouw ervaart dit anders.")).toBeNull()
    expect(splitInlineList("Tip: rust en ruimte.")).toBeNull()
    expect(splitInlineList("Praktisch: vaste bedtijden, minder cafeïne na de middag, en een kort ritueel.")).toEqual({
      label: "Praktisch",
      items: ["vaste bedtijden", "minder cafeïne na de middag", "een kort ritueel"],
    })
  })

  it("keeps commas inside parentheses within one item", () => {
    expect(
      splitInlineList("Houd bij: wanneer het speelt, hoe heftig, wat je die dag verder deed (slaap, stress, beweging)."),
    ).toEqual({
      label: "Houd bij",
      items: ["wanneer het speelt", "hoe heftig", "wat je die dag verder deed (slaap, stress, beweging)"],
    })
  })
})

describe("inlineSegments", () => {
  it("shows bold text without asterisks", () => {
    expect(inlineSegments("Dit is **belangrijk** voor je.")).toEqual([
      { text: "Dit is ", strong: false },
      { text: "belangrijk", strong: true },
      { text: " voor je.", strong: false },
    ])
  })
})
