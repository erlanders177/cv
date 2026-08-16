export const LOCALES = ["es", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Campo de texto que existe en los dos idiomas del sitio. */
export type Localized = Record<Locale, string>;

/**
 * Devuelve el texto en el idioma pedido y cae al otro idioma si falta.
 * Preferimos mostrar algo en el idioma equivocado antes que un hueco.
 */
export function pick(value: Localized | undefined, locale: Locale): string {
  if (!value) return "";
  return value[locale] || value[locale === "es" ? "en" : "es"] || "";
}
