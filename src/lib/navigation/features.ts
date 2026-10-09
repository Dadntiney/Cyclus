import {
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  CalendarDays,
  CalendarHeart,
  ClipboardList,
  Compass,
  Footprints,
  Heart,
  Layers,
  MessageCircleHeart,
  Moon,
  NotebookPen,
  Palette,
  Pill,
  Salad,
  Settings2,
  Shield,
  ShoppingCart,
  Stethoscope,
  Sun,
  Sunset,
  User,
  UserRound,
  Waves,
  type LucideIcon,
} from "lucide-react"

/**
 * One source for every destination in the app: its name, icon, URL and the
 * tab it belongs to (ontwerpvisie §4.3–4.4). The name is used everywhere the
 * destination is mentioned — the link, the page's h1, the compact title in
 * the app bar and the back label of the next screen ("link = h1 = terug").
 *
 * Page streams import from here instead of typing names by hand, so
 * "Mijn mentale rust" vs "Mentale rust" can never drift apart again.
 */

/** The five tab roots, in tab-bar order. */
export type TabHref = "/vandaag" | "/ontdek" | "/cyclus" | "/buddy" | "/profiel"

export interface Feature {
  /** Canonical URL (URLs never change this round; only names do). */
  href: string
  /** The one name: link text, h1, app-bar title and back label. */
  label: string
  /** The one icon for this concept (outline; filled only to mean "bewaard"). */
  icon: LucideIcon
  /** Tab that owns this route on a deep link or reload (§4.3). */
  tab: TabHref
  /**
   * Wording for a contextual link when it differs from `label`, e.g. the
   * "Hele week" action on Vandaag that opens Deze week.
   */
  linkLabel?: string
  /**
   * The one description under the name in a list row (Profiel, Over
   * Buddy), for destinations listed in more than one place.
   */
  description?: string
}

export const FEATURES = {
  // Vandaag
  vandaag: { href: "/vandaag", label: "Vandaag", icon: Sun, tab: "/vandaag" },
  week: { href: "/deze-week", label: "Deze week", icon: CalendarDays, tab: "/vandaag", linkLabel: "Hele week" },
  boodschappen: {
    href: "/deze-week/boodschappen",
    label: "Boodschappen",
    icon: ShoppingCart,
    tab: "/vandaag",
    linkLabel: "Boodschappen voor vandaag",
  },

  // Ontdek
  ontdek: { href: "/ontdek", label: "Ontdek", icon: Compass, tab: "/ontdek" },
  voeding: { href: "/voeding", label: "Voeding", icon: Salad, tab: "/ontdek" },
  beweging: { href: "/training", label: "Beweging", icon: Footprints, tab: "/ontdek" },
  mentaleRust: { href: "/mentale-rust", label: "Mentale rust", icon: Brain, tab: "/ontdek" },
  kennis: { href: "/kennis", label: "Kennis", icon: BookOpen, tab: "/ontdek" },
  favorieten: { href: "/favorieten", label: "Favorieten", icon: Heart, tab: "/ontdek" },

  // Cyclus
  cyclus: { href: "/cyclus", label: "Cyclus", icon: CalendarHeart, tab: "/cyclus" },
  fase: { href: "/cyclus/vandaag", label: "Jouw fase", icon: Waves, tab: "/cyclus", linkLabel: "Over jouw fase" },
  overgang: { href: "/cyclus/overgang", label: "De overgang", icon: Sunset, tab: "/cyclus" },
  voorJeArts: { href: "/cyclus/samenvatting", label: "Voor je arts", icon: Stethoscope, tab: "/cyclus" },
  klachtenlast: { href: "/cyclus/klachtenlast", label: "Klachtenlast", icon: ClipboardList, tab: "/cyclus" },
  slaap: { href: "/slaap", label: "Slaap", icon: Moon, tab: "/cyclus" },

  // Buddy
  buddy: { href: "/buddy", label: "Buddy", icon: MessageCircleHeart, tab: "/buddy" },

  // Profiel
  profiel: { href: "/profiel", label: "Profiel", icon: User, tab: "/profiel" },
  dagboek: { href: "/dagboek", label: "Dagboek", icon: NotebookPen, tab: "/profiel" },
  medicatie: { href: "/medicatie", label: "Medicatie", icon: Pill, tab: "/profiel" },
  voortgang: { href: "/profiel/voortgang", label: "Voortgang", icon: BarChart3, tab: "/profiel" },
  gegevens: { href: "/profiel/gegevens", label: "Persoonlijke gegevens", icon: UserRound, tab: "/profiel" },
  cyclusinstellingen: { href: "/profiel/cyclus", label: "Cyclusinstellingen", icon: Settings2, tab: "/profiel" },
  gebruik: { href: "/profiel/gebruik", label: "Wat ik gebruik", icon: Layers, tab: "/profiel" },
  meldingen: { href: "/profiel/meldingen", label: "Meldingen", icon: Bell, tab: "/profiel" },
  buddyStijl: {
    href: "/profiel/buddy",
    label: "Buddy-stijl",
    icon: Palette,
    tab: "/profiel",
    description: "Toon en hoe vaak Buddy van zich laat horen",
  },
  privacy: {
    href: "/profiel/privacy",
    label: "Privacy",
    icon: Shield,
    tab: "/profiel",
    description: "Toestemming en je gegevens",
  },
} as const satisfies Record<string, Feature>

export type FeatureKey = keyof typeof FEATURES

/** Document title and h1 when a record (recipe, article, …) does not exist. */
export const NOT_FOUND_TITLE = "Pagina niet gevonden"

/** The five tabs, in order. */
export const TAB_FEATURES = [
  FEATURES.vandaag,
  FEATURES.ontdek,
  FEATURES.cyclus,
  FEATURES.buddy,
  FEATURES.profiel,
] as const

export const TAB_ROOTS: readonly TabHref[] = TAB_FEATURES.map((f) => f.href)

/**
 * Route ownership (§4.3). A prefix owns itself and everything below it.
 * Order matters only for readability; prefixes do not overlap.
 */
const OWNERSHIP: ReadonlyArray<readonly [prefix: string, tab: TabHref]> = [
  ["/vandaag", "/vandaag"],
  ["/deze-week", "/vandaag"],
  ["/ontdek", "/ontdek"],
  ["/voeding", "/ontdek"],
  ["/training", "/ontdek"],
  ["/mentale-rust", "/ontdek"],
  ["/kennis", "/ontdek"],
  ["/favorieten", "/ontdek"],
  ["/cyclus", "/cyclus"],
  ["/slaap", "/cyclus"],
  ["/buddy", "/buddy"],
  ["/profiel", "/profiel"],
  ["/dagboek", "/profiel"],
  ["/medicatie", "/profiel"],
]

/** Path without query, hash or trailing slash ("/" stays "/"). */
export function normalizePath(path: string): string {
  let p = path
  const cut = p.search(/[?#]/)
  if (cut !== -1) p = p.slice(0, cut)
  if (p.length > 1 && p.endsWith("/")) p = p.replace(/\/+$/, "")
  return p || "/"
}

function isUnder(path: string, base: string): boolean {
  return path === base || path.startsWith(`${base}/`)
}

/**
 * Is this a screen of the app itself, owned by one of the five tabs? The
 * welcome page, login, registration, onboarding and the legal pages are
 * not. Once she is in the app those are never "the previous screen":
 * after logging in, back must not lead to the login form.
 */
export function isAppPath(path: string): boolean {
  const p = normalizePath(path)
  return OWNERSHIP.some(([prefix]) => isUnder(p, prefix))
}

export function isTabRoot(path: string): path is TabHref {
  return (TAB_ROOTS as readonly string[]).includes(normalizePath(path))
}

/**
 * The tab that canonically owns a route — used on a deep link, a push
 * notification or a reload without history, and on the server. Anything
 * unknown belongs to Vandaag.
 */
export function ownerTab(path: string): TabHref {
  const p = normalizePath(path)
  for (const [prefix, tab] of OWNERSHIP) {
    if (isUnder(p, prefix)) return tab
  }
  return "/vandaag"
}

const BY_HREF: ReadonlyMap<string, Feature> = new Map(
  Object.values(FEATURES).map((f) => [f.href, f as Feature]),
)

/** The feature living exactly at this path (no dynamic routes). */
export function featureForPath(path: string): Feature | null {
  return BY_HREF.get(normalizePath(path)) ?? null
}

/** The fixed name of a route, or null for dynamic pages (recipe, article …). */
export function titleForPath(path: string): string | null {
  return featureForPath(path)?.label ?? null
}

/**
 * The logical parent of a route: the nearest known destination above it,
 * else the tab that owns it. Used for "‹ Vorige" when there is no history
 * (deep link, reload in a fresh tab). Tab roots have no parent.
 */
export function parentOf(path: string): { href: string; label: string } | null {
  const p = normalizePath(path)
  if (isTabRoot(p)) return null
  let up = p
  while (up.lastIndexOf("/") > 0) {
    up = up.slice(0, up.lastIndexOf("/"))
    const feature = BY_HREF.get(up)
    if (feature) return { href: feature.href, label: feature.label }
  }
  const tab = BY_HREF.get(ownerTab(p))
  return tab ? { href: tab.href, label: tab.label } : null
}
