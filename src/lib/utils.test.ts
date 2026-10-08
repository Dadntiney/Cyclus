import { describe, expect, it } from "vitest"
import { cn } from "./utils"

describe("cn — GoFiev design tokens (besluit 14)", () => {
  it("lets a radius token replace another radius", () => {
    expect(cn("rounded-full", "rounded-card")).toBe("rounded-card")
    expect(cn("rounded-card", "rounded-inset")).toBe("rounded-inset")
    expect(cn("rounded-[1.25rem]", "rounded-card")).toBe("rounded-card")
    expect(cn("rounded-sheet", "rounded-xs")).toBe("rounded-xs")
  })

  it("keeps side-specific radii next to a radius token", () => {
    expect(cn("rounded-t-sheet", "sm:rounded-sheet")).toBe("rounded-t-sheet sm:rounded-sheet")
    expect(cn("rounded-sheet", "rounded-b-none")).toBe("rounded-sheet rounded-b-none")
  })

  it("treats shadow tokens as shadows, not as shadow colours", () => {
    expect(cn("shadow-sm", "shadow-control")).toBe("shadow-control")
    expect(cn("shadow-control", "shadow-elevated")).toBe("shadow-elevated")
    // a shadow colour must survive next to a shadow token
    expect(cn("shadow-elevated", "shadow-black/10")).toBe("shadow-elevated shadow-black/10")
  })

  it("treats text-numeral as a size, not as a text colour", () => {
    expect(cn("text-ink", "text-numeral")).toBe("text-ink text-numeral")
    expect(cn("text-sm", "text-numeral")).toBe("text-numeral")
  })

  it("lets a later type role replace size, line-height and family", () => {
    expect(cn("text-sm leading-tight font-sans", "type-card-title")).toBe("type-card-title")
    expect(cn("font-display text-xl", "type-section-title")).toBe("type-section-title")
  })

  it("keeps an explicit size override after a type role", () => {
    expect(cn("type-card-title", "text-sm")).toBe("type-card-title text-sm")
    expect(cn("type-card-title", "leading-snug")).toBe("type-card-title leading-snug")
  })

  it("never treats a type role as a colour, and keeps the colour", () => {
    expect(cn("text-ink-soft", "type-eyebrow")).toBe("text-ink-soft type-eyebrow")
    expect(cn("type-eyebrow", "text-sage-dark")).toBe("type-eyebrow text-sage-dark")
    expect(cn("font-medium", "type-card-title")).toBe("font-medium type-card-title")
  })

  it("lets one type role replace another", () => {
    expect(cn("type-section-title", "type-card-title")).toBe("type-card-title")
    expect(cn("type-body", "type-caption")).toBe("type-caption")
  })

  it("merges motion tokens", () => {
    expect(cn("ease-out", "ease-enter")).toBe("ease-enter")
    expect(cn("ease-enter", "ease-exit")).toBe("ease-exit")
    expect(cn("duration-150", "duration-fast")).toBe("duration-fast")
    expect(cn("duration-base", "duration-exit")).toBe("duration-exit")
    expect(cn("animate-fade-in", "animate-dialog-in")).toBe("animate-dialog-in")
    expect(cn("animate-sheet-in", "animate-sheet-out")).toBe("animate-sheet-out")
  })

  it("keeps the default behaviour for core utilities", () => {
    expect(cn("p-5", "p-4")).toBe("p-4")
    expect(cn("bg-surface", "bg-sage-soft/70")).toBe("bg-sage-soft/70")
    expect(cn("border-line", "border-line-strong")).toBe("border-line-strong")
    expect(cn("text-ink", "text-danger")).toBe("text-danger")
    expect(cn("px-4", false && "px-2", undefined, "py-3")).toBe("px-4 py-3")
  })
})
