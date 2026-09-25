import { pickStyleForToday } from "@/lib/buddy/styles"

/**
 * Style-aware default text for the built-in reminder types (see
 * REMINDER_TYPE_OPTIONS in constants.ts) — used only when she hasn't typed
 * her own custom label for that reminder. "anders" has no entry: her own
 * wording always wins there, there's nothing to rephrase.
 */
const REMINDER_TYPE_STYLE_LABELS: Record<string, Partial<Record<string, string>>> = {
  dagelijkse_checkin: {
    liefdevol: "Even een momentje voor jezelf — vul je dagelijkse gegevens in. 💛",
    humor: "Ping! Tijd voor je dagelijkse update. Duurt korter dan koffie zetten. 😄",
    spiritueel: "Een klein moment van aandacht: hoe voel jij je vandaag? ✨",
    motiverend: "Kleine gewoonte, groot inzicht — vul je check-in in. 💪",
    informatief: "Tijd voor je dagelijkse check-in — zo bouw je een duidelijker beeld van je patronen op.",
    rustig: "Even een rustig moment: vul je dagelijkse gegevens in. 🌿",
    direct: "Check-in tijd. Twee minuten, klaar.",
    luchtig: "Hoi! Tijd voor je dagelijkse check-in. 😊",
  },
  symptomen: {
    liefdevol: "Voel je iets waar je bij stil wilt staan? Noteer het gerust voor jezelf. 💛",
    humor: "Even checken: doet er iets pijn, kriebelt er iets, of is alles rustig vandaag? 😄",
    spiritueel: "Neem even de tijd om te voelen wat er in je lichaam speelt. ✨",
    motiverend: "Klachten bijhouden helpt je patronen te herkennen — vul ze even in. 💪",
    informatief: "Tijd om eventuele klachten te noteren — dat helpt bij het herkennen van patronen over meerdere cycli.",
    rustig: "Even rustig nagaan: merk je vandaag iets bij jezelf? 🌿",
    direct: "Klachten van vandaag? Noteer ze nu.",
    luchtig: "Even je lijf checken en opschrijven wat je merkt. 😊",
  },
  beweging: {
    liefdevol: "Als het past: een moment van beweging kan je goed doen. Geen druk. 💛",
    humor: "Je stoel mist je niet zo erg als je denkt — tijd om even te bewegen. 😄",
    spiritueel: "Een moment van beweging kan ook een moment van verbinding met je lichaam zijn. ✨",
    motiverend: "Tijd om te bewegen — zet die eerste stap. 💪",
    informatief: "Tijd om te bewegen — regelmatige lichte beweging kan bijdragen aan meer energie.",
    rustig: "Een rustig moment van beweging kan nu goed voelen. 🌿",
    direct: "Tijd om te bewegen. Doe het.",
    luchtig: "Even in beweging komen? Nu is een prima moment. 😊",
  },
  routine: {
    liefdevol: "Tijd voor jouw eigen routine — iets wat alleen van jou is. 💛",
    humor: "Herinnering: jij hebt ook nog een leven naast deze app. Tijd voor jouw routine. 😄",
    spiritueel: "Een moment voor je eigen routine — een klein ritueel dat bij jou hoort. ✨",
    motiverend: "Tijd voor jouw routine — iets kleins dat jij belangrijk vindt. 💪",
    informatief: "Tijd voor jouw persoonlijke routine.",
    rustig: "Een rustig moment voor jouw eigen routine. 🌿",
    direct: "Tijd voor je routine.",
    luchtig: "Hoi! Tijd voor jouw eigen dingetje. 😊",
  },
}

/**
 * Resolves the toast/notification text for a reminder: her own custom
 * label always wins; otherwise a style-flavored default when she has a
 * Buddy-stijl preference, falling back to the existing neutral default.
 */
export function resolveReminderText(
  type: string,
  customLabel: string | null | undefined,
  defaultLabel: string,
  preferredStyles: string[],
  seed: string,
): string {
  if (customLabel?.trim()) return customLabel.trim()
  const style = pickStyleForToday(seed, preferredStyles)
  const styled = style ? REMINDER_TYPE_STYLE_LABELS[type]?.[style] : undefined
  return styled ?? (defaultLabel || "Even een herinnering voor je.")
}
