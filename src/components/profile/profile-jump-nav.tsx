const JUMP_LINKS = [
  { href: "#beweging", label: "Modules" },
  { href: "#cyclus", label: "Cyclus" },
  { href: "#herinneringen", label: "Herinneringen" },
  { href: "#privacy", label: "Privacy" },
] as const

/**
 * Compact in-page jump strip for the long Profiel screen — helps 60+ and
 * first-time users skip past unused modules without restructuring the page.
 */
export function ProfileJumpNav() {
  return (
    <nav aria-label="Op deze pagina" className="lg:hidden -mx-1">
      <ul className="flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {JUMP_LINKS.map((link) => (
          <li key={link.href} className="shrink-0">
            <a
              href={link.href}
              className="inline-flex items-center min-h-11 px-3.5 rounded-full border border-line bg-surface text-sm font-medium text-ink-soft touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/50"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
