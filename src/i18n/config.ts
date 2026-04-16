export type Locale = 'en' | 'fr' | 'es' | 'ar'

export const locales: Locale[] = ['en', 'fr', 'es', 'ar']
export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  ar: 'العربية',
}

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  es: '🇪🇸',
  ar: '🇸🇦',
}

// RTL languages
export const rtlLocales: Locale[] = ['ar']

export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale)
}
