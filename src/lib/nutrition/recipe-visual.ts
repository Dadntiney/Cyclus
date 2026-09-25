import {
  Fish,
  Wheat,
  Salad,
  Flame,
  Milk,
  Drumstick,
  Citrus,
  Soup,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react"

export type RecipeTone = "sage" | "peach"

export interface RecipeVisual {
  icon: LucideIcon
  tone: RecipeTone
}

// Curated per known seed recipe so the icon actually matches the dish.
// Anything not listed here (future recipes) still gets a consistent,
// deterministic look via the fallback below instead of a generic icon.
const KNOWN_VISUALS: Record<string, RecipeVisual> = {
  "Zalm met zoete aardappel en groenten": { icon: Fish, tone: "peach" },
  "Overnight oats met bessen": { icon: Wheat, tone: "sage" },
  "Linzensalade met feta": { icon: Salad, tone: "sage" },
  "Kikkererwtencurry": { icon: Flame, tone: "peach" },
  "Griekse yoghurt met noten en honing": { icon: Milk, tone: "sage" },
  "Gegrilde kip met quinoa en groenten": { icon: Drumstick, tone: "peach" },
  "Veganistische smoothiebowl": { icon: Citrus, tone: "sage" },
  "Pittige pompoensoep": { icon: Soup, tone: "peach" },
}

const FALLBACK_ICONS = [Fish, Wheat, Salad, Flame, Milk, Drumstick, Citrus, Soup, UtensilsCrossed]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function getRecipeVisual(title: string): RecipeVisual {
  const known = KNOWN_VISUALS[title]
  if (known) return known

  const hash = hashString(title)
  return {
    icon: FALLBACK_ICONS[hash % FALLBACK_ICONS.length],
    tone: hash % 2 === 0 ? "sage" : "peach",
  }
}
