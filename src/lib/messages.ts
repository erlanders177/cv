import esMessages from "../../content/i18n/es.json";
import enMessages from "../../content/i18n/en.json";
import type { Locale } from "./i18n";

/**
 * Textos de interfaz. Vive separado de `content.ts` a propósito: aquel lee
 * archivos con node:fs y solo funciona en el servidor, mientras que estos
 * mensajes también los necesitan los componentes de cliente.
 */

const MESSAGES = { es: esMessages, en: enMessages } as const;

export type Messages = typeof esMessages;

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}
