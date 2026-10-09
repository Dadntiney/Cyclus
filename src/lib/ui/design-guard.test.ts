import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

/**
 * Design-system guard (ontwerpvisie §8 X1, besluit 36).
 *
 * Fails when a file in src/app or src/components brings back one of the
 * loose values the Ritme system replaced (docs/DESIGN_SYSTEM.md §1 and
 * §11). Fix the code — use the token or primitive from the migration
 * table — instead of adding an exception. When a file genuinely needs one,
 * add it to ALLOWLIST below with the reason.
 */

const ROOT = fileURLToPath(new URL("../../..", import.meta.url))
const SCAN_DIRS = ["src/app", "src/components"]

interface Rule {
  id: string
  pattern: RegExp
  /** Only check files whose repo path matches (default: every scanned file). */
  files?: RegExp
  hint: string
}

const RULES: Rule[] = [
  {
    id: "rounded-arbitrary",
    pattern: /\brounded(?:-[trblse]{1,2})?-\[/,
    hint: "rounded-card / rounded-inset / rounded-sheet / rounded-xs / rounded-full",
  },
  {
    id: "rounded-scale",
    pattern: /\brounded(?:-[trblse]{1,2})?-(?:sm|md|lg|xl|2xl|3xl)\b/,
    hint: "rounded-card (cards), rounded-inset (inputs, tiles), rounded-sheet (overlays)",
  },
  {
    id: "text-arbitrary-size",
    pattern: /\btext-\[(?:\d|\.\d|calc|clamp|min\(|max\()/,
    hint: "type-* roles or text-xs/sm/base (13px is the floor)",
  },
  {
    id: "focus-ring",
    pattern: /\bfocus(?:-visible)?:ring\b|\bfocus(?:-visible)?:ring-/,
    hint: "nothing: the global :focus-visible outline does the work",
  },
  {
    id: "outline-none",
    pattern: /(?<![\w-])(?:[\w-]+:)*outline-none\b/,
    hint: "nothing: never remove the global focus outline",
  },
  {
    id: "scrim-ink",
    pattern: /\bbg-ink\/45\b/,
    hint: "bg-scrim (or BottomSheet / Dialog)",
  },
  {
    id: "old-animation",
    pattern: /\banimate-(?:pop-in|page-in|page-soft)\b/,
    hint: "animate-dialog-in / animate-rise-in / animate-page-push",
  },
  {
    id: "transition-all",
    pattern: /\btransition-all\b/,
    hint: "transition-colors / transition-[width] / transition-transform",
  },
  {
    id: "loose-shadow",
    pattern: /(?<![\w-])shadow-(?:sm|md|lg|xl|2xl)\b/,
    hint: "shadow-elevated (overlays) or shadow-control (moving part of a control)",
  },
  {
    id: "scroll-margin",
    pattern: /\bscroll-mt-(?!4\b)[\w[\]-]+/,
    hint: "scroll-mt-4 only; the app bar offset is html { scroll-padding-top } (besluit 11)",
  },
  {
    id: "stroke-literal",
    // Icons take their stroke from ICON / iconProps / CHECK_STROKE.
    pattern: /\bstrokeWidth=(?:\{\s*[\d.]|"[\d.])/,
    hint: "{...ICON.sm|md|lg} or iconProps(); checkmarks CHECK_STROKE",
  },
  {
    id: "wide-page",
    pattern: /\bmax-w-(?:3xl|4xl|5xl)\b/,
    hint: "<Page> (max-w-2xl) or <Page width=\"wide\"> (max-w-6xl)",
  },
]

/**
 * Explicit exceptions: repo path → rule ids, each with its reason.
 * Keep this list short; every entry is a known deviation.
 */
const ALLOWLIST: Record<string, { rules: string[]; reason: string }> = {
  "src/components/buddy/chat-window.tsx": {
    rules: ["rounded-scale"],
    reason:
      "The Buddy composer textarea (rounded-3xl) is frozen by besluit 34; change it only in a Buddy keyboard regression pass (390×420, Enter/Shift+Enter).",
  },
  "src/components/buddy/buddy-shell.tsx": {
    rules: ["wide-page"],
    reason: "BuddyShell is frozen by besluit 34; its max-w-3xl chat column is part of the keyboard layout.",
  },
  "src/components/training/cyclus-figure.tsx": {
    rules: ["stroke-literal"],
    reason: "SVG illustration: limb and outline strokes of the exercise figure, not icons.",
  },
  "src/components/brand/droplet-mark.tsx": {
    rules: ["stroke-literal"],
    reason: "The brand droplet is a drawn mark, not a lucide icon.",
  },
  "src/components/cycle/rhythm-band.tsx": {
    rules: ["stroke-literal"],
    reason: "SVG chart: the outline of the 'today' marker on the Ritmeband.",
  },
  "src/components/training/exercise-media.tsx": {
    rules: ["loose-shadow"],
    reason: "Illustration placeholder for exercises (discover stream kept the illustration system as is).",
  },
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(tsx|ts)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(full)
  }
  return out
}

/** Comments may mention forbidden classes ("never add outline-none"). */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/(^|[^:"'`])\/\/.*$/gm, "$1")
}

function repoPath(file: string): string {
  return relative(ROOT, file).split(sep).join("/")
}

const FILES = SCAN_DIRS.flatMap((d) => walk(join(ROOT, d))).map((f) => ({
  path: repoPath(f),
  lines: stripComments(readFileSync(f, "utf8")).split("\n"),
}))

describe("design-system guard", () => {
  it("scans the app", () => {
    expect(FILES.length).toBeGreaterThan(100)
  })

  for (const rule of RULES) {
    it(`no ${rule.id} (use ${rule.hint})`, () => {
      const hits: string[] = []
      for (const file of FILES) {
        if (rule.files && !rule.files.test(file.path)) continue
        if (ALLOWLIST[file.path]?.rules.includes(rule.id)) continue
        file.lines.forEach((line, i) => {
          if (rule.pattern.test(line)) hits.push(`${file.path}:${i + 1}  ${line.trim().slice(0, 140)}`)
        })
      }
      expect(hits, `Forbidden pattern "${rule.id}". Use ${rule.hint}.`).toEqual([])
    })
  }

  it("allowlist entries are still needed", () => {
    const stale: string[] = []
    for (const [path, entry] of Object.entries(ALLOWLIST)) {
      const file = FILES.find((f) => f.path === path)
      if (!file) {
        stale.push(`${path} (file is gone)`)
        continue
      }
      for (const id of entry.rules) {
        const rule = RULES.find((r) => r.id === id)
        if (!rule || !file.lines.some((line) => rule.pattern.test(line))) stale.push(`${path} → ${id}`)
      }
    }
    expect(stale, "Remove allowlist entries that no longer match anything").toEqual([])
  })
})

/**
 * Titelregel (DESIGN_SYSTEM §12.3): every page exports `metadata.title`
 * or `generateMetadata`, so the tab, history and screen reader say where
 * she is ("Ontdek · GoFiev").
 */
const REDIRECT_ONLY_PAGES = new Set([
  // Pages that only forward to another URL never render, so need no title.
  "src/app/(app)/voor-jou/page.tsx",
  "src/app/(app)/profiel/account/page.tsx",
  "src/app/(app)/voeding/favorieten/page.tsx",
])

describe("page titles", () => {
  const pages = walk(join(ROOT, "src/app"))
    .map((f) => ({ path: repoPath(f), source: readFileSync(f, "utf8") }))
    .filter((f) => f.path.endsWith("/page.tsx"))

  it("finds the pages", () => {
    expect(pages.length).toBeGreaterThan(40)
  })

  it("every page exports a title", () => {
    const missing = pages
      .filter((p) => !REDIRECT_ONLY_PAGES.has(p.path))
      .filter((p) => !/export\s+(?:const\s+metadata\b|(?:async\s+)?function\s+generateMetadata\b)/.test(p.source))
      .map((p) => p.path)
    expect(missing).toEqual([])
  })

  it("redirect-only pages still only redirect", () => {
    for (const path of REDIRECT_ONLY_PAGES) {
      const page = pages.find((p) => p.path === path)
      expect(page, path).toBeDefined()
      expect(page!.source, path).toMatch(/\bredirect\(/)
    }
  })
})
