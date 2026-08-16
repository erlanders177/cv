import type { Locale } from "./i18n";

/**
 * "2024-03" -> "03/2024". Formato numérico a propósito: es el que los ATS
 * interpretan sin ambigüedad y no cambia de longitud entre idiomas.
 */
export function formatMonth(value: string): string {
  const [year, month] = value.split("-");
  return `${month}/${year}`;
}

export function formatPeriod(
  start: string,
  end: string | null,
  presentLabel: string,
): string {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : presentLabel}`;
}

/** Duración en meses entre dos "AAAA-MM" (fin exclusivo, hoy si es null). */
export function monthsBetween(start: string, end: string | null): number {
  const [sy, sm] = start.split("-").map(Number);
  const endDate = end ? end.split("-").map(Number) : null;
  const now = new Date();
  const [ey, em] = endDate ?? [now.getFullYear(), now.getMonth() + 1];
  return Math.max(0, (ey - sy) * 12 + (em - sm));
}

export function formatDuration(months: number, locale: Locale): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years) parts.push(locale === "es" ? `${years} a.` : `${years} yr`);
  if (rest) parts.push(locale === "es" ? `${rest} m.` : `${rest} mo`);
  return parts.join(" ") || (locale === "es" ? "< 1 m." : "< 1 mo");
}

/**
 * Edad a partir de "AAAA-MM". Como no guardamos el día, cuenta el mes
 * cumplido: durante el mes del cumpleaños devuelve ya la edad nueva.
 */
export function ageFrom(birthDate: string): number {
  return Math.floor(monthsBetween(birthDate, null) / 12);
}

/** "2026-08-15T…" -> "08/2026", para fechas ISO completas de la API. */
export function formatIsoMonth(iso: string): string {
  const date = new Date(iso);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${month}/${date.getUTCFullYear()}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
