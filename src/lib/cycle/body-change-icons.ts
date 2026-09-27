import {
  BatteryFull,
  Waves,
  Smile,
  Target,
  Moon,
  Brain,
  Thermometer,
  BatteryLow,
  Sparkles,
  Zap,
  Heart,
  UtensilsCrossed,
  Circle,
  Flame,
  Scale,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

/**
 * One icon per body-change label (phase-knowledge.ts / life-stage-
 * knowledge.ts). Keyed by label rather than adding an `icon` field to every
 * one of the ~49 entries across both files, since the same label ("Energie",
 * "Slaap", ...) already repeats consistently across phases/life stages.
 */
export const BODY_CHANGE_ICON: Record<string, LucideIcon> = {
  Energie: BatteryFull,
  Buikgevoel: Waves,
  Stemming: Smile,
  Concentratie: Target,
  "Concentratie en geheugen": Target,
  Slaap: Moon,
  Slaapproblemen: Moon,
  Hoofdpijn: Brain,
  Lichaamstemperatuur: Thermometer,
  Vermoeidheid: BatteryLow,
  Huid: Sparkles,
  "Huid en slijmvliezen": Sparkles,
  Stressgevoeligheid: Zap,
  Libido: Heart,
  "Honger/eetlust": UtensilsCrossed,
  Borsten: Circle,
  "Onregelmatige cyclus": Waves,
  Opvliegers: Flame,
  "Nachtelijk zweten": Moon,
  Stemmingswisselingen: Smile,
  Lichaamssamenstelling: Scale,
}

export const DEFAULT_BODY_CHANGE_ICON: LucideIcon = Circle
