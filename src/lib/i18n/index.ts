import { defaultLocale, type Locale } from "./config"
import nlNL from "./dictionaries/nl-NL"

const dictionaries: Record<Locale, typeof nlNL> = {
  "nl-NL": nlNL,
}

export function getDictionary(locale: Locale = defaultLocale) {
  return dictionaries[locale]
}

export { defaultLocale }
export type { Locale }
