import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge taught about the GoFiev tokens (docs/DESIGN_SYSTEM.md).
 * Without this, `rounded-card` would not replace `rounded-full`, and
 * `text-numeral` / `shadow-control` would be mistaken for a text/shadow
 * *colour* and silently remove `text-ink` / a shadow colour.
 *
 * `type-*` roles get their own class group: a later `type-*` replaces an
 * earlier font-size / line-height / font-family utility. The reverse is
 * deliberately not a conflict: `type-card-title text-sm` keeps the
 * Fraunces role but overrides only its size (Tailwind emits core
 * utilities after custom `@utility` rules, so the size wins in CSS too).
 */
const twMerge = extendTailwindMerge<"type-role">({
  extend: {
    theme: {
      radius: ["xs", "inset", "card", "sheet"],
      shadow: ["card", "control", "elevated"],
      text: ["numeral"],
      ease: ["enter", "standard", "exit"],
      animate: [
        "sheet-in",
        "sheet-out",
        "fade-in",
        "fade-out",
        "dialog-in",
        "dialog-out",
        "rise-in",
        "page-push",
        "pop-in",
        "page-in",
        "page-soft",
        "menstruatie-adem",
      ],
    },
    classGroups: {
      duration: [{ duration: ["press", "fast", "base", "exit", "slow"] }],
      "type-role": [
        {
          type: [
            "page-title",
            "section-title",
            "card-title",
            "numeral",
            "eyebrow",
            "group-label",
            "body-lg",
            "body",
            "caption",
          ],
        },
      ],
    },
    conflictingClassGroups: {
      "type-role": ["font-size", "leading", "font-family"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
