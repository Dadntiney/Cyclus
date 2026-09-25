export const defaultLocale = "nl-NL" as const
export const locales = [defaultLocale] as const
export type Locale = (typeof locales)[number]
