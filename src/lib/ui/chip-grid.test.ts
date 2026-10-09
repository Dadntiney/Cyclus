import { describe, expect, it } from "vitest"
import { chipGridCellWidth, chipLabelsFit, FILL_CHIP_AIR, FILL_CHIP_INSET } from "./chip-grid"

// Label widths measured with Plus Jakarta Sans 15px/500 (text-sm font-medium).
const GEMIDDELD = 81.6
const ERNSTIG = 50.1

// Content width of a page or sheet: viewport − 2 × 20px gutter.
const IPHONE_13 = 390 - 40
const IPHONE_SE_1 = 320 - 40
// Same, inside a Card (p-5 + 1px border on both sides).
const IPHONE_13_IN_CARD = IPHONE_13 - 42

describe("chip grid fit (besluit 17)", () => {
  it("splits the container into equal cells minus the gaps", () => {
    expect(chipGridCellWidth({ containerWidth: 350, gap: 8, columns: 4 })).toBe(81.5)
    expect(chipGridCellWidth({ containerWidth: 280, gap: 8, columns: 2 })).toBe(136)
    expect(chipGridCellWidth({ containerWidth: 280, gap: 8, columns: 0 })).toBe(0)
  })

  it("keeps four columns for short labels on a 390px phone", () => {
    expect(chipLabelsFit({ containerWidth: IPHONE_13, gap: 8, columns: 4, widestLabel: ERNSTIG })).toBe(true)
  })

  it("does not fit 'Gemiddeld' in four columns on a 390px phone", () => {
    expect(chipLabelsFit({ containerWidth: IPHONE_13, gap: 8, columns: 4, widestLabel: GEMIDDELD })).toBe(false)
    // …but two columns are fine, also on the smallest phone
    expect(chipLabelsFit({ containerWidth: IPHONE_SE_1, gap: 8, columns: 2, widestLabel: GEMIDDELD })).toBe(true)
  })

  it("measures the real container, not the viewport (a card is narrower)", () => {
    expect(chipLabelsFit({ containerWidth: IPHONE_13_IN_CARD, gap: 8, columns: 4, widestLabel: ERNSTIG })).toBe(true)
    expect(chipLabelsFit({ containerWidth: IPHONE_SE_1 - 42, gap: 8, columns: 4, widestLabel: ERNSTIG })).toBe(false)
  })

  it("needs the chip inset plus a little air around the label", () => {
    const cell = chipGridCellWidth({ containerWidth: 344, gap: 8, columns: 4 }) // 80
    const exact = cell - FILL_CHIP_INSET - FILL_CHIP_AIR
    expect(chipLabelsFit({ containerWidth: 344, gap: 8, columns: 4, widestLabel: exact })).toBe(true)
    expect(chipLabelsFit({ containerWidth: 344, gap: 8, columns: 4, widestLabel: exact + 0.5 })).toBe(false)
  })

  it("never claims a fit for a hidden (zero-width) container", () => {
    expect(chipLabelsFit({ containerWidth: 0, gap: 8, columns: 4, widestLabel: 10 })).toBe(false)
  })
})
